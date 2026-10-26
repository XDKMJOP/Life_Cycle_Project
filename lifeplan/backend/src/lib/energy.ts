export type Sex = 'male' | 'female';
export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
export type Goal = 'lose_weight' | 'maintain' | 'build_muscle';

export const ACTIVITY_FACTOR: Record<ActivityLevel, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  very_active: 1.9,
};

export const GOAL_ADJUSTMENT: Record<Goal, number> = {
  lose_weight: -500,
  maintain: 0,
  build_muscle: 300,
};

/** Mifflin-St Jeor: BMR (kcal/day) */
export function calcBMR(p: { sex: Sex; weightKg: number; heightCm: number; age: number }): number {
  const base = 10 * p.weightKg + 6.25 * p.heightCm - 5 * p.age;
  return Math.round(p.sex === 'male' ? base + 5 : base - 161);
}

export function calcTDEE(bmr: number, activity: ActivityLevel): number {
  return Math.round(bmr * ACTIVITY_FACTOR[activity]);
}

/** แคลอรี่เป้าหมายตาม goal โดยไม่ต่ำกว่า BMR เพื่อความปลอดภัย */
export function calcTarget(tdee: number, goal: Goal, bmr: number): number {
  return Math.max(Math.round(tdee + GOAL_ADJUSTMENT[goal]), bmr);
}

export function calcEnergy(p: {
  sex: Sex;
  weightKg: number;
  heightCm: number;
  age: number;
  activity: ActivityLevel;
  goal: Goal;
}) {
  const bmr = calcBMR(p);
  const tdee = calcTDEE(bmr, p.activity);
  const target = calcTarget(tdee, p.goal, bmr);
  return { bmr, tdee, target };
}
