/**
 * Vitals Service
 * Handles all vitals-related database operations
 */

import { executeQuery, executeQueryOne, executeUpdate } from '../../lib/database';
import { VitalRecord } from '../../types';
import { format } from 'date-fns';

/**
 * Create a new vital record
 */
export async function createVitalRecord(
  userId: string,
  data: Partial<VitalRecord>
): Promise<VitalRecord> {
  const id = `vital_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const now = new Date().toISOString();

  const record: VitalRecord = {
    id,
    userId,
    date: data.date || format(new Date(), 'yyyy-MM-dd'),
    weight: data.weight,
    systolic: data.systolic,
    diastolic: data.diastolic,
    heartRate: data.heartRate,
    oxygenSaturation: data.oxygenSaturation,
    fluidIntake: data.fluidIntake,
    urineOutput: data.urineOutput,
    temperature: data.temperature,
    notes: data.notes,
    createdAt: now,
    updatedAt: now,
    synced: false,
  };

  const query = `
    INSERT INTO vitals (
      id, user_id, date, weight, systolic, diastolic, heart_rate,
      oxygen_saturation, fluid_intake, urine_output, temperature,
      notes, created_at, updated_at, synced
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const params = [
    record.id,
    record.userId,
    record.date,
    record.weight,
    record.systolic,
    record.diastolic,
    record.heartRate,
    record.oxygenSaturation,
    record.fluidIntake,
    record.urineOutput,
    record.temperature,
    record.notes,
    record.createdAt,
    record.updatedAt,
    record.synced ? 1 : 0,
  ];

  await executeUpdate(query, params);
  return record;
}

/**
 * Get vital records for a user
 */
export async function getVitalRecords(
  userId: string,
  limit: number = 30
): Promise<VitalRecord[]> {
  const query = `
    SELECT
      id, user_id as userId, date, weight, systolic, diastolic,
      heart_rate as heartRate, oxygen_saturation as oxygenSaturation,
      fluid_intake as fluidIntake, urine_output as urineOutput,
      temperature, notes, created_at as createdAt,
      updated_at as updatedAt, synced
    FROM vitals
    WHERE user_id = ?
    ORDER BY date DESC, created_at DESC
    LIMIT ?
  `;

  const results = await executeQuery<VitalRecord>(query, [userId, limit]);
  return results.map((r) => ({ ...r, synced: !!r.synced }));
}

/**
 * Get vital record by ID
 */
export async function getVitalRecord(id: string): Promise<VitalRecord | null> {
  const query = `
    SELECT
      id, user_id as userId, date, weight, systolic, diastolic,
      heart_rate as heartRate, oxygen_saturation as oxygenSaturation,
      fluid_intake as fluidIntake, urine_output as urineOutput,
      temperature, notes, created_at as createdAt,
      updated_at as updatedAt, synced
    FROM vitals
    WHERE id = ?
  `;

  const result = await executeQueryOne<VitalRecord>(query, [id]);
  if (result) {
    return { ...result, synced: !!result.synced };
  }
  return null;
}

/**
 * Get vitals for a specific date
 */
export async function getVitalsByDate(
  userId: string,
  date: string
): Promise<VitalRecord | null> {
  const query = `
    SELECT
      id, user_id as userId, date, weight, systolic, diastolic,
      heart_rate as heartRate, oxygen_saturation as oxygenSaturation,
      fluid_intake as fluidIntake, urine_output as urineOutput,
      temperature, notes, created_at as createdAt,
      updated_at as updatedAt, synced
    FROM vitals
    WHERE user_id = ? AND date = ?
    ORDER BY created_at DESC
    LIMIT 1
  `;

  const result = await executeQueryOne<VitalRecord>(query, [userId, date]);
  if (result) {
    return { ...result, synced: !!result.synced };
  }
  return null;
}

/**
 * Update vital record
 */
export async function updateVitalRecord(
  id: string,
  data: Partial<VitalRecord>
): Promise<void> {
  const now = new Date().toISOString();

  const query = `
    UPDATE vitals SET
      weight = COALESCE(?, weight),
      systolic = COALESCE(?, systolic),
      diastolic = COALESCE(?, diastolic),
      heart_rate = COALESCE(?, heart_rate),
      oxygen_saturation = COALESCE(?, oxygen_saturation),
      fluid_intake = COALESCE(?, fluid_intake),
      urine_output = COALESCE(?, urine_output),
      temperature = COALESCE(?, temperature),
      notes = COALESCE(?, notes),
      updated_at = ?,
      synced = 0
    WHERE id = ?
  `;

  const params = [
    data.weight,
    data.systolic,
    data.diastolic,
    data.heartRate,
    data.oxygenSaturation,
    data.fluidIntake,
    data.urineOutput,
    data.temperature,
    data.notes,
    now,
    id,
  ];

  await executeUpdate(query, params);
}

/**
 * Delete vital record
 */
export async function deleteVitalRecord(id: string): Promise<void> {
  const query = 'DELETE FROM vitals WHERE id = ?';
  await executeUpdate(query, [id]);
}

/**
 * Get vital trends (last N days)
 */
export async function getVitalTrends(
  userId: string,
  days: number = 7
): Promise<VitalRecord[]> {
  const query = `
    SELECT
      id, user_id as userId, date, weight, systolic, diastolic,
      heart_rate as heartRate, oxygen_saturation as oxygenSaturation,
      fluid_intake as fluidIntake, urine_output as urineOutput,
      temperature, notes, created_at as createdAt,
      updated_at as updatedAt, synced
    FROM vitals
    WHERE user_id = ?
      AND date >= date('now', '-' || ? || ' days')
    ORDER BY date ASC
  `;

  const results = await executeQuery<VitalRecord>(query, [userId, days]);
  return results.map((r) => ({ ...r, synced: !!r.synced }));
}
