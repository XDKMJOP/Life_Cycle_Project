import type { WeekPlanTemplate, DayPlanContent, ExerciseItem, MealItem } from './types';
import type { ExpandOptions } from './expand';
import { generateDailySchedule } from './schedule';
import { BUDGET_THAI_MEALS } from './budgetMealsData';

const BREAKFAST_ITEMS = BUDGET_THAI_MEALS.filter(
  (m) =>
    m.slot === 'breakfast' ||
    m.category === 'เมนูประหยัดทำเอง' ||
    (m.category === 'ร้านสะดวกซื้อ 7-Eleven' &&
      ['ไข่', 'นม', 'กล้วย', 'แซนวิช', 'ข้าวต้ม', 'โจ๊ก', 'ขนมปัง', 'โยเกิร์ต'].some((k) =>
        m.name_th.includes(k),
      )),
);

const LUNCH_ITEMS = BUDGET_THAI_MEALS.filter(
  (m) => m.slot === 'lunch' || m.category === 'อาหารตามสั่ง' || m.category === 'ก๋วยเตี๋ยวและจานเดียว',
);

const DINNER_ITEMS = BUDGET_THAI_MEALS.filter(
  (m) => m.slot === 'dinner' || m.category === 'ข้าวแกงและต้มจืด',
);

const SNACK_ITEMS = BUDGET_THAI_MEALS.filter(
  (m) => m.slot === 'snack' || m.category === 'อาหารว่างและผลไม้',
);

interface MealBooster {
  id: string;
  name_th: string;
  category: 'egg' | 'chicken' | 'milk' | 'carb' | 'fruit' | 'snack';
  unitCount?: number;
  kcal: number;
  protein_g: number;
  price_thb: number;
  source: string;
  slots: ('breakfast' | 'lunch' | 'dinner' | 'snack')[];
}

const THAI_BOOSTERS: MealBooster[] = [
  { id: 'eggs_2', name_th: 'ไข่ต้ม 2 ฟอง', category: 'egg', unitCount: 2, kcal: 150, protein_g: 13, price_thb: 20, source: '7-Eleven / ต้มเอง', slots: ['breakfast', 'lunch', 'dinner', 'snack'] },
  { id: 'chicken_breast', name_th: 'อกไก่นุ่ม 1 ซอง', category: 'chicken', unitCount: 1, kcal: 140, protein_g: 22, price_thb: 40, source: '7-Eleven', slots: ['lunch', 'dinner', 'snack'] },
  { id: 'high_protein_milk', name_th: 'นมโปรตีนสูง 1 ขวด', category: 'milk', unitCount: 1, kcal: 170, protein_g: 28, price_thb: 49, source: '7-Eleven', slots: ['breakfast', 'snack'] },
  { id: 'fresh_milk', name_th: 'นมสดจืด 1 กล่อง (200ml)', category: 'milk', unitCount: 1, kcal: 120, protein_g: 8, price_thb: 15, source: '7-Eleven', slots: ['breakfast', 'snack'] },
  { id: 'banana', name_th: 'กล้วยหอมทอง 1 ลูก', category: 'fruit', unitCount: 1, kcal: 100, protein_g: 1.2, price_thb: 10, source: '7-Eleven / ตลาดสด', slots: ['breakfast', 'snack'] },
  { id: 'soy_milk', name_th: 'นมถั่วเหลืองหวานน้อย 1 กล่อง', category: 'milk', unitCount: 1, kcal: 130, protein_g: 8, price_thb: 13, source: '7-Eleven', slots: ['breakfast', 'snack'] },
  { id: 'extra_rice', name_th: 'ข้าวสวยเพิ่ม 1 ทัพพี', category: 'carb', unitCount: 1, kcal: 80, protein_g: 2, price_thb: 7, source: 'ร้านอาหารตามสั่ง', slots: ['lunch', 'dinner'] },
  { id: 'egg_1', name_th: 'ไข่ต้ม 1 ฟอง', category: 'egg', unitCount: 1, kcal: 75, protein_g: 6.5, price_thb: 10, source: '7-Eleven / ต้มเอง', slots: ['breakfast', 'lunch', 'dinner', 'snack'] },
  { id: 'yogurt', name_th: 'โยเกิร์ตไขมันต่ำ 1 ถ้วย', category: 'milk', unitCount: 1, kcal: 90, protein_g: 5, price_thb: 15, source: '7-Eleven', slots: ['breakfast', 'snack'] },
  { id: 'almonds', name_th: 'อัลมอนด์อบ 1 ซองเล็ก', category: 'snack', unitCount: 1, kcal: 160, protein_g: 6, price_thb: 25, source: '7-Eleven', slots: ['snack'] },
  { id: 'sweet_potato', name_th: 'มันหวานญี่ปุ่นเผา 1 หัว', category: 'carb', unitCount: 1, kcal: 180, protein_g: 3, price_thb: 25, source: '7-Eleven / ตลาด', slots: ['breakfast', 'lunch', 'dinner', 'snack'] },
  { id: 'mixed_nuts', name_th: 'ถั่วรวมอบธรรมชาติ 1 ซอง', category: 'snack', unitCount: 1, kcal: 200, protein_g: 7, price_thb: 30, source: '7-Eleven', slots: ['snack'] },
  { id: 'toast_pb', name_th: 'ขนมปังโฮลวีททาเนยถั่ว 1 แผ่น', category: 'carb', unitCount: 1, kcal: 210, protein_g: 9, price_thb: 20, source: 'ทำเอง / 7-11', slots: ['breakfast', 'snack'] },
  { id: 'boiled_corn', name_th: 'ข้าวโพดหวานนึ่ง 1 ฝัก', category: 'carb', unitCount: 1, kcal: 160, protein_g: 5, price_thb: 20, source: 'รถเข็นข้าวโพด / 7-11', slots: ['lunch', 'dinner', 'snack'] },
];

