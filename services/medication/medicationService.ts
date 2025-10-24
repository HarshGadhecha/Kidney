import { database } from '@/lib/database';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import type { Medication, MedicationLog } from '@/types';

export interface CreateMedicationData {
  userId: string;
  name: string;
  dosage: string;
  frequency: string;
  timeOfDay?: string;
  startDate?: Date;
  endDate?: Date;
  instructions?: string;
  reminderEnabled?: boolean;
}

/**
 * Configure notification handler
 */
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

/**
 * Request notification permissions
 */
export async function requestNotificationPermissions(): Promise<boolean> {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('medications', {
      name: 'Medication Reminders',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      sound: 'default',
    });
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  return finalStatus === 'granted';
}

/**
 * Schedule medication reminder notification
 */
async function scheduleMedicationReminder(
  medication: Medication
): Promise<string[]> {
  if (!medication.reminder_enabled || !medication.time_of_day) {
    return [];
  }

  const notificationIds: string[] = [];

  try {
    // Parse time of day (e.g., "08:00,14:00,20:00")
    const times = medication.time_of_day.split(',').map((t) => t.trim());

    for (const time of times) {
      const [hours, minutes] = time.split(':').map(Number);

      const trigger: Notifications.DailyTriggerInput = {
        hour: hours,
        minute: minutes,
        repeats: true,
      };

      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Medication Reminder',
          body: `Time to take ${medication.name} (${medication.dosage})`,
          data: { medicationId: medication.id },
          sound: 'default',
          priority: Notifications.AndroidNotificationPriority.HIGH,
        },
        trigger,
      });

      notificationIds.push(notificationId);
    }
  } catch (error) {
    console.error('Schedule reminder error:', error);
  }

  return notificationIds;
}

/**
 * Cancel medication reminders
 */
async function cancelMedicationReminders(notificationIds: string[]): Promise<void> {
  try {
    for (const id of notificationIds) {
      await Notifications.cancelScheduledNotificationAsync(id);
    }
  } catch (error) {
    console.error('Cancel reminders error:', error);
  }
}

/**
 * Create a new medication
 */
export async function createMedication(
  data: CreateMedicationData
): Promise<Medication> {
  const db = database.getDatabase();

  const id = `med_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const timestamp = new Date().toISOString();

  await db.runAsync(
    `INSERT INTO medications (
      id, user_id, name, dosage, frequency,
      time_of_day, start_date, end_date, instructions,
      reminder_enabled, created_at, synced
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      data.userId,
      data.name,
      data.dosage,
      data.frequency,
      data.timeOfDay || null,
      data.startDate?.toISOString() || timestamp,
      data.endDate?.toISOString() || null,
      data.instructions || null,
      data.reminderEnabled ? 1 : 0,
      timestamp,
      0,
    ]
  );

  const medication = await db.getFirstAsync<Medication>(
    'SELECT * FROM medications WHERE id = ?',
    [id]
  );

  if (!medication) {
    throw new Error('Failed to create medication');
  }

  // Schedule reminders if enabled
  if (medication.reminder_enabled) {
    const hasPermission = await requestNotificationPermissions();
    if (hasPermission) {
      await scheduleMedicationReminder(medication);
    }
  }

  return medication;
}

/**
 * Get medications for a user
 */
export async function getMedications(
  userId: string,
  includeInactive: boolean = false
): Promise<Medication[]> {
  const db = database.getDatabase();

  let query = 'SELECT * FROM medications WHERE user_id = ?';
  const params: any[] = [userId];

  if (!includeInactive) {
    query += ` AND (end_date IS NULL OR end_date > datetime('now'))`;
  }

  query += ' ORDER BY created_at DESC';

  const medications = await db.getAllAsync<Medication>(query, params);
  return medications;
}

/**
 * Get a single medication by ID
 */
export async function getMedication(id: string): Promise<Medication | null> {
  const db = database.getDatabase();

  const medication = await db.getFirstAsync<Medication>(
    'SELECT * FROM medications WHERE id = ?',
    [id]
  );

  return medication || null;
}

/**
 * Update a medication
 */
