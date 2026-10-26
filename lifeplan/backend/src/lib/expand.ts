import type { DayPlanContent, ExerciseItem, WeekPlanTemplate } from './types';
import { generateDailySchedule } from './schedule';

export interface ExpandOptions {
  freeTime?: 'morning' | 'evening';
  mealsPerDay?: number;
  startDate?: string;
  targetKcal?: number;
  weightKg?: number;
  goal?: string;
  routineType?: 'work' | 'study' | 'shift' | 'freelance' | 'flexible';
  wakeTime?: string;
  bedTime?: string;
  workStart?: string;
  workEnd?: string;
  workoutTime?: string;
}

function adjustProgression(items: ExerciseItem[], isRest: boolean, weekNo: number): ExerciseItem[] {
  return items.map((w) => {
    if (isRest) return { ...w };

    if (weekNo === 1) {
      return { ...w };
    } else if (weekNo === 2) {
      return {
        ...w,
        sets: w.sets ? w.sets + 1 : w.sets,
        duration_min: w.duration_min ? w.duration_min + 5 : w.duration_min,
      };
    } else if (weekNo === 3) {
      return {
        ...w,
        sets: w.sets ? w.sets + 1 : w.sets,
        reps: typeof w.reps === 'number' ? w.reps + 2 : w.reps,
        duration_min: w.duration_min ? w.duration_min + 5 : w.duration_min,
      };
    } else if (weekNo === 4) {
      // Deload: reduce volume by ~30%
      return {
        ...w,
        sets: w.sets ? Math.max(2, w.sets - 1) : w.sets,
        duration_min: w.duration_min ? Math.max(15, Math.round(w.duration_min * 0.7)) : w.duration_min,
      };
    } else {
      // Days 29-30: baseline reflection
      return { ...w };
    }
  });
}

export function expandWeekTo30Days(
  template: WeekPlanTemplate,
  options: ExpandOptions = {},
): DayPlanContent[] {
  const result: DayPlanContent[] = [];
  const baseDays = template.days;
  const numBase = baseDays.length;

  for (let dayNo = 1; dayNo <= 30; dayNo++) {
    // Map to day of week (0 to 6)
    const baseIndex = (dayNo - 1) % numBase;
    const baseDay = baseDays[baseIndex];

    const weekNo = Math.ceil(dayNo / 7);

    // Adjust workout progression based on week
    const adjustedHome = adjustProgression(baseDay.workout, baseDay.is_rest, weekNo);
    const adjustedGym = baseDay.workout_gym
      ? adjustProgression(baseDay.workout_gym, baseDay.is_rest, weekNo)
      : undefined;

    const schedule = generateDailySchedule({
      freeTime: options.freeTime,
      mealsPerDay: options.mealsPerDay,
      isRest: baseDay.is_rest,
      routineType: options.routineType,
      wakeTime: options.wakeTime,
      bedTime: options.bedTime,
      workStart: options.workStart,
      workEnd: options.workEnd,
      workoutTime: options.workoutTime,
    });

    const totalKcal = baseDay.meals.reduce((sum, m) => sum + (m.kcal || 0), 0);
    const totalProteinG = baseDay.meals.reduce((sum, m) => sum + (m.protein_g || 0), 0);

    // Calculate estimated burned calories for workout and daily activity
    const baseBurnMap: Record<number, number> = {
      0: 420, // Day 1: ช่วงล่างและแกนกลาง
      1: 380, // Day 2: ช่วงบนและหลัง
      2: 150, // Day 3: ยืดเหยียดฟื้นฟู
      3: 460, // Day 4: คาร์ดิโอความทนทาน
      4: 440, // Day 5: รวมทั้งตัว
      5: 350, // Day 6: แกนกลางและยืดหยุ่น
      6: 120, // Day 7: พักผ่อน/เดินเบาๆ
    };
    const baseBurn = baseBurnMap[baseIndex] || 320;
    const weekBonus = weekNo === 2 ? 30 : weekNo === 3 ? 60 : weekNo === 4 ? -40 : 0;
    const burnedKcal = Math.max(100, baseBurn + weekBonus);

    result.push({
      day_no: dayNo,
      is_rest: baseDay.is_rest,
      focus: baseDay.focus,
      workout: adjustedHome,
      workout_home: adjustedHome,
      workout_gym: adjustedGym,
      meals: baseDay.meals,
      schedule,
      total_kcal: totalKcal,
      total_protein_g: totalProteinG,
      burned_kcal: burnedKcal,
    });
  }

  return result;
}