export function buildMealItemsFromDishes(
  dishes: Array<{ slot: 'breakfast' | 'lunch' | 'dinner' | 'snack'; dish: (typeof BUDGET_THAI_MEALS)[0] }>,
  targetKcal: number = 2000,
  seed: number = 0
): MealItem[] {
  const meals = dishes.map((d) => ({
    slot: d.slot,
    dish: d.dish,
    boosters: [] as MealBooster[],
  }));

  let totalKcal = meals.reduce((sum, m) => sum + m.dish.kcal, 0);
  let remainingKcal = targetKcal - totalKcal;
  let slotIdx = 0;
  let boosterIdx = Math.abs(seed) % THAI_BOOSTERS.length;

  while (remainingKcal >= 60) {
    const targetSlot = meals[slotIdx % meals.length];
    const usedCategories = targetSlot.boosters.map((b) => b.category);

    let candidates = THAI_BOOSTERS.filter(
      (b) => b.slots.includes(targetSlot.slot) && b.kcal <= remainingKcal + 50 && !usedCategories.includes(b.category)
    );

    if (candidates.length === 0) {
      candidates = THAI_BOOSTERS.filter(
        (b) => b.slots.includes(targetSlot.slot) && b.kcal <= remainingKcal + 50
      );
    }

    if (candidates.length === 0) {
      candidates = THAI_BOOSTERS.filter((b) => b.slots.includes(targetSlot.slot));
    }

    if (candidates.length === 0) {
      slotIdx++;
      if (slotIdx > meals.length * 4) break;
      continue;
    }

    const booster = candidates[boosterIdx % candidates.length];
    boosterIdx++;

    targetSlot.boosters.push(booster);
    remainingKcal -= booster.kcal;
    totalKcal += booster.kcal;
    slotIdx++;

    if (Math.abs(remainingKcal) <= 40) break;
  }

  return meals.map((m) => {
    const boosterKcal = m.boosters.reduce((s, b) => s + b.kcal, 0);
    const boosterProtein = m.boosters.reduce((s, b) => s + b.protein_g, 0);
    const boosterPrice = m.boosters.reduce((s, b) => s + b.price_thb, 0);

    let eggCount = 0;
    let chickenCount = 0;
    let bananaCount = 0;
    let riceCount = 0;
    const otherItems: string[] = [];

    for (const b of m.boosters) {
      if (b.category === 'egg') {
        eggCount += b.unitCount || 1;
      } else if (b.id === 'chicken_breast') {
        chickenCount += 1;
      } else if (b.id === 'banana') {
        bananaCount += 1;
      } else if (b.id === 'extra_rice') {
        riceCount += 1;
      } else {
        otherItems.push(b.name_th);
      }
    }

    const boosterNames: string[] = [];
    if (eggCount > 0) boosterNames.push(`ไข่ต้ม ${eggCount} ฟอง`);
    if (chickenCount > 0) boosterNames.push(chickenCount > 1 ? `อกไก่นุ่ม ${chickenCount} ซอง` : 'อกไก่นุ่ม 1 ซอง');
    if (riceCount > 0) boosterNames.push(riceCount > 1 ? `ข้าวสวยเพิ่ม ${riceCount} ทัพพี` : 'ข้าวสวยเพิ่ม 1 ทัพพี');
    if (bananaCount > 0) boosterNames.push(bananaCount > 1 ? `กล้วยหอมทอง ${bananaCount} ลูก` : 'กล้วยหอมทอง 1 ลูก');
    boosterNames.push(...otherItems);

    return {
      slot: m.slot,
      title: m.dish.name_th,
      kcal: Math.round(m.dish.kcal + boosterKcal),
      protein_g: Math.round((m.dish.protein_g + boosterProtein) * 10) / 10,
      description: m.dish.tip,
      image: m.dish.image,
      price_thb: m.dish.price_thb + boosterPrice,
      source: m.dish.source,
      boosters: boosterNames,
    };
  });
}

