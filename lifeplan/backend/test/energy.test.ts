import { describe, expect, it } from 'vitest';
import { calcBMR, calcEnergy, calcTDEE, calcTarget } from '../src/lib/energy';

describe('Mifflin-St Jeor', () => {
  it('BMR ชาย 70kg 175cm 25ปี = 1674', () => {
    // 10*70 + 6.25*175 - 5*25 + 5 = 700 + 1093.75 - 125 + 5 = 1673.75
    expect(calcBMR({ sex: 'male', weightKg: 70, heightCm: 175, age: 25 })).toBe(1674);
  });

  it('BMR หญิง 55kg 160cm 30ปี = 1239', () => {
    // 550 + 1000 - 150 - 161 = 1239
    expect(calcBMR({ sex: 'female', weightKg: 55, heightCm: 160, age: 30 })).toBe(1239);
  });

  it('TDEE = BMR x activity factor', () => {
    expect(calcTDEE(1674, 'moderate')).toBe(Math.round(1674 * 1.55));
    expect(calcTDEE(1674, 'sedentary')).toBe(Math.round(1674 * 1.2));
  });

  it('target ปรับตาม goal และไม่ต่ำกว่า BMR', () => {
    expect(calcTarget(2000, 'lose_weight', 1500)).toBe(1500);
    expect(calcTarget(2000, 'maintain', 1500)).toBe(2000);
    expect(calcTarget(2000, 'build_muscle', 1500)).toBe(2300);
    expect(calcTarget(1600, 'lose_weight', 1500)).toBe(1500);
  });

  it('calcEnergy รวมทุกขั้น', () => {
    const r = calcEnergy({ sex: 'male', weightKg: 70, heightCm: 175, age: 25, activity: 'moderate', goal: 'lose_weight' });
    expect(r.bmr).toBe(1674);
    expect(r.tdee).toBe(2595);
    expect(r.target).toBe(2095);
  });
});
