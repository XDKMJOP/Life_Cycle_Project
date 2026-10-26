import mysql from 'mysql2/promise';
import { generate30DayPlanForSex } from '../src/lib/fallback';

async function main() {
  const conn = await mysql.createConnection({
    host: '127.0.0.1',
    port: 3306,
    user: 'lifeplan',
    password: 'lifeplan',
    database: 'lifeplan',
  });

  console.log('Connected to MySQL. Fetching active plans...');

  const [activePlans]: any = await conn.query(`
    SELECT p.id as plan_id, p.user_id, pr.sex, pr.age, pr.height_cm, pr.weight_kg, pr.goal, pr.target_kcal, pr.meals_per_day, pr.free_time
    FROM plans p
    JOIN profiles pr ON pr.user_id = p.user_id
    WHERE p.is_active = 1
  `);

  console.log(`Found ${activePlans.length} active plans.`);

  for (const row of activePlans) {
    const { plan_id, user_id, sex, weight_kg, goal, target_kcal, meals_per_day, free_time } = row;
    const targetKcal = Number(target_kcal) || 2000;
    const weightKg = Number(weight_kg) || 70;

    console.log(`\nRecalibrating Plan ${plan_id} (User ${user_id}) -> Sex: ${sex}, Target: ${targetKcal} kcal, Weight: ${weightKg} kg, Goal: ${goal}`);

    const thirtyDays = generate30DayPlanForSex(sex === 'female' ? 'female' : 'male', {
      freeTime: free_time || 'evening',
      mealsPerDay: meals_per_day || 3,
      targetKcal,
      weightKg,
      goal: goal || 'lose_weight',
    });

    for (const day of thirtyDays) {
      await conn.query(
        'UPDATE plan_days SET content = ? WHERE plan_id = ? AND day_no = ?',
        [JSON.stringify(day), plan_id, day.day_no]
      );
    }

    console.log(`Plan ${plan_id}: 30 days updated. Day 3 sample total: ${thirtyDays[2].total_kcal} kcal, Protein: ${thirtyDays[2].total_protein_g}g`);
  }

  await conn.end();
  console.log('\nRecalibration complete!');
}

main().catch((err) => {
  console.error('Recalibration failed:', err);
  process.exit(1);
});