export function getMealsForDay(
  dayNo: number,
  mealsPerDay: number = 3,
  targetKcal: number = 2000,
  weightKg: number = 70,
  goal: string = 'lose_weight'
): MealItem[] {
  const count = Math.max(2, Math.min(5, Number(mealsPerDay) || 3));
  const dishes: Array<{ slot: 'breakfast' | 'lunch' | 'dinner' | 'snack'; dish: (typeof BUDGET_THAI_MEALS)[0] }> = [];

  if (count === 2) {
    // 2 Meals: Meal 1 (Lunch/Brunch) + Meal 2 (Dinner)
    const l = LUNCH_ITEMS[(dayNo - 1) % LUNCH_ITEMS.length];
    const d = DINNER_ITEMS[(dayNo - 1) % DINNER_ITEMS.length];
    dishes.push({ slot: 'lunch', dish: l });
    dishes.push({ slot: 'dinner', dish: d });
  } else if (count === 3) {
    // 3 Meals: Breakfast + Lunch + Dinner
    const b = BREAKFAST_ITEMS[(dayNo - 1) % BREAKFAST_ITEMS.length];
    const l = LUNCH_ITEMS[(dayNo - 1) % LUNCH_ITEMS.length];
    const d = DINNER_ITEMS[(dayNo - 1) % DINNER_ITEMS.length];
    dishes.push({ slot: 'breakfast', dish: b });
    dishes.push({ slot: 'lunch', dish: l });
    dishes.push({ slot: 'dinner', dish: d });
  } else if (count === 4) {
    // 4 Meals: Breakfast + Lunch + Afternoon Snack + Dinner
    const b = BREAKFAST_ITEMS[(dayNo - 1) % BREAKFAST_ITEMS.length];
    const l = LUNCH_ITEMS[(dayNo - 1) % LUNCH_ITEMS.length];
    const s = SNACK_ITEMS[(dayNo - 1) % SNACK_ITEMS.length];
    const d = DINNER_ITEMS[(dayNo - 1) % DINNER_ITEMS.length];
    dishes.push({ slot: 'breakfast', dish: b });
    dishes.push({ slot: 'lunch', dish: l });
    dishes.push({ slot: 'snack', dish: s });
    dishes.push({ slot: 'dinner', dish: d });
  } else {
    // 5 Meals: Breakfast + Morning Snack + Lunch + Afternoon Snack + Dinner
    const b = BREAKFAST_ITEMS[(dayNo - 1) % BREAKFAST_ITEMS.length];
    const s1 = SNACK_ITEMS[(dayNo - 1) % SNACK_ITEMS.length];
    const l = LUNCH_ITEMS[(dayNo - 1) % LUNCH_ITEMS.length];
    const s2 = SNACK_ITEMS[(dayNo * 2 - 1) % SNACK_ITEMS.length];
    const d = DINNER_ITEMS[(dayNo - 1) % DINNER_ITEMS.length];
    dishes.push({ slot: 'breakfast', dish: b });
    dishes.push({ slot: 'snack', dish: s1 });
    dishes.push({ slot: 'lunch', dish: l });
    dishes.push({ slot: 'snack', dish: s2 });
    dishes.push({ slot: 'dinner', dish: d });
  }

  return buildMealItemsFromDishes(dishes, targetKcal, dayNo * 3);
}

export function getRandomDishForSlot(
  slot: 'breakfast' | 'lunch' | 'dinner' | 'snack',
  excludeName?: string
): (typeof BUDGET_THAI_MEALS)[0] {
  let pool =
    slot === 'breakfast'
      ? BREAKFAST_ITEMS
      : slot === 'lunch'
      ? LUNCH_ITEMS
      : slot === 'dinner'
      ? DINNER_ITEMS
      : SNACK_ITEMS;

  if (excludeName) {
    const filtered = pool.filter((d) => d.name_th !== excludeName);
    if (filtered.length > 0) pool = filtered;
  }
  const randomIndex = Math.floor(Math.random() * pool.length);
  return pool[randomIndex];
}

export function shuffleMealsForDay(
  dayNo: number,
  targetKcal: number = 2000,
  mealsPerDay: number = 3,
  slotToShuffle?: 'breakfast' | 'lunch' | 'dinner' | 'snack',
  currentMeals?: MealItem[]
): MealItem[] {
  const count = Math.max(2, Math.min(5, Number(mealsPerDay) || (currentMeals?.length || 3)));
  let slots: ('breakfast' | 'lunch' | 'dinner' | 'snack')[] = [];
  if (count === 2) {
    slots = ['lunch', 'dinner'];
  } else if (count === 4) {
    slots = ['breakfast', 'lunch', 'snack', 'dinner'];
  } else if (count === 5) {
    slots = ['breakfast', 'snack', 'lunch', 'snack', 'dinner'];
  } else {
    slots = ['breakfast', 'lunch', 'dinner'];
  }

  const dishes: Array<{ slot: 'breakfast' | 'lunch' | 'dinner' | 'snack'; dish: (typeof BUDGET_THAI_MEALS)[0] }> = [];

  for (let idx = 0; idx < slots.length; idx++) {
    const s = slots[idx];
    if (slotToShuffle && currentMeals && s !== slotToShuffle && currentMeals[idx]) {
      const existing = currentMeals[idx];
      const matchedDish = existing ? BUDGET_THAI_MEALS.find((d) => d.name_th === existing.title) : null;
      if (matchedDish) {
        dishes.push({ slot: s, dish: matchedDish });
        continue;
      }
    }
    const existingForSlot = currentMeals?.[idx];
    const newDish = getRandomDishForSlot(s, existingForSlot?.title);
    dishes.push({ slot: s, dish: newDish });
  }

  const seed = Math.floor(Math.random() * 1000);
  return buildMealItemsFromDishes(dishes, targetKcal, seed);
}

export const HEALTHY_MEALS_POOL: MealItem[][] = Array.from({ length: 30 }, (_, i) =>
  getMealsForDay(i + 1, 3, 2000),
);

