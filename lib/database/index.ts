/**
 * SQLite Database Manager
 * Handles database initialization, connections, and operations
 */

import * as SQLite from 'expo-sqlite';
import { CREATE_TABLES, CREATE_INDEXES } from './schema';

const DB_NAME = 'kidney_care.db';

let db: SQLite.SQLiteDatabase | null = null;

/**
 * Initialize database connection
 */
export async function initDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (db) {
    return db;
  }

  try {
    db = await SQLite.openDatabaseAsync(DB_NAME);

    // Enable foreign keys
    await db.execAsync('PRAGMA foreign_keys = ON;');

    // Create tables
    await db.execAsync(CREATE_TABLES);

    // Create indexes
    await db.execAsync(CREATE_INDEXES);

    console.log('Database initialized successfully');
    return db;
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
}

/**
 * Get database instance
 */
export function getDatabase(): SQLite.SQLiteDatabase {
  if (!db) {
    throw new Error('Database not initialized. Call initDatabase() first.');
  }
  return db;
}

/**
 * Close database connection
 */
export async function closeDatabase(): Promise<void> {
  if (db) {
    await db.closeAsync();
    db = null;
    console.log('Database closed');
  }
}

/**
 * Clear all data (for testing/development)
 */
export async function clearDatabase(): Promise<void> {
  const database = getDatabase();

  const tables = [
    'users',
    'vitals',
    'lab_reports',
    'dialysis_sessions',
    'food_entries',
    'medications',
    'medication_logs',
    'alerts',
    'shared_access',
    'app_settings',
    'subscriptions',
    'sync_queue',
  ];

  for (const table of tables) {
    await database.execAsync(`DELETE FROM ${table};`);
  }

  console.log('Database cleared');
}

/**
 * Execute a query and return results
 */
export async function executeQuery<T = any>(
  query: string,
  params: any[] = []
): Promise<T[]> {
  const database = getDatabase();

  try {
    const result = await database.getAllAsync<T>(query, params);
    return result;
  } catch (error) {
    console.error('Query error:', error);
    throw error;
  }
}

/**
 * Execute a query and return first result
 */
export async function executeQueryOne<T = any>(
  query: string,
  params: any[] = []
): Promise<T | null> {
  const database = getDatabase();

  try {
    const result = await database.getFirstAsync<T>(query, params);
    return result || null;
  } catch (error) {
    console.error('Query error:', error);
    throw error;
  }
}

/**
 * Execute an INSERT/UPDATE/DELETE query
 */
export async function executeUpdate(
  query: string,
  params: any[] = []
): Promise<SQLite.SQLiteRunResult> {
  const database = getDatabase();

  try {
    const result = await database.runAsync(query, params);
    return result;
  } catch (error) {
    console.error('Update error:', error);
    throw error;
  }
}

/**
 * Execute multiple queries in a transaction
 */
export async function executeTransaction(
  queries: Array<{ query: string; params?: any[] }>
): Promise<void> {
  const database = getDatabase();

  try {
    await database.withTransactionAsync(async () => {
      for (const { query, params = [] } of queries) {
        await database.runAsync(query, params);
      }
    });
  } catch (error) {
    console.error('Transaction error:', error);
    throw error;
  }
}

/**
 * Count records in a table
 */
export async function countRecords(
  table: string,
  where?: string,
  params: any[] = []
): Promise<number> {
  const whereClause = where ? `WHERE ${where}` : '';
  const query = `SELECT COUNT(*) as count FROM ${table} ${whereClause}`;

  const result = await executeQueryOne<{ count: number }>(query, params);
  return result?.count || 0;
}

/**
 * Check if database exists
 */
export function isDatabaseInitialized(): boolean {
  return db !== null;
}

export default {
  initDatabase,
  getDatabase,
  closeDatabase,
  clearDatabase,
  executeQuery,
  executeQueryOne,
  executeUpdate,
  executeTransaction,
  countRecords,
  isDatabaseInitialized,
};
