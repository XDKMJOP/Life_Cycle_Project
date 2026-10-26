import fs from 'fs';
import path from 'path';
import { NEW_50_MEALS } from './generate_and_download_50_meals';
import { BUDGET_THAI_MEALS as ORIGINAL_100_MEALS } from '../lib/budgetMealsData';

const ALL_150_MEALS = [...ORIGINAL_100_MEALS, ...NEW_50_MEALS];

console.log(`Original meals: ${ORIGINAL_100_MEALS.length}`);
console.log(`New meals: ${NEW_50_MEALS.length}`);
console.log(`Total meals: ${ALL_150_MEALS.length}`);

// Write JSON files
const backendJsonPath = 'd:/Life_Cycle/lifeplan/backend/src/lib/budgetMeals.json';
const frontendJsonPath = 'd:/Life_Cycle/lifeplan/frontend/src/lib/budgetMeals.json';

fs.writeFileSync(backendJsonPath, JSON.stringify(ALL_150_MEALS, null, 2), 'utf-8');
fs.writeFileSync(frontendJsonPath, JSON.stringify(ALL_150_MEALS, null, 2), 'utf-8');
console.log('[OK] Written budgetMeals.json in backend & frontend');

// Write TypeScript files
const tsContent = `export interface BudgetThaiMeal {
  id: number;
  name_th: string;
  name_en: string;
  category: string;
  slot: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  kcal: number;
  protein_g: number;
  carb_g: number;
  fat_g: number;
  price_thb: number;
  source: string;
  tip: string;
  query?: string;
  image: string;
}

export const BUDGET_THAI_MEALS: BudgetThaiMeal[] = ${JSON.stringify(ALL_150_MEALS, null, 2)};
`;

const backendTsPath = 'd:/Life_Cycle/lifeplan/backend/src/lib/budgetMealsData.ts';
const frontendTsPath = 'd:/Life_Cycle/lifeplan/frontend/src/lib/budgetMealsData.ts';

fs.writeFileSync(backendTsPath, tsContent, 'utf-8');
fs.writeFileSync(frontendTsPath, tsContent, 'utf-8');
console.log('[OK] Written budgetMealsData.ts in backend & frontend');