export const fallbackWeekTemplate: WeekPlanTemplate = {
  days: [
    {
      day: 1,
      is_rest: false,
      focus: 'ช่วงล่างและกล้ามเนื้อแกนกลาง',
      workout: [
        { exercise_id: 'Bodyweight_Squat', name_th: 'สควอทน้ำหนักตัว', sets: 3, reps: '12-15', duration_min: null, rest_sec: 60 },
        { exercise_id: 'Lunges', name_th: 'ลันจ์ก้าวขา', sets: 3, reps: '10 ครั้งต่อข้าง', duration_min: null, rest_sec: 60 },
        { exercise_id: 'Plank', name_th: 'แพลงก์เกร็งหน้าท้อง', sets: 3, reps: null, duration_min: 1, rest_sec: 45 },
      ],
      workout_gym: [
        { exercise_id: 'Leg_Press', name_th: 'เลกเพรสแมชชีน', sets: 3, reps: '10-12', duration_min: null, rest_sec: 60 },
        { exercise_id: 'Leg_Curl', name_th: 'เลกเคิร์ลแมชชีน', sets: 3, reps: '12', duration_min: null, rest_sec: 60 },
        { exercise_id: 'Cable_Crunch', name_th: 'เคเบิลครั้นช์เกร็งหน้าท้อง', sets: 3, reps: '15', duration_min: null, rest_sec: 45 },
      ],
      meals: getMealsForDay(1, 3),
    },
    {
      day: 2,
      is_rest: false,
      focus: 'ช่วงบนและหลัง',
      workout: [
        { exercise_id: 'Push_Ups', name_th: 'วิดพื้น', sets: 3, reps: '8-12', duration_min: null, rest_sec: 60 },
        { exercise_id: 'Dumbbell_Row', name_th: 'ดัมเบลโรว์หรือดึงยางยืด', sets: 3, reps: '12', duration_min: null, rest_sec: 60 },
        { exercise_id: 'Shoulder_Taps', name_th: 'แตะไหล่ในท่าแพลงก์', sets: 3, reps: '20 ครั้ง', duration_min: null, rest_sec: 45 },
      ],
      workout_gym: [
        { exercise_id: 'Chest_Press', name_th: 'เชสต์เพรสแมชชีน', sets: 3, reps: '10-12', duration_min: null, rest_sec: 60 },
        { exercise_id: 'Lat_Pulldown', name_th: 'แลทดึงลงแมชชีน', sets: 3, reps: '10-12', duration_min: null, rest_sec: 60 },
        { exercise_id: 'Shoulder_Press', name_th: 'ดัมเบลโชลเดอร์เพรส', sets: 3, reps: '12', duration_min: null, rest_sec: 60 },
      ],
      meals: getMealsForDay(2, 3),
    },
    {
      day: 3,
      is_rest: true,
      focus: 'วันพักฟื้นฟูร่างกายกลางสัปดาห์ (Active Recovery)',
      workout: [],
      workout_gym: [],
      meals: getMealsForDay(3, 3),
    },
    {
      day: 4,
      is_rest: false,
      focus: 'ความทนทานหัวใจและคาร์ดิโอ',
      workout: [
        { exercise_id: 'Jumping_Jacks', name_th: 'กระโดดตบอุ่นเครื่อง', sets: 3, reps: '30 ครั้ง', duration_min: null, rest_sec: 30 },
        { exercise_id: 'Brisk_Walking_Jog', name_th: 'เดินเร็วหรือวิ่งจ็อกกิ้ง', sets: null, reps: null, duration_min: 30, rest_sec: null },
        { exercise_id: 'Mountain_Climbers', name_th: 'ปีนเขาเกร็งหน้าท้อง', sets: 3, reps: '20 ครั้ง', duration_min: null, rest_sec: 45 },
      ],
      workout_gym: [
        { exercise_id: 'Treadmill', name_th: 'ลู่วิ่งไฟฟ้าปรับความชัน', sets: 1, reps: null, duration_min: 25, rest_sec: null },
        { exercise_id: 'Elliptical', name_th: 'เครื่องเดินวงรีคาร์ดิโอ', sets: 1, reps: null, duration_min: 15, rest_sec: 60 },
        { exercise_id: 'Cable_Woodchopper', name_th: 'เคเบิลวูดช็อปบริหารแกนกลาง', sets: 3, reps: '12 ครั้งต่อข้าง', duration_min: null, rest_sec: 45 },
      ],
      meals: getMealsForDay(4, 3),
    },
    {
      day: 5,
      is_rest: false,
      focus: 'กล้ามเนื้อรวมทั้งตัว (Full Body)',
      workout: [
        { exercise_id: 'Bodyweight_Squat', name_th: 'สควอท', sets: 3, reps: '15', duration_min: null, rest_sec: 60 },
        { exercise_id: 'Push_Ups', name_th: 'วิดพื้น', sets: 3, reps: '10', duration_min: null, rest_sec: 60 },
        { exercise_id: 'Glute_Bridge', name_th: 'ยกสะโพกบริหารก้น', sets: 3, reps: '15', duration_min: null, rest_sec: 45 },
      ],
      workout_gym: [
        { exercise_id: 'Bench_Press', name_th: 'เบนช์เพรสดัมเบลหรือบาร์เบล', sets: 3, reps: '10', duration_min: null, rest_sec: 60 },
        { exercise_id: 'Seated_Cable_Row', name_th: 'เคเบิลโรว์ท่านั่ง', sets: 3, reps: '12', duration_min: null, rest_sec: 60 },
        { exercise_id: 'Leg_Press', name_th: 'เลกเพรสสร้างกล้ามเนื้อขา', sets: 3, reps: '12', duration_min: null, rest_sec: 60 },
      ],
      meals: getMealsForDay(5, 3),
    },
    {
      day: 6,
      is_rest: false,
      focus: 'แกนกลางลำตัวและยืดหยุ่น',
      workout: [
        { exercise_id: 'Side_Plank', name_th: 'ไซด์แพลงก์บริหารเอว', sets: 3, reps: '30 วินาทีต่อข้าง', duration_min: null, rest_sec: 45 },
        { exercise_id: 'Bird_Dog', name_th: 'เบิร์ดด็อกรักษาความสมดุล', sets: 3, reps: '12 ครั้งต่อข้าง', duration_min: null, rest_sec: 45 },
        { exercise_id: 'Brisk_Walk', name_th: 'เดินเร็วผ่อนคลายกล้ามเนื้อ', sets: null, reps: null, duration_min: 25, rest_sec: null },
      ],
      workout_gym: [
        { exercise_id: 'Hanging_Knee_Raise', name_th: 'กัปตันแชร์ยกเข่าบริหารหน้าท้อง', sets: 3, reps: '12-15 ครั้ง', duration_min: null, rest_sec: 45 },
        { exercise_id: 'Cable_Crunch', name_th: 'เคเบิลครั้นช์', sets: 3, reps: '15', duration_min: null, rest_sec: 45 },
        { exercise_id: 'Treadmill', name_th: 'เดินชันบนลู่วิ่งไฟฟ้า', sets: 1, reps: null, duration_min: 20, rest_sec: null },
      ],
      meals: getMealsForDay(6, 3),
    },
    {
      day: 7,
      is_rest: true,
      focus: 'วันพักผ่อนและเตรียมตัวสำหรับสัปดาห์ใหม่ (Full Rest)',
      workout: [],
      workout_gym: [],
      meals: getMealsForDay(7, 3),
    },
  ],
  notes: 'แผนออกกำลังกายและโภชนาการสำหรับสร้างวินัยสุขภาพที่ดีอย่างต่อเนื่อง ปลอดภัยสำหรับร่างกาย',
};

