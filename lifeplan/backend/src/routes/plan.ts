import { Router } from 'express';
import type { ResultSetHeader, RowDataPacket } from 'mysql2';
import { generateWeekTemplate } from '../lib/ai';
import { pool } from '../lib/db';
import { expandWeekTo30Days } from '../lib/expand';
import { generate30DayPlanForSex, shuffleMealsForDay } from '../lib/fallback';
import { requireAuth, type AuthedRequest } from '../middleware/auth';

export const planRouter = Router();
planRouter.use(requireAuth);

// POST /plan/generate - Generate 30-day plan
planRouter.post('/generate', async (req: AuthedRequest, res) => {
  const userId = req.userId;
  if (!userId) return res.status(401).json({ error: 'unauthorized' });

  // 1. Fetch user profile
  const [profiles] = await pool.query<RowDataPacket[]>(
    'SELECT * FROM profiles WHERE user_id = ?',
    [userId],
  );
  if (!profiles.length) {
    return res.status(400).json({ error: 'กรุณากรอกข้อมูลโปรไฟล์ก่อนสร้างแผน' });
  }

  const p = profiles[0];

  // 2. Generate 7-day template via AI / Mock
  const { template } = await generateWeekTemplate({
    name: p.name,
    sex: p.sex,
    age: p.age,
    heightCm: Number(p.height_cm),
    weightKg: Number(p.weight_kg),
    goal: p.goal,
    targetKcal: p.target_kcal,
    mealsPerDay: p.meals_per_day,
    freeTime: p.free_time,
    injuries: p.injuries,
  });

  // 3. Generate 30 days plan with gender-specific 50 exercises evenly distributed (25 equipment / 25 bodyweight)
  const targetKcal = Number(p.target_kcal) || 2000;
  const weightKg = Number(p.weight_kg) || 70;
  const thirtyDays = generate30DayPlanForSex(p.sex === 'female' ? 'female' : 'male', {
    freeTime: p.free_time,
    mealsPerDay: p.meals_per_day,
    targetKcal,
    weightKg,
    goal: p.goal,
    routineType: p.routine_type,
    wakeTime: p.wake_time,
    bedTime: p.bed_time,
    workStart: p.work_start,
    workEnd: p.work_end,
    workoutTime: p.workout_time,
  });

  // 4. Save to database transactionally
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    // Deactivate previous plans
    await conn.query('UPDATE plans SET is_active = 0 WHERE user_id = ?', [userId]);

    // Insert new plan
    const todayStr = new Date().toISOString().slice(0, 10);
    const [planRes] = await conn.query<ResultSetHeader>(
      'INSERT INTO plans (user_id, start_date, is_active) VALUES (?, ?, 1)',
      [userId, todayStr],
    );
    const planId = planRes.insertId;

    // Insert 30 plan days
    for (const day of thirtyDays) {
      await conn.query(
        'INSERT INTO plan_days (plan_id, day_no, content, completed_at) VALUES (?, ?, ?, NULL)',
        [planId, day.day_no, JSON.stringify(day)],
      );
    }

    await conn.commit();
    res.status(201).json({ ok: true, planId, totalDays: 30 });
  } catch (err) {
    await conn.rollback();
    console.error('Plan generation failed in DB transaction:', err);
    res.status(500).json({ error: 'ไม่สามารถบันทึกแผนลงฐานข้อมูลได้' });
  } finally {
    conn.release();
  }
});

// GET /plan/current - Get current active plan overview
planRouter.get('/current', async (req: AuthedRequest, res) => {
  const userId = req.userId;
  const [plans] = await pool.query<RowDataPacket[]>(
    'SELECT * FROM plans WHERE user_id = ? AND is_active = 1 ORDER BY id DESC LIMIT 1',
    [userId],
  );

  if (!plans.length) {
    return res.json({ hasPlan: false });
  }

  const activePlan = plans[0];
  const [days] = await pool.query<RowDataPacket[]>(
    `SELECT id, day_no, completed_at,
            JSON_UNQUOTE(JSON_EXTRACT(content, '$.focus')) as focus,
            JSON_EXTRACT(content, '$.is_rest') as is_rest,
            JSON_EXTRACT(content, '$.total_kcal') as total_kcal,
            JSON_EXTRACT(content, '$.total_protein_g') as total_protein_g,
            JSON_EXTRACT(content, '$.burned_kcal') as burned_kcal
     FROM plan_days
     WHERE plan_id = ?
     ORDER BY day_no ASC`,
    [activePlan.id],
  );

  const baseBurns = [420, 380, 150, 460, 440, 350, 120];

  res.json({
    hasPlan: true,
    planId: activePlan.id,
    startDate: activePlan.start_date,
    days: days.map((d) => {
      const baseIndex = (d.day_no - 1) % 7;
      const weekNo = Math.ceil(d.day_no / 7);
      const bonus = weekNo === 2 ? 30 : weekNo === 3 ? 60 : weekNo === 4 ? -40 : 0;
      const fallbackBurn = Math.max(100, (baseBurns[baseIndex] || 320) + bonus);
      const burnedKcal = d.burned_kcal !== null && d.burned_kcal !== undefined ? Number(d.burned_kcal) : fallbackBurn;

      return {
        id: d.id,
        dayNo: d.day_no,
        focus: d.focus,
        isRest: Boolean(d.is_rest),
        totalKcal: d.total_kcal,
        totalProteinG: d.total_protein_g,
        burnedKcal,
        completedAt: d.completed_at,
      };
    }),
  });
});