export async function updateMedication(
  id: string,
  updates: Partial<CreateMedicationData>
): Promise<void> {
  const db = database.getDatabase();

  const fields: string[] = [];
  const values: any[] = [];

  if (updates.name !== undefined) {
    fields.push('name = ?');
    values.push(updates.name);
  }
  if (updates.dosage !== undefined) {
    fields.push('dosage = ?');
    values.push(updates.dosage);
  }
  if (updates.frequency !== undefined) {
    fields.push('frequency = ?');
    values.push(updates.frequency);
  }
  if (updates.timeOfDay !== undefined) {
    fields.push('time_of_day = ?');
    values.push(updates.timeOfDay || null);
  }
  if (updates.startDate !== undefined) {
    fields.push('start_date = ?');
    values.push(updates.startDate?.toISOString() || null);
  }
  if (updates.endDate !== undefined) {
    fields.push('end_date = ?');
    values.push(updates.endDate?.toISOString() || null);
  }
  if (updates.instructions !== undefined) {
    fields.push('instructions = ?');
    values.push(updates.instructions || null);
  }
  if (updates.reminderEnabled !== undefined) {
    fields.push('reminder_enabled = ?');
    values.push(updates.reminderEnabled ? 1 : 0);
  }

  fields.push('synced = ?');
  values.push(0);

  values.push(id);

  await db.runAsync(
    `UPDATE medications SET ${fields.join(', ')} WHERE id = ?`,
    values
  );

  // Reschedule reminders if needed
  const medication = await getMedication(id);
  if (medication) {
    // Cancel all existing notifications for this medication
    // (In a production app, you'd store notification IDs in the database)
    await Notifications.cancelAllScheduledNotificationsAsync();

    // Reschedule if reminder is enabled
    if (medication.reminder_enabled) {
      const hasPermission = await requestNotificationPermissions();
      if (hasPermission) {
        await scheduleMedicationReminder(medication);
      }
    }
  }
}

/**
 * Delete a medication
 */
export async function deleteMedication(id: string): Promise<void> {
  const db = database.getDatabase();

  // Cancel reminders
  await Notifications.cancelAllScheduledNotificationsAsync();

  // Delete medication
  await db.runAsync('DELETE FROM medications WHERE id = ?', [id]);

  // Delete associated logs
  await db.runAsync('DELETE FROM medication_logs WHERE medication_id = ?', [id]);
}

/**
 * Log medication intake
 */
export async function logMedicationIntake(
  medicationId: string,
  userId: string,
  taken: boolean = true,
  notes?: string
): Promise<MedicationLog> {
  const db = database.getDatabase();

  const id = `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const timestamp = new Date().toISOString();

  await db.runAsync(
    `INSERT INTO medication_logs (
      id, medication_id, user_id, taken_at, taken, notes, created_at, synced
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [id, medicationId, userId, timestamp, taken ? 1 : 0, notes || null, timestamp, 0]
  );

  const log = await db.getFirstAsync<MedicationLog>(
    'SELECT * FROM medication_logs WHERE id = ?',
    [id]
  );

  if (!log) {
    throw new Error('Failed to create medication log');
  }

  return log;
}

/**
 * Get medication logs
 */
export async function getMedicationLogs(
  userId: string,
  medicationId?: string,
  limit: number = 30
): Promise<MedicationLog[]> {
  const db = database.getDatabase();

  let query = 'SELECT * FROM medication_logs WHERE user_id = ?';
  const params: any[] = [userId];

  if (medicationId) {
    query += ' AND medication_id = ?';
    params.push(medicationId);
  }

  query += ' ORDER BY taken_at DESC LIMIT ?';
  params.push(limit);

  const logs = await db.getAllAsync<MedicationLog>(query, params);
  return logs;
}

/**
 * Get medication adherence stats
 */
export async function getMedicationAdherence(
  userId: string,
  days: number = 7
): Promise<{
  totalDoses: number;
  takenDoses: number;
  missedDoses: number;
  adherenceRate: number;
}> {
  const db = database.getDatabase();

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const result = await db.getFirstAsync<any>(
    `SELECT
      COUNT(*) as totalDoses,
      SUM(CASE WHEN taken = 1 THEN 1 ELSE 0 END) as takenDoses,
      SUM(CASE WHEN taken = 0 THEN 1 ELSE 0 END) as missedDoses
     FROM medication_logs
     WHERE user_id = ?
     AND taken_at >= ?`,
    [userId, startDate.toISOString()]
  );

  const totalDoses = result?.totalDoses || 0;
  const takenDoses = result?.takenDoses || 0;
  const missedDoses = result?.missedDoses || 0;
  const adherenceRate = totalDoses > 0 ? (takenDoses / totalDoses) * 100 : 0;

  return {
    totalDoses,
    takenDoses,
    missedDoses,
    adherenceRate,
  };
}