// =========================================================================
// 100 POPULAR EXERCISES DEFINITION (50 Men: 25 Equip, 25 Body / 50 Women: 25 Equip, 25 Body)
// =========================================================================
const MEN_EQUIPMENT: ExerciseItem[] = [
  { exercise_id: 'Barbell_Bench_Press', name_th: 'บาร์เบล เบนช์เพรส', sets: 4, reps: '10' },
  { exercise_id: 'Incline_Dumbbell_Press', name_th: 'ดัมเบล เพรสเบาะเอียง', sets: 3, reps: '12' },
  { exercise_id: 'Pec_Deck', name_th: 'เครื่องหนีบอก (เพคเด็ค)', sets: 3, reps: '12' },
  { exercise_id: 'Cable_Crossover', name_th: 'เคเบิล ครอสโอเวอร์', sets: 3, reps: '15' },
  { exercise_id: 'Dumbbell_Chest_Fly', name_th: 'ดัมเบล เชสต์ฟลาย', sets: 3, reps: '12' },
  { exercise_id: 'Barbell_Deadlift', name_th: 'บาร์เบล เดดลิฟต์', sets: 4, reps: '6' },
  { exercise_id: 'Barbell_Bent-Over_Row', name_th: 'บาร์เบล เบนท์โอเวอร์โรว์', sets: 4, reps: '10' },
  { exercise_id: 'Lat_Pulldown', name_th: 'เคเบิลดึงหลังกว้าง', sets: 4, reps: '12' },
  { exercise_id: 'Seated_Cable_Row', name_th: 'เคเบิลโรว์แบบนั่ง', sets: 3, reps: '12' },
  { exercise_id: 'T-Bar_Row', name_th: 'ทีบาร์ โรว์', sets: 3, reps: '10' },
  { exercise_id: 'Barbell_Back_Squat', name_th: 'บาร์เบล สควอช', sets: 4, reps: '8' },
  { exercise_id: 'Leg_Press', name_th: 'เครื่องเลกเพรส', sets: 4, reps: '12' },
  { exercise_id: 'Dumbbell_Romanian_Deadlift', name_th: 'ดัมเบล โรมาเนียนเดดลิฟต์', sets: 3, reps: '10' },
  { exercise_id: 'Leg_Extension', name_th: 'เลกเอ็กซ์เทนชัน', sets: 3, reps: '15' },
  { exercise_id: 'Lying_Leg_Curl', name_th: 'เลกเคิร์ลท่านอน', sets: 3, reps: '12' },
  { exercise_id: 'Standing_Calf_Raise', name_th: 'เครื่องยกส้นเท้ายืน', sets: 4, reps: '15' },
  { exercise_id: 'Overhead_Barbell_Press', name_th: 'มิลลิทารีเพรส', sets: 4, reps: '8' },
  { exercise_id: 'Dumbbell_Lateral_Raise', name_th: 'ดัมเบล กางแขนข้างลำตัว', sets: 4, reps: '15' },
  { exercise_id: 'Dumbbell_Front_Raise', name_th: 'ดัมเบล ยกแขนด้านหน้า', sets: 3, reps: '12' },
  { exercise_id: 'Cable_Face_Pull', name_th: 'เคเบิล เฟซพูล', sets: 3, reps: '15' },
  { exercise_id: 'Barbell_Bicep_Curl', name_th: 'บาร์เบล ไบเซปเคิร์ล', sets: 3, reps: '12' },
  { exercise_id: 'Dumbbell_Hammer_Curl', name_th: 'ดัมเบล แฮมเมอร์เคิร์ล', sets: 3, reps: '12' },
  { exercise_id: 'Tricep_Rope_Pushdown', name_th: 'เคเบิลเชือกกดหลังแขน', sets: 3, reps: '12' },
  { exercise_id: 'Skull_Crusher', name_th: 'อีซีบาร์กะโหลกบด', sets: 3, reps: '10' },
  { exercise_id: 'Cable_Woodchopper', name_th: 'เคเบิลสับไม้เฉียง', sets: 3, reps: '12' },
];

