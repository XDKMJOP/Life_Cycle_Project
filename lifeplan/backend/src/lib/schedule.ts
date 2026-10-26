export interface ScheduleItem {
  start: string;
  end: string;
  label: string;
  type: 'workout' | 'meal' | 'sleep' | 'free' | 'work' | 'study';
}

export interface DailyScheduleOptions {
  freeTime?: 'morning' | 'evening';
  mealsPerDay?: number;
  isRest?: boolean;
  routineType?: 'work' | 'study' | 'shift' | 'freelance' | 'flexible';
  wakeTime?: string;
  bedTime?: string;
  workStart?: string;
  workEnd?: string;
  workoutTime?: string;
}

function timeToMins(t: string): number {
  const [h, m] = t.split(':').map(Number);
  return (h || 0) * 60 + (m || 0);
}

function minsToTime(m: number): string {
  const norm = ((m % 1440) + 1440) % 1440;
  const h = Math.floor(norm / 60).toString().padStart(2, '0');
  const min = (norm % 60).toString().padStart(2, '0');
  return `${h}:${min}`;
}

function addMinutes(t: string, mins: number): string {
  return minsToTime(timeToMins(t) + mins);
}

export function generateDailySchedule(options: DailyScheduleOptions = {}): ScheduleItem[] {
  const freeTime = options.freeTime ?? 'evening';
  const meals = options.mealsPerDay ?? 3;
  const isRest = options.isRest ?? false;
  const routineType = options.routineType ?? 'work';
  const wake = options.wakeTime || '07:00';
  const bed = options.bedTime || '23:00';
  const workStart = options.workStart || '09:00';
  const workEnd = options.workEnd || '18:00';
  const customWorkoutTime = options.workoutTime;

  const items: ScheduleItem[] = [];

  // 1. Sleep blocks
  // 00:00 to wake
  if (wake > '00:00') {
    items.push({ start: '00:00', end: wake, label: 'เวลานอนหลับพักผ่อน', type: 'sleep' });
  }

  // Bed prep & Sleep at end of day
  const bedPrepStart = addMinutes(bed, -30);
  items.push({ start: bedPrepStart, end: bed, label: 'เตรียมตัวเข้านอน / พักผ่อนสายตา', type: 'sleep' });
  if (bed < '23:59') {
    items.push({ start: bed, end: '23:59', label: 'เวลานอนหลับพักผ่อน', type: 'sleep' });
  }

  // 2. Morning Routine
  const morningPrepEnd = addMinutes(wake, 30);
  items.push({
    start: wake,
    end: morningPrepEnd,
    label: 'ตื่นนอน ดื่มน้ำ และเตรียมตัวรับวันใหม่',
    type: 'free',
  });

  // Morning Workout (if freeTime === 'morning')
  let morningWorkoutEnd = morningPrepEnd;
  if (freeTime === 'morning') {
    const wDur = isRest ? 45 : 60;
    morningWorkoutEnd = addMinutes(morningPrepEnd, wDur);
    items.push({
      start: morningPrepEnd,
      end: morningWorkoutEnd,
      label: isRest ? 'เดินเบาๆ หรือยืดเหยียดกล้ามเนื้อ' : 'ออกกำลังกายช่วงเช้า',
      type: 'workout',
    });
  }

  // Breakfast (Only for 3, 4, 5 meals)
  let bFastEnd = morningWorkoutEnd;
  if (meals >= 3) {
    const bFastStart = morningWorkoutEnd;
    bFastEnd = addMinutes(bFastStart, 40);
    items.push({
      start: bFastStart,
      end: bFastEnd,
      label: 'อาหารมื้อเช้า',
      type: 'meal',
    });
  }

  // Morning Commute / Transition to Work/Study
  if (timeToMins(bFastEnd) < timeToMins(workStart)) {
    const commuteLabel =
      routineType === 'study'
        ? 'เดินทางไปเรียน / เตรียมตัวเข้าคลาส'
        : routineType === 'freelance'
        ? 'เตรียมพื้นที่และวางแผนงานประจำวัน'
        : 'เดินทางไปทำงาน / เตรียมความพร้อม';
    items.push({
      start: bFastEnd,
      end: workStart,
      label: commuteLabel,
      type: 'free',
    });
  }

  // 3. Work / Study & Lunch block
  const workLabelPrefix =
    routineType === 'study'
      ? 'เวลาเรียน / คลาสบรรยาย'
      : routineType === 'freelance'
      ? 'เวลาโฟกัสงานและโปรเจกต์'
      : routineType === 'shift'
      ? 'เวลาเข้ากะทำงาน'
      : 'เวลาทำงานประจำ';

  const workType = routineType === 'study' ? 'study' : 'work';

  // Lunch time (default 12:00 or 12:30 depending on work start)
  let lunchStart = '12:00';
  if (timeToMins(workStart) >= timeToMins('12:00')) {
    lunchStart = addMinutes(workStart, 180);
  }
  const lunchEnd = addMinutes(lunchStart, 50);

  // Morning work segment (and morning snack for 5 meals)
  if (meals === 5 && timeToMins(workStart) + 120 <= timeToMins(lunchStart)) {
    const mSnackStart = addMinutes(workStart, 90);
    const mSnackEnd = addMinutes(mSnackStart, 25);
    items.push({
      start: workStart,
      end: mSnackStart,
      label: `${workLabelPrefix} (ช่วงเช้า 1)`,
      type: workType,
    });
    items.push({
      start: mSnackStart,
      end: mSnackEnd,
      label: 'อาหารว่างช่วงสาย / เสริมพลังงาน',
      type: 'meal',
    });
    items.push({
      start: mSnackEnd,
      end: lunchStart,
      label: `${workLabelPrefix} (ช่วงเช้า 2)`,
      type: workType,
    });
  } else if (timeToMins(workStart) < timeToMins(lunchStart)) {
    items.push({
      start: workStart,
      end: lunchStart,
      label: `${workLabelPrefix} (ช่วงเช้า)`,
      type: workType,
    });
  }

  // Lunch Meal
  const lunchLabel = meals === 2 ? 'อาหารมื้อที่ 1 (สาย/เที่ยง)' : 'อาหารมื้อกลางวัน';
  items.push({
    start: lunchStart,
    end: lunchEnd,
    label: lunchLabel,
    type: 'meal',
  });

  // Afternoon Snack (for 4 and 5 meals)
  if (meals >= 4 && timeToMins(lunchEnd) + 180 <= timeToMins(workEnd)) {
    const snackStart = '15:30';
    const snackEnd = '16:00';
    if (timeToMins(snackStart) > timeToMins(lunchEnd) && timeToMins(snackEnd) < timeToMins(workEnd)) {
      items.push({
        start: lunchEnd,
        end: snackStart,
        label: `${workLabelPrefix} (ช่วงบ่าย)`,
        type: workType,
      });
      items.push({
        start: snackStart,
        end: snackEnd,
        label: 'อาหารว่างบ่าย / เติมโปรตีน',
        type: 'meal',
      });
      items.push({
        start: snackEnd,
        end: workEnd,
        label: `${workLabelPrefix} (ช่วงท้ายวัน)`,
        type: workType,
      });
    } else {
      items.push({
        start: lunchEnd,
        end: workEnd,
        label: `${workLabelPrefix} (ช่วงบ่าย)`,
        type: workType,
      });
    }
  } else {
    if (timeToMins(lunchEnd) < timeToMins(workEnd)) {
      items.push({
        start: lunchEnd,
        end: workEnd,
        label: `${workLabelPrefix} (ช่วงบ่าย)`,
        type: workType,
      });
    }
  }

  // 4. Evening Workout & Dinner
  let dinnerStart = '19:00';
  let dinnerEnd = '19:45';

  if (freeTime === 'evening') {
    // Commute home / transition
    const workoutStart = customWorkoutTime || addMinutes(workEnd, 30);
    if (timeToMins(workEnd) < timeToMins(workoutStart)) {
      items.push({
        start: workEnd,
        end: workoutStart,
        label: routineType === 'study' ? 'เดินทางกลับ / พักผ่อนหลังเลิกเรียน' : 'เดินทางกลับ / พักผ่อนสั้นๆ',
        type: 'free',
      });
    }

    const wDur = isRest ? 45 : 60;
    const workoutEnd = addMinutes(workoutStart, wDur);
    items.push({
      start: workoutStart,
      end: workoutEnd,
      label: isRest ? 'ยืดเหยียดคลายกล้ามเนื้อ / พักผ่อน' : 'ออกกำลังกายประจำวัน',
      type: 'workout',
    });

    dinnerStart = addMinutes(workoutEnd, 15);
    dinnerEnd = addMinutes(dinnerStart, 45);
  } else {
    // Already did morning workout
    const eveningCommuteEnd = addMinutes(workEnd, 30);
    if (timeToMins(workEnd) < timeToMins(eveningCommuteEnd)) {
      items.push({
        start: workEnd,
        end: eveningCommuteEnd,
        label: 'เดินทางกลับ / พักผ่อน',
        type: 'free',
      });
    }
    dinnerStart = eveningCommuteEnd;
    dinnerEnd = addMinutes(dinnerStart, 45);
  }

  // Dinner Meal
  items.push({
    start: dinnerStart,
    end: dinnerEnd,
    label: meals === 2 ? 'อาหารมื้อที่ 2 (มื้อเย็น)' : 'อาหารมื้อเย็น',
    type: 'meal',
  });

  // 5. Evening Free Time (Relaxation & Hobby)
  if (timeToMins(dinnerEnd) < timeToMins(bedPrepStart)) {
    items.push({
      start: dinnerEnd,
      end: bedPrepStart,
      label: 'เวลาผ่อนคลาย ทำงานอดิเรก และกิจวัตรส่วนตัว',
      type: 'free',
    });
  }

  // Sort chronologically and remove any duplicates or 0-duration items
  return items
    .filter((it) => timeToMins(it.start) !== timeToMins(it.end))
    .sort((a, b) => a.start.localeCompare(b.start));
}
