export interface User {
  id: number;
  email: string;
}

export interface Profile {
  user_id: number;
  name: string;
  sex: 'male' | 'female';
  age: number;
  height_cm: number;
  weight_kg: number;
  activity_level: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
  goal: 'lose_weight' | 'maintain' | 'build_muscle' | 'gain_weight';
  free_time: 'morning' | 'evening';
  meals_per_day: number;
  injuries?: string | null;
  injuries_text?: string | null;
  allergies_text?: string | null;
  goal_text?: string | null;
  consent_at?: string | null;
  bmr: number;
  tdee: number;
  target_kcal: number;
}

export interface AuthResponse {
  token: string;
  user: User;
  hasProfile: boolean;
  profile?: Profile | null;
}

export interface PlanDaySummary {
  id: number;
  dayNo: number;
  focus: string;
  isRest: boolean;
  totalKcal?: number;
  totalProteinG?: number;
  burnedKcal?: number;
  completedAt?: string | null;
}

export interface CurrentPlanResponse {
  hasPlan: boolean;
  planId?: number;
  startDate?: string;
  days?: PlanDaySummary[];
}

export interface ExerciseItem {
  exercise_id: string;
  name_th?: string;
  sets?: number | null;
  reps?: string | number | null;
  duration_min?: number | null;
  rest_sec?: number | null;
  image_0?: string;
  image_1?: string;
}

export interface MealItem {
  slot: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  title: string;
  kcal: number;
  protein_g: number;
  description?: string;
}

export interface ScheduleItem {
  start: string;
  end: string;
  label: string;
  type: 'workout' | 'meal' | 'sleep' | 'free';
}

export interface DayPlanContent {
  day_no: number;
  date?: string;
  focus: string;
  is_rest: boolean;
  workout: ExerciseItem[];
  workout_home?: ExerciseItem[];
  workout_gym?: ExerciseItem[];
  meals: MealItem[];
  schedule: ScheduleItem[];
  total_kcal: number;
  total_protein_g: number;
  burned_kcal?: number;
}

export interface DayDetailResponse {
  id: number;
  dayNo: number;
  completedAt: string | null;
  content: DayPlanContent;
  used_fallback?: boolean;
}

export interface ChatMessage {
  id: number;
  user_id: number;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
  source?: 'ai' | 'fallback';
}

export interface EnergyResult {
  bmr: number;
  tdee: number;
  targetKcal: number;
  proteinG?: number;
}
