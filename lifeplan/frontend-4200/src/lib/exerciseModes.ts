export type WorkoutLocationMode = 'home' | 'gym';

export interface ExerciseItem {
  exercise_id: string;
  name_th?: string;
  sets?: number | null;
  reps?: string | number | null;
  duration_min?: number | null;
  rest_sec?: number | null;
}

export interface DayContentForMode {
  is_rest?: boolean;
  workout?: ExerciseItem[];
  workout_home?: ExerciseItem[];
  workout_gym?: ExerciseItem[];
}

// Precise mappings between Home (bodyweight/floor) and Gym (equipment/machines)
const homeToGymMap: Record<string, { exercise_id: string; name_th: string; sets?: number; reps?: string; duration_min?: number | null; rest_sec?: number }> = {
  Bodyweight_Squat: {
    exercise_id: 'Leg_Press',
    name_th: 'เลกเพรสแมชชีน',
    sets: 3,
    reps: '10-12',
    rest_sec: 60,
  },
  Lunges: {
    exercise_id: 'Leg_Curl',
    name_th: 'เลกเคิร์ลแมชชีน',
    sets: 3,
    reps: '12',
    rest_sec: 60,
  },
  Plank: {
    exercise_id: 'Cable_Crunch',
    name_th: 'เคเบิลครั้นช์เกร็งหน้าท้อง',
    sets: 3,
    reps: '15',
    rest_sec: 45,
  },
  Push_Ups: {
    exercise_id: 'Chest_Press',
    name_th: 'เชสต์เพรสแมชชีน',
    sets: 3,
    reps: '10-12',
    rest_sec: 60,
  },
  Dumbbell_Row: {
    exercise_id: 'Lat_Pulldown',
    name_th: 'แลทดึงลงแมชชีน',
    sets: 3,
    reps: '10-12',
    rest_sec: 60,
  },
  Shoulder_Taps: {
    exercise_id: 'Shoulder_Press',
    name_th: 'ดัมเบลโชลเดอร์เพรส',
    sets: 3,
    reps: '12',
    rest_sec: 60,
  },
  Stretching_Flow: {
    exercise_id: 'Stationary_Bike',
    name_th: 'ปั่นจักรยานฟื้นฟูกล้ามเนื้อ',
    sets: 1,
    reps: undefined,
    duration_min: 20,
    rest_sec: undefined,
  },
  Jumping_Jacks: {
    exercise_id: 'Treadmill',
    name_th: 'ลู่วิ่งไฟฟ้าปรับความชัน',
    sets: 1,
    reps: undefined,
    duration_min: 25,
    rest_sec: undefined,
  },
  Brisk_Walking_Jog: {
    exercise_id: 'Elliptical',
    name_th: 'เครื่องเดินวงรีคาร์ดิโอ',
    sets: 1,
    reps: undefined,
    duration_min: 15,
    rest_sec: 60,
  },
  Mountain_Climbers: {
    exercise_id: 'Cable_Woodchopper',
    name_th: 'เคเบิลวูดช็อปบริหารแกนกลาง',
    sets: 3,
    reps: '12 ครั้งต่อข้าง',
    rest_sec: 45,
  },
  Glute_Bridge: {
    exercise_id: 'Seated_Cable_Row',
    name_th: 'เคเบิลโรว์ท่านั่ง',
    sets: 3,
    reps: '12',
    rest_sec: 60,
  },
  Side_Plank: {
    exercise_id: 'Hanging_Knee_Raise',
    name_th: 'กัปตันแชร์ยกเข่าบริหารหน้าท้อง',
    sets: 3,
    reps: '12-15 ครั้ง',
    rest_sec: 45,
  },
  Bird_Dog: {
    exercise_id: 'Cable_Crunch',
    name_th: 'เคเบิลครั้นช์',
    sets: 3,
    reps: '15',
    rest_sec: 45,
  },
  Brisk_Walk: {
    exercise_id: 'Treadmill',
    name_th: 'เดินชันบนลู่วิ่งไฟฟ้า',
    sets: 1,
    reps: undefined,
    duration_min: 20,
    rest_sec: undefined,
  },
  Gentle_Walk: {
    exercise_id: 'Stationary_Bike',
    name_th: 'ปั่นจักรยานเบาๆ คลายกล้ามเนื้อ',
    sets: 1,
    reps: undefined,
    duration_min: 20,
    rest_sec: undefined,
  },
};

export function getWorkoutForMode(
  content: DayContentForMode | null | undefined,
  mode: WorkoutLocationMode,
): ExerciseItem[] {
  if (!content) return [];

  // 1. If Gym mode requested
  if (mode === 'gym') {
    // If backend already provided workout_gym, prioritize it
    if (content.workout_gym && content.workout_gym.length > 0) {
      return content.workout_gym;
    }

    // Dynamic conversion fallback for existing plans in database
    const base = content.workout || [];
    return base.map((item) => {
      const match = homeToGymMap[item.exercise_id];
      if (match) {
        return {
          exercise_id: match.exercise_id,
          name_th: match.name_th,
          sets: item.sets || match.sets,
          reps: match.reps || item.reps,
          duration_min: match.duration_min ?? item.duration_min,
          rest_sec: item.rest_sec || match.rest_sec,
        };
      }
      return item;
    });
  }

  // 2. If Home mode requested
  if (content.workout_home && content.workout_home.length > 0) {
    return content.workout_home;
  }

  return content.workout || [];
}

export function getEquipmentLabel(exerciseId: string): string {
  const gymMachines = [
    'Leg_Press', 'Leg_Curl', 'Cable_Crunch', 'Chest_Press',
    'Lat_Pulldown', 'Shoulder_Press', 'Bench_Press', 'Seated_Cable_Row',
    'Treadmill', 'Elliptical', 'Cable_Woodchopper', 'Hanging_Knee_Raise',
    'Stationary_Bike', 'Cable_Row'
  ];

  if (gymMachines.includes(exerciseId)) {
    return 'เครื่องมือในยิม / ฟิตเนส';
  }
  return 'บอดี้เวท / พื้นที่ในบ้าน';
}
