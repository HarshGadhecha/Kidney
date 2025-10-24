import { database } from '@/lib/database';
import type { FoodEntry } from '@/types';

export interface CreateFoodEntryData {
  userId: string;
  name: string;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  servingSize?: string;
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  sodium?: number;
  potassium?: number;
  phosphorus?: number;
  fluid?: number;
  notes?: string;
  date?: Date;
}

/**
 * Create a new food entry
 */
export async function createFoodEntry(data: CreateFoodEntryData): Promise<FoodEntry> {
  const db = database.getDatabase();

  const id = `food_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const timestamp = (data.date || new Date()).toISOString();

  await db.runAsync(
    `INSERT INTO food_entries (
      id, user_id, date, name, meal_type,
      serving_size, calories, protein, carbs, fat,
      sodium, potassium, phosphorus, fluid, notes,
      created_at, synced
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      data.userId,
      timestamp,
      data.name,
      data.mealType,
      data.servingSize || null,
      data.calories || null,
      data.protein || null,
      data.carbs || null,
      data.fat || null,
      data.sodium || null,
      data.potassium || null,
      data.phosphorus || null,
      data.fluid || null,
      data.notes || null,
      timestamp,
      0,
    ]
  );

  const entry = await db.getFirstAsync<FoodEntry>(
    'SELECT * FROM food_entries WHERE id = ?',
    [id]
  );

  if (!entry) {
    throw new Error('Failed to create food entry');
  }

  return entry;
}

/**
 * Get food entries for a user
 */
export async function getFoodEntries(
  userId: string,
  limit: number = 30
): Promise<FoodEntry[]> {
  const db = database.getDatabase();

  const entries = await db.getAllAsync<FoodEntry>(
    `SELECT * FROM food_entries
     WHERE user_id = ?
     ORDER BY date DESC, created_at DESC
     LIMIT ?`,
    [userId, limit]
  );

  return entries;
}

/**
 * Get food entries for a specific date
 */
export async function getFoodEntriesByDate(
  userId: string,
  date: Date
): Promise<FoodEntry[]> {
  const db = database.getDatabase();

  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  const entries = await db.getAllAsync<FoodEntry>(
    `SELECT * FROM food_entries
     WHERE user_id = ?
     AND date >= ? AND date <= ?
     ORDER BY date DESC`,
    [userId, startOfDay.toISOString(), endOfDay.toISOString()]
  );

  return entries;
}

/**
 * Get daily nutrition summary
 */
export async function getDailyNutritionSummary(
  userId: string,
  date: Date
): Promise<{
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  totalSodium: number;
  totalPotassium: number;
  totalPhosphorus: number;
  totalFluid: number;
  entriesCount: number;
}> {
  const db = database.getDatabase();

  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  const result = await db.getFirstAsync<any>(
    `SELECT
      COUNT(*) as entriesCount,
      COALESCE(SUM(calories), 0) as totalCalories,
      COALESCE(SUM(protein), 0) as totalProtein,
      COALESCE(SUM(carbs), 0) as totalCarbs,
      COALESCE(SUM(fat), 0) as totalFat,
      COALESCE(SUM(sodium), 0) as totalSodium,
      COALESCE(SUM(potassium), 0) as totalPotassium,
      COALESCE(SUM(phosphorus), 0) as totalPhosphorus,
      COALESCE(SUM(fluid), 0) as totalFluid
     FROM food_entries
     WHERE user_id = ?
     AND date >= ? AND date <= ?`,
    [userId, startOfDay.toISOString(), endOfDay.toISOString()]
  );

  return {
    totalCalories: result?.totalCalories || 0,
    totalProtein: result?.totalProtein || 0,
    totalCarbs: result?.totalCarbs || 0,
    totalFat: result?.totalFat || 0,
    totalSodium: result?.totalSodium || 0,
    totalPotassium: result?.totalPotassium || 0,
    totalPhosphorus: result?.totalPhosphorus || 0,
    totalFluid: result?.totalFluid || 0,
    entriesCount: result?.entriesCount || 0,
  };
}

/**
 * Update a food entry
 */
export async function updateFoodEntry(
  id: string,
  updates: Partial<CreateFoodEntryData>
): Promise<void> {
  const db = database.getDatabase();

  const fields: string[] = [];
  const values: any[] = [];

  if (updates.name !== undefined) {
    fields.push('name = ?');
    values.push(updates.name);
  }
  if (updates.mealType !== undefined) {
    fields.push('meal_type = ?');
    values.push(updates.mealType);
  }
  if (updates.servingSize !== undefined) {
    fields.push('serving_size = ?');
    values.push(updates.servingSize || null);
  }
  if (updates.calories !== undefined) {
    fields.push('calories = ?');
    values.push(updates.calories || null);
  }
  if (updates.protein !== undefined) {
    fields.push('protein = ?');
    values.push(updates.protein || null);
  }
  if (updates.carbs !== undefined) {
    fields.push('carbs = ?');
    values.push(updates.carbs || null);
  }
  if (updates.fat !== undefined) {
    fields.push('fat = ?');
    values.push(updates.fat || null);
  }
  if (updates.sodium !== undefined) {
    fields.push('sodium = ?');
    values.push(updates.sodium || null);
  }
  if (updates.potassium !== undefined) {
    fields.push('potassium = ?');
    values.push(updates.potassium || null);
  }
  if (updates.phosphorus !== undefined) {
    fields.push('phosphorus = ?');
    values.push(updates.phosphorus || null);
  }
  if (updates.fluid !== undefined) {
    fields.push('fluid = ?');
    values.push(updates.fluid || null);
  }
  if (updates.notes !== undefined) {
    fields.push('notes = ?');
    values.push(updates.notes || null);
  }

  fields.push('synced = ?');
  values.push(0);

  values.push(id);

  await db.runAsync(
    `UPDATE food_entries SET ${fields.join(', ')} WHERE id = ?`,
    values
  );
}

/**
 * Delete a food entry
 */
export async function deleteFoodEntry(id: string): Promise<void> {
  const db = database.getDatabase();
  await db.runAsync('DELETE FROM food_entries WHERE id = ?', [id]);
}

/**
 * Get a single food entry by ID
 */
export async function getFoodEntry(id: string): Promise<FoodEntry | null> {
  const db = database.getDatabase();

  const entry = await db.getFirstAsync<FoodEntry>(
    'SELECT * FROM food_entries WHERE id = ?',
    [id]
  );

  return entry || null;
}
