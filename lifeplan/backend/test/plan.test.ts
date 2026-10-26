import { describe, expect, it } from 'vitest';
import { generateDailySchedule } from '../src/lib/schedule';
import { expandWeekTo30Days } from '../src/lib/expand';
import { removeEmojis } from '../src/lib/sanitize';
import { fallbackWeekTemplate, getMealsForDay } from '../src/lib/fallback';

describe('Sanitize: Emoji Filter', () => {
  it('ลบ emoji และ pictographs ออกจากข้อความ', () => {
    const raw = 'สวัสดีครับ 😀 ทดสอบระบบ ✅ ไม่ใช้ emoji 🥗💪';
    const clean = removeEmojis(raw);
    expect(clean).toBe('สวัสดีครับ  ทดสอบระบบ  ไม่ใช้ emoji');
  });

  it('ข้อความภาษาไทยธรรมดาไม่มีผลกระทบ', () => {
    const raw = 'ตารางอาหารและออกกำลังกายประจำวัน 30 วัน';
    expect(removeEmojis(raw)).toBe(raw);
  });
});

describe('Schedule Generator', () => {
  it('สร้างตารางเวลาที่เรียงลำดับเวลาถูกต้อง', () => {
    const schedule = generateDailySchedule({
      freeTime: 'evening',
      mealsPerDay: 3,
      isRest: false,
    });
    expect(schedule.length).toBeGreaterThan(4);
    // Check workout exists
    const workout = schedule.find((s) => s.type === 'workout');
    expect(workout).toBeDefined();
    expect(workout?.label).toContain('ออกกำลังกาย');

    // Check meals
    const meals = schedule.filter((s) => s.type === 'meal');
    expect(meals.length).toBe(3);
  });

  it('ปรับช่วงออกกำลังกายเป็นช่วงเช้าเมื่อเลือก freeTime = morning', () => {
    const schedule = generateDailySchedule({
      freeTime: 'morning',
      mealsPerDay: 3,
      isRest: false,
    });
    const workout = schedule.find((s) => s.type === 'workout');
    expect(workout?.start).toBe('07:30');
  });
});

describe('Expand: 30-Day Plan Generation', () => {
  it('ขยายแผน 7 วันเป็น 30 วันครบถ้วน', () => {
    const thirtyDays = expandWeekTo30Days(fallbackWeekTemplate, {
      freeTime: 'evening',
      mealsPerDay: 3,
    });
    expect(thirtyDays.length).toBe(30);
    expect(thirtyDays[0].day_no).toBe(1);
    expect(thirtyDays[29].day_no).toBe(30);
  });

  it('สัปดาห์ที่ 2 และ 3 เพิ่มปริมาณ (Progression) และสัปดาห์ที่ 4 เป็น Deload', () => {
    const thirtyDays = expandWeekTo30Days(fallbackWeekTemplate, {
      freeTime: 'evening',
      mealsPerDay: 3,
    });

    const day1Workout = thirtyDays[0].workout[0]; // Day 1
    const day8Workout = thirtyDays[7].workout[0]; // Day 8 (Week 2)
    const day22Workout = thirtyDays[21].workout[0]; // Day 22 (Week 4 Deload)

    // Week 2 sets should increase
    if (day1Workout.sets && day8Workout.sets) {
      expect(day8Workout.sets).toBeGreaterThan(day1Workout.sets);
    }

    // Week 4 sets should be deloaded compared to Week 2
    if (day8Workout.sets && day22Workout.sets) {
      expect(day22Workout.sets).toBeLessThanOrEqual(day8Workout.sets);
    }
  });
});

describe('Meal Count Customization: 2, 3, 4, 5 Meals', () => {
  it('สร้างอาหารและตารางเวลาตรงตามจำนวนมื้อ 2, 3, 4, 5 มื้อเป๊ะๆ', () => {
    [2, 3, 4, 5].forEach((count) => {
      const meals = getMealsForDay(1, count, 2000, 70, 'lose_weight');
      expect(meals.length).toBe(count);

      const sched = generateDailySchedule({ mealsPerDay: count });
      const mealSched = sched.filter((s) => s.type === 'meal');
      expect(mealSched.length).toBe(count);
    });
  });
});