const MEN_BODYWEIGHT: ExerciseItem[] = [
  { exercise_id: 'Push_Ups', name_th: 'วิดพื้นมาตรฐาน', sets: 3, reps: '15' },
  { exercise_id: 'Wide_Grip_Push-up', name_th: 'วิดพื้นมือห่าง', sets: 3, reps: '12' },
  { exercise_id: 'Diamond_Push-up', name_th: 'วิดพื้นมือชิดรูปเพชร', sets: 3, reps: '10' },
  { exercise_id: 'Decline_Push-up', name_th: 'วิดพื้นขาวางเบาะสูง', sets: 3, reps: '12' },
  { exercise_id: 'Pike_Push-up', name_th: 'พายก์พุชอัพ', sets: 3, reps: '10' },
  { exercise_id: 'Bodyweight_Squat', name_th: 'บอดี้เวท สควอช', sets: 4, reps: '20' },
  { exercise_id: 'Lunges', name_th: 'ลันจ์ก้าวขาหน้าสลับ', sets: 3, reps: '12' },
  { exercise_id: 'Jump_Squat', name_th: 'จัมป์ สควอช', sets: 3, reps: '15' },
  { exercise_id: 'Bulgarian_Split_Squat', name_th: 'บัลแกเรียน สปลิทสควอช', sets: 3, reps: '10' },
  { exercise_id: 'Glute_Bridge', name_th: 'สะพานก้นพื้น', sets: 3, reps: '15' },
  { exercise_id: 'Calf_Raise', name_th: 'เขย่งปลายเท้า', sets: 3, reps: '25' },
  { exercise_id: 'Pull-up', name_th: 'ดึงข้อคว่ำมือ', sets: 3, reps: '8' },
  { exercise_id: 'Chin-up', name_th: 'ดึงข้อหงายมือ', sets: 3, reps: '8' },
  { exercise_id: 'Inverted_Row', name_th: 'ออสเตรเลียน พูลอัพ', sets: 3, reps: '12' },
  { exercise_id: 'Superman_Hold', name_th: 'ซูเปอร์แมนค้าง', sets: 3, duration_min: null, reps: '30วิ' },
  { exercise_id: 'Plank', name_th: 'แพลงก์ศอกค้างลำตัว', sets: 3, duration_min: 1, reps: '45วิ' },
  { exercise_id: 'Side_Plank', name_th: 'แพลงก์ข้างเกร็งเอว', sets: 3, duration_min: null, reps: '30วิ' },
  { exercise_id: 'Mountain_Climbers', name_th: 'เมาน์เทนไคลม์เบอร์ (ไต่เขา)', sets: 3, duration_min: null, reps: '30วิ' },
  { exercise_id: 'Bicycle_Crunches', name_th: 'ไบซิเคิล ครันช์', sets: 3, reps: '20' },
  { exercise_id: 'Lying_Leg_Raise', name_th: 'นอนหงายยกขาตรง', sets: 3, reps: '15' },
  { exercise_id: 'Russian_Twist', name_th: 'รัสเซียน ทวิสต์ บิดเอว', sets: 3, reps: '20' },
  { exercise_id: 'Hollow_Body_Hold', name_th: 'ฮอลโลว์บอดี้ เกร็งท้อง', sets: 3, duration_min: null, reps: '30วิ' },
  { exercise_id: 'Burpees', name_th: 'เบอร์พีฟูลบอดี้', sets: 3, reps: '12' },
  { exercise_id: 'Jumping_Jacks', name_th: 'กระโดดตบ', sets: 3, duration_min: null, reps: '45วิ' },
  { exercise_id: 'Bench_Dips', name_th: 'ดิปส์เก้าอี้กระชับแขน', sets: 3, reps: '15' },
];

const WOMEN_EQUIPMENT: ExerciseItem[] = [
  { exercise_id: 'Barbell_Hip_Thrust', name_th: 'บาร์เบล ฮิปทรัสต์ (ปั้นก้น)', sets: 4, reps: '12' },
  { exercise_id: 'Dumbbell_Romanian_Deadlift', name_th: 'ดัมเบล โรมาเนียนเดดลิฟต์', sets: 3, reps: '12' },
  { exercise_id: 'Goblet_Squat', name_th: 'ก็อบเลท สควอช', sets: 3, reps: '15' },
  { exercise_id: 'Cable_Glute_Kickback', name_th: 'เคเบิล คิกแบ็ก (เตะปั้นก้น)', sets: 3, reps: '15' },
  { exercise_id: 'Cable_Pull-Through', name_th: 'เคเบิล พูลทรู ดันสะโพก', sets: 3, reps: '12' },
  { exercise_id: 'Smith_Machine_Squat', name_th: 'สมิธแมชชีน สควอช', sets: 3, reps: '10' },
  { exercise_id: 'Leg_Press', name_th: 'เลกเพรสเท้าวางกว้าง', sets: 3, reps: '12' },
  { exercise_id: 'Seated_Hip_Abductor', name_th: 'เครื่องกางขาก้นข้าง', sets: 4, reps: '15' },
  { exercise_id: 'Seated_Hip_Adductor', name_th: 'เครื่องหุบขากระชับขาใน', sets: 3, reps: '15' },
  { exercise_id: 'Dumbbell_Walking_Lunges', name_th: 'วอล์กกิ้งลันจ์ดัมเบล', sets: 3, reps: '12' },
  { exercise_id: 'Lying_Leg_Curl', name_th: 'เลกเคิร์ลกระชับหลังขา', sets: 3, reps: '12' },
  { exercise_id: 'Dumbbell_Step-Up', name_th: 'ก้าวเหยียบเบาะถือดัมเบล', sets: 3, reps: '12' },
  { exercise_id: 'Lat_Pulldown', name_th: 'แลทพูลดาวน์หลังกระชับ', sets: 3, reps: '12' },
  { exercise_id: 'Seated_Cable_Row', name_th: 'เคเบิลโรว์กระชับหลัง', sets: 3, reps: '12' },
  { exercise_id: 'Dumbbell_Single-Arm_Row', name_th: 'ดัมเบลโรว์แขนเดี่ยว', sets: 3, reps: '12' },
  { exercise_id: 'Shoulder_Press', name_th: 'ดัมเบลยกดันหัวไหล่', sets: 3, reps: '12' },
  { exercise_id: 'Dumbbell_Lateral_Raise', name_th: 'ดัมเบลกางแขนปั้นไหล่', sets: 3, reps: '15' },
  { exercise_id: 'Cable_Face_Pull', name_th: 'เคเบิลเฟซพูลแก้หลังค่อม', sets: 3, reps: '15' },
  { exercise_id: 'Incline_Dumbbell_Chest_Press', name_th: 'ดัมเบลเบาะเอียงกระชับอก', sets: 3, reps: '12' },
  { exercise_id: 'Dumbbell_Bicep_Curl', name_th: 'ดัมเบลเคิร์ลแขนเพรียว', sets: 3, reps: '12' },
  { exercise_id: 'Overhead_Dumbbell_Tricep_Extension', name_th: 'ดัมเบลยกเหนือหัวหลังแขน', sets: 3, reps: '12' },
  { exercise_id: 'Cable_Tricep_Pushdown', name_th: 'เคเบิลกดหลังแขนเพรียว', sets: 3, reps: '12' },
  { exercise_id: 'Cable_Rope_Crunch', name_th: 'เคเบิลเชือกครันช์หน้าท้อง', sets: 3, reps: '15' },
  { exercise_id: 'Kettlebell_Swing', name_th: 'เคตเทิลเบล สวิง', sets: 3, reps: '15' },
  { exercise_id: 'Banded_Lateral_Walk', name_th: 'เดินข้างด้วยยางยืด', sets: 3, reps: '15' },
];

