import { Router } from 'express';
import { z } from 'zod';
import type { RowDataPacket } from 'mysql2';
import { pool } from '../lib/db';
import { calcEnergy } from '../lib/energy';
import { generateDailySchedule } from '../lib/schedule';
import { requireAuth, type AuthedRequest } from '../middleware/auth';

export const profileRouter = Router();
profileRouter.use(requireAuth);

const profileSchema = z.object({
  name: z.string().min(1).max(100),
  sex: z.enum(['male', 'female']),
  age: z.number().int().min(10).max(100),
  heightCm: z.number().min(100).max(250),
  weightKg: z.number().min(25).max(300),
  activityLevel: z.enum(['sedentary', 'light', 'moderate', 'active', 'very_active']),
  goal: z.enum(['lose_weight', 'maintain', 'build_muscle']),
  freeTime: z.enum(['morning', 'evening']).default('evening'),
  mealsPerDay: z.number().int().min(2).max(5).default(3),
  injuries: z.string().max(500).nullish(),
  routineType: z.enum(['work', 'study', 'shift', 'freelance', 'flexible']).default('work'),
  wakeTime: z.string().max(10).default('07:00'),
  bedTime: z.string().max(10).default('23:00'),
  workStart: z.string().max(10).default('09:00'),
  workEnd: z.string().max(10).default('18:00'),
  workoutTime: z.string().max(10).default('18:30'),
});

profileRouter.get('/', async (req: AuthedRequest, res) => {
  const [rows] = await pool.query<RowDataPacket[]>('SELECT * FROM profiles WHERE user_id = ?', [req.userId]);
  if (!rows.length) return res.status(404).json({ error: 'profile not found' });
  res.json(rows[0]);
});

profileRouter.put('/', async (req: AuthedRequest, res) => {
  const parsed = profileSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'invalid input', details: parsed.error.issues });
  const p = parsed.data;

  const { bmr, tdee, target } = calcEnergy({
    sex: p.sex,
    weightKg: p.weightKg,
    heightCm: p.heightCm,
    age: p.age,
    activity: p.activityLevel,
    goal: p.goal,
  });

  await pool.query(
    `INSERT INTO profiles
      (user_id, name, sex, age, height_cm, weight_kg, activity_level, goal, free_time, meals_per_day, injuries, bmr, tdee, target_kcal,
       routine_type, wake_time, bed_time, work_start, work_end, workout_time)
     VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
     ON DUPLICATE KEY UPDATE
      name=VALUES(name), sex=VALUES(sex), age=VALUES(age), height_cm=VALUES(height_cm),
      weight_kg=VALUES(weight_kg), activity_level=VALUES(activity_level), goal=VALUES(goal),
      free_time=VALUES(free_time), meals_per_day=VALUES(meals_per_day), injuries=VALUES(injuries),
      bmr=VALUES(bmr), tdee=VALUES(tdee), target_kcal=VALUES(target_kcal),
      routine_type=VALUES(routine_type), wake_time=VALUES(wake_time), bed_time=VALUES(bed_time),
      work_start=VALUES(work_start), work_end=VALUES(work_end), workout_time=VALUES(workout_time)`,
    [
      req.userId, p.name, p.sex, p.age, p.heightCm, p.weightKg, p.activityLevel, p.goal,
      p.freeTime, p.mealsPerDay, p.injuries ?? null, bmr, tdee, target,
      p.routineType, p.wakeTime, p.bedTime, p.workStart, p.workEnd, p.workoutTime,
    ],
  );

  // Synchronize routine schedule across active plan days if plan exists
  try {
    const [plans] = await pool.query<RowDataPacket[]>(
      'SELECT id FROM plans WHERE user_id = ? AND is_active = 1 ORDER BY id DESC LIMIT 1',
      [req.userId]
    );
    if (plans.length > 0) {
      const planId = plans[0].id;
      const [days] = await pool.query<RowDataPacket[]>(
        'SELECT id, day_no, content FROM plan_days WHERE plan_id = ?',
        [planId]
      );
      for (const d of days) {
        const content = typeof d.content === 'string' ? JSON.parse(d.content) : d.content;
        content.schedule = generateDailySchedule({
          freeTime: p.freeTime,
          mealsPerDay: p.mealsPerDay,
          isRest: Boolean(content.is_rest),
          routineType: p.routineType,
          wakeTime: p.wakeTime,
          bedTime: p.bedTime,
          workStart: p.workStart,
          workEnd: p.workEnd,
          workoutTime: p.workoutTime,
        });
        await pool.query('UPDATE plan_days SET content = ? WHERE id = ?', [JSON.stringify(content), d.id]);
      }
    }
  } catch (syncErr) {
    console.warn('Failed to sync plan schedule:', syncErr);
  }

  res.json({ bmr, tdee, targetKcal: target, ok: true });
});
