import type { ScheduleItem } from './schedule';

export interface ExerciseItem {
  exercise_id: string;
  name_th?: string;
  sets?: number | null;
  reps?: string | number | null;
  duration_min?: number | null;
  rest_sec?: number | null;
}

export interface MealItem {
  slot: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  title: string;
  kcal: number;
  protein_g: number;
  description: string;
  image?: string;
  price_thb?: number;
  source?: string;
  boosters?: string[];
}

export interface DayTemplate {
  day: number;
  is_rest: boolean;
  focus: string;
  workout: ExerciseItem[];
  workout_gym?: ExerciseItem[];
  meals: MealItem[];
}

export interface WeekPlanTemplate {
  days: DayTemplate[];
  notes?: string;
}

export interface DayPlanContent {
  day_no: number;
  date?: string;
  is_rest: boolean;
  focus: string;
  workout: ExerciseItem[];
  workout_home?: ExerciseItem[];
  workout_gym?: ExerciseItem[];
  meals: MealItem[];
  schedule: ScheduleItem[];
  total_kcal: number;
  total_protein_g: number;
  burned_kcal?: number;
}