const WOMEN_BODYWEIGHT: ExerciseItem[] = [
  { exercise_id: 'Glute_Bridge', name_th: 'สะพานก้นพื้นปั้นก้นกลม', sets: 3, reps: '20' },
  { exercise_id: 'Single-Leg_Glute_Bridge', name_th: 'สะพานก้นยกขาเดี่ยว', sets: 3, reps: '12' },
  { exercise_id: 'Donkey_Kicks', name_th: 'ดองกี้คิก เตะหลังยกสะโพก', sets: 3, reps: '15' },
  { exercise_id: 'Fire_Hydrants', name_th: 'ไฟร์ไฮแดรนท์ กางขาปั้นข้าง', sets: 3, reps: '15' },
  { exercise_id: 'Frog_Pumps', name_th: 'ฟร็อกพัมพ์ประกบเท้าดันสะโพก', sets: 3, reps: '25' },
  { exercise_id: 'Sumo_Squat', name_th: 'ซูโม่สควอช', sets: 3, reps: '15' },
  { exercise_id: 'Curtsy_Lunge', name_th: 'เคิร์ตซี่ลันจ์', sets: 3, reps: '12' },
  { exercise_id: 'Wall_Sit', name_th: 'พิงกำแพงเกร็งขา', sets: 3, duration_min: null, reps: '40วิ' },
  { exercise_id: 'Reverse_Lunges', name_th: 'รีเวิร์สลันจ์ก้าวถอยหลัง', sets: 3, reps: '12' },
  { exercise_id: 'Clamshells', name_th: 'แคลมเชลล์ หอยกาบยกสะโพก', sets: 3, reps: '20' },
  { exercise_id: 'Knee_Push-up', name_th: 'วิดพื้นวางเข่ากระชับอก', sets: 3, reps: '10' },
  { exercise_id: 'Incline_Push-up', name_th: 'วิดพื้นกับโต๊ะ/เตียง', sets: 3, reps: '12' },
  { exercise_id: 'Shoulder_Taps', name_th: 'แพลงก์แตะไหล่สลับ', sets: 3, reps: '20' },
  { exercise_id: 'Superman_Hold', name_th: 'ซูเปอร์แมนยกตัว', sets: 3, duration_min: null, reps: '30วิ' },
  { exercise_id: 'Bird_Dog', name_th: 'เบิร์ดด็อก ยกแขนขาสลับ', sets: 3, reps: '12' },
  { exercise_id: 'Plank', name_th: 'แพลงก์ศอกหน้าท้องแบนราบ', sets: 3, duration_min: 1, reps: '45วิ' },
  { exercise_id: 'Side_Plank', name_th: 'ไซด์แพลงก์ดรอปสะโพก', sets: 3, duration_min: null, reps: '30วิ' },
  { exercise_id: 'Dead_Bug', name_th: 'เดดบัก ยกแขนขาสลับ', sets: 3, reps: '12' },
  { exercise_id: 'Flutter_Kicks', name_th: 'ฟลัตเตอร์คิก เตะขาสลับ', sets: 3, duration_min: null, reps: '30วิ' },
  { exercise_id: 'Scissor_Kicks', name_th: 'ขากรรไกรไขว้สลับ', sets: 3, reps: '20' },
  { exercise_id: 'Crunches', name_th: 'ครันช์เกร็งหน้าท้อง', sets: 3, reps: '20' },
  { exercise_id: 'Russian_Twist', name_th: 'รัสเซียนทวิสต์ บิดเอว', sets: 3, reps: '20' },
  { exercise_id: 'Standing_Side_Leg_Raise', name_th: 'ยืนเตะขาข้าง', sets: 3, reps: '15' },
  { exercise_id: 'Skater_Hops', name_th: 'สเก็ตเตอร์ฮอป กระโดดข้าง', sets: 3, duration_min: null, reps: '30วิ' },
  { exercise_id: 'Butt_Kicks', name_th: 'วิ่งเตะส้นเท้าชนก้น', sets: 3, duration_min: null, reps: '45วิ' },
];