// GET /plan/days/:dayNo - Get detailed content for specific day
planRouter.get('/days/:dayNo', async (req: AuthedRequest, res) => {
  const userId = req.userId;
  const dayNo = Number(req.params.dayNo);

  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT pd.id, pd.day_no, pd.content, pd.completed_at
     FROM plan_days pd
     JOIN plans p ON pd.plan_id = p.id
     WHERE p.user_id = ? AND p.is_active = 1 AND pd.day_no = ?
     LIMIT 1`,
    [userId, dayNo],
  );

  if (!rows.length) {
    return res.status(404).json({ error: 'ไม่พบข้อมูลแผนสำหรับวันที่ระบุ' });
  }

  const r = rows[0];
  res.json({
    id: r.id,
    dayNo: r.day_no,
    completedAt: r.completed_at,
    content: typeof r.content === 'string' ? JSON.parse(r.content) : r.content,
  });
});

// PATCH /plan/days/:dayNo/complete - Toggle completed state
planRouter.patch('/days/:dayNo/complete', async (req: AuthedRequest, res) => {
  const userId = req.userId;
  const dayNo = Number(req.params.dayNo);

  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT pd.id, pd.completed_at
     FROM plan_days pd
     JOIN plans p ON pd.plan_id = p.id
     WHERE p.user_id = ? AND p.is_active = 1 AND pd.day_no = ?
     LIMIT 1`,
    [userId, dayNo],
  );

  if (!rows.length) {
    return res.status(404).json({ error: 'ไม่พบข้อมูลแผนสำหรับวันที่ระบุ' });
  }

  const current = rows[0];
  const newCompletedAt = current.completed_at ? null : new Date();

  await pool.query(
    'UPDATE plan_days SET completed_at = ? WHERE id = ?',
    [newCompletedAt, current.id],
  );

  res.json({ ok: true, completedAt: newCompletedAt });
});

// POST /plan/days/:dayNo/shuffle-meals - Shuffle meals for a day (or single meal slot)
planRouter.post('/days/:dayNo/shuffle-meals', async (req: AuthedRequest, res) => {
  const userId = req.userId;
  const dayNo = Number(req.params.dayNo);
  const { slot } = req.body || {};

  // 1. Fetch user profile target kcal & meals_per_day
  const [profiles] = await pool.query<RowDataPacket[]>(
    'SELECT target_kcal, meals_per_day, weight_kg, goal FROM profiles WHERE user_id = ?',
    [userId]
  );
  const p = profiles[0] || {};
  const targetKcal = Number(p.target_kcal) || 2000;
  const mealsPerDay = Number(p.meals_per_day) || 3;

  // 2. Fetch current plan day
  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT pd.id, pd.day_no, pd.content, pd.completed_at
     FROM plan_days pd
     JOIN plans p ON pd.plan_id = p.id
     WHERE p.user_id = ? AND p.is_active = 1 AND pd.day_no = ?
     LIMIT 1`,
    [userId, dayNo]
  );

  if (!rows.length) {
    return res.status(404).json({ error: 'ไม่พบข้อมูลแผนสำหรับวันที่ระบุ' });
  }

  const r = rows[0];
  const content = typeof r.content === 'string' ? JSON.parse(r.content) : r.content;

  // 3. Shuffle meals
  const newMeals = shuffleMealsForDay(
    dayNo,
    targetKcal,
    mealsPerDay,
    slot,
    content.meals
  );

  const totalKcal = newMeals.reduce((s, m) => s + m.kcal, 0);
  const totalProtein = Math.round(newMeals.reduce((s, m) => s + m.protein_g, 0) * 10) / 10;

  content.meals = newMeals;
  content.total_kcal = totalKcal;
  content.total_protein_g = totalProtein;

  // 4. Update in database
  await pool.query(
    'UPDATE plan_days SET content = ? WHERE id = ?',
    [JSON.stringify(content), r.id]
  );

  res.json({
    ok: true,
    dayNo,
    content,
  });
});

