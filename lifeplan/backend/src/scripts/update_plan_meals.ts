import mysql from 'mysql2/promise';
import { getMealsForDay } from '../lib/fallback.js';

async function main() {
  const conn = await mysql.createConnection({
    host: '127.0.0.1',
    port: 3306,
    user: 'lifeplan',
    password: 'lifeplan',
    database: 'lifeplan',
  });

  console.log('Connected to MySQL. Updating meals in plan_days...');

  const [rows] = await conn.query<any[]>('SELECT id, plan_id, day_no, content FROM plan_days ORDER BY plan_id, day_no');
  console.log(`Found ${rows.length} plan_days records.`);

  let updatedCount = 0;
  for (const row of rows) {
    const content = typeof row.content === 'string' ? JSON.parse(row.content) : row.content;
    const mealsPerDay = content.meals && content.meals.length >= 4 ? 4 : 3;
    const freshMeals = getMealsForDay(row.day_no, mealsPerDay);

    content.meals = freshMeals;
    content.total_kcal = freshMeals.reduce((sum: number, m: any) => sum + (m.kcal || 0), 0);
    content.total_protein_g = freshMeals.reduce((sum: number, m: any) => sum + (m.protein_g || 0), 0);

    await conn.query('UPDATE plan_days SET content = ? WHERE id = ?', [JSON.stringify(content), row.id]);
    updatedCount++;
  }

  console.log(`Successfully updated ${updatedCount} plan_days records with 100 Budget Thai Meals!`);
  await conn.end();
}

main().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