export function generate30DayPlanForSex(
  sex: 'male' | 'female',
  options: ExpandOptions = {}
): DayPlanContent[] {
  const equipPool = sex === 'male' ? MEN_EQUIPMENT : WOMEN_EQUIPMENT;
  const bodyPool = sex === 'male' ? MEN_BODYWEIGHT : WOMEN_BODYWEIGHT;

  // 7-day cycle: 5 training days + 2 rest days (Day 3: Mid-week Active Recovery, Day 7: Full Weekly Rest)
  const focuses = sex === 'male' ? [
    'กล้ามเนื้ออกและหลังแขน (Chest & Triceps)',
    'กล้ามเนื้อขาและสะโพก (Legs & Glutes)',
    'วันพักฟื้นฟูร่างกายกลางสัปดาห์ (Mid-Week Recovery)',
    'กล้ามเนื้อหลังและหน้าแขน (Back & Biceps)',
    'หัวไหล่และแกนกลางลำตัว (Shoulders & Core)',
    'พัฒนาร่างกายรวมและคาร์ดิโอ (Full Body & Conditioning)',
    'วันพักผ่อนและซ่อมแซมกล้ามเนื้อประจำสัปดาห์ (Full Rest Day)',
  ] : [
    'สร้างสะโพกและปั้นก้นกลมเด้ง (Glutes & Hamstrings)',
    'กระชับแผ่นหลังและต้นแขนเพรียว (Back, Arms & Posture)',
    'วันพักฟื้นฟูร่างกายและยืดเหยียดกลางสัปดาห์ (Mid-Week Recovery)',
    'เรียวขาและสะโพกด้านข้าง (Inner/Outer Thighs & Hips)',
    'หัวไหล่สวยมนและเอวเอส (Shoulders & Hourglass Waist)',
    'เบิร์นไขมันรวมและหน้าท้องแบนราบ (Full Body Burn & Abs)',
    'วันพักผ่อนและซ่อมแซมกล้ามเนื้อประจำสัปดาห์ (Full Rest Day)',
  ];

  const days: DayPlanContent[] = [];
  let eqIdx = 0;
  let boIdx = 0;

  for (let dayNo = 1; dayNo <= 30; dayNo++) {
    const dayOfWeek = (dayNo - 1) % 7;
    // Rest on Day 3 (index 2) and Day 7 (index 6) of every week (8 rest days across 30 days)
    const isRest = dayOfWeek === 2 || dayOfWeek === 6;
    const focus = focuses[dayOfWeek];
    const meals = getMealsForDay(
      dayNo,
      options.mealsPerDay || 3,
      options.targetKcal || 2000,
      options.weightKg || 70,
      options.goal || 'lose_weight'
    );

    const weekNo = Math.ceil(dayNo / 7);

    if (isRest) {
      days.push({
        day_no: dayNo,
        is_rest: true,
        focus,
        workout: [],
        workout_home: [],
        workout_gym: [],
        meals,
        schedule: generateDailySchedule({
          freeTime: options.freeTime,
          mealsPerDay: options.mealsPerDay,
          isRest: true,
          routineType: options.routineType,
          wakeTime: options.wakeTime,
          bedTime: options.bedTime,
          workStart: options.workStart,
          workEnd: options.workEnd,
          workoutTime: options.workoutTime,
        }),
        total_kcal: meals.reduce((sum, m) => sum + (m.kcal || 0), 0),
        total_protein_g: meals.reduce((sum, m) => sum + (m.protein_g || 0), 0),
        burned_kcal: dayOfWeek === 2 ? 150 : 120,
      });
    } else {
      // 3-4 bodyweight exercises rotated evenly across 22 training days
      const dayBody: ExerciseItem[] = [];
      const numBody = (dayNo % 2 === 0) ? 4 : 3;
      for (let i = 0; i < numBody; i++) {
        const item = bodyPool[boIdx % bodyPool.length];
        boIdx++;
        const setsBonus = weekNo >= 2 ? 1 : 0;
        dayBody.push({
          ...item,
          sets: item.sets ? item.sets + setsBonus : item.sets,
        });
      }

      // 3-4 equipment exercises rotated evenly across 22 training days
      const dayGym: ExerciseItem[] = [];
      const numGym = (dayNo % 2 === 0) ? 4 : 3;
      for (let i = 0; i < numGym; i++) {
        const item = equipPool[eqIdx % equipPool.length];
        eqIdx++;
        const setsBonus = weekNo >= 2 ? 1 : 0;
        dayGym.push({
          ...item,
          sets: item.sets ? item.sets + setsBonus : item.sets,
        });
      }

      const totalKcal = meals.reduce((sum, m) => sum + (m.kcal || 0), 0);
      const totalProteinG = meals.reduce((sum, m) => sum + (m.protein_g || 0), 0);
      const burnedKcal = 380 + (weekNo * 25);

      days.push({
        day_no: dayNo,
        is_rest: false,
        focus,
        workout: dayBody,
        workout_home: dayBody,
        workout_gym: dayGym,
        meals,
        schedule: generateDailySchedule({
          freeTime: options.freeTime,
          mealsPerDay: options.mealsPerDay,
          isRest: false,
          routineType: options.routineType,
          wakeTime: options.wakeTime,
          bedTime: options.bedTime,
          workStart: options.workStart,
          workEnd: options.workEnd,
          workoutTime: options.workoutTime,
        }),
        total_kcal: totalKcal,
        total_protein_g: totalProteinG,
        burned_kcal: burnedKcal,
      });
    }
  }

  return days;
}
