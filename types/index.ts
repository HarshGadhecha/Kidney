/**
 * Core TypeScript types for Kidney Care App
 */

// User and Authentication
export type UserRole = 'patient' | 'caregiver' | 'doctor';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  profilePicture?: string;
  dateOfBirth?: string;
  gender?: 'male' | 'female' | 'other';
  createdAt: string;
  updatedAt: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isPremium: boolean;
  subscriptionExpiry?: string;
}

// Vitals
export interface VitalRecord {
  id: string;
  userId: string;
  date: string;
  weight?: number; // kg
  systolic?: number; // mmHg
  diastolic?: number; // mmHg
  heartRate?: number; // bpm
  oxygenSaturation?: number; // %
  fluidIntake?: number; // ml
  urineOutput?: number; // ml
  temperature?: number; // °C
  notes?: string;
  createdAt: string;
  updatedAt: string;
  synced: boolean;
}

export interface VitalStats {
  average: number;
  min: number;
  max: number;
  trend: 'up' | 'down' | 'stable';
}

// Lab Reports
export interface LabReport {
  id: string;
  userId: string;
  date: string;
  reportName?: string;

  // Kidney Function
  creatinine?: number; // mg/dL
  eGFR?: number; // mL/min/1.73m²
  bun?: number; // mg/dL

  // Electrolytes
  potassium?: number; // mEq/L
  sodium?: number; // mEq/L
  phosphorus?: number; // mg/dL
  calcium?: number; // mg/dL
  magnesium?: number; // mg/dL
  bicarbonate?: number; // mEq/L

  // Blood Tests
  albumin?: number; // g/dL
  hemoglobin?: number; // g/dL
  wbc?: number; // K/µL
  rbc?: number; // M/µL
  platelets?: number; // K/µL

  // Other
  ferritin?: number; // ng/mL
  pth?: number; // pg/mL

  pdfUrl?: string;
  imageUrl?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  synced: boolean;
}

export interface LabValue {
  name: string;
  value: number;
  unit: string;
  normalRange: { min: number; max: number };
  status: 'normal' | 'warning' | 'critical';
}

// Dialysis
export interface DialysisSession {
  id: string;
  userId: string;
  date: string;
  startTime: string;
  endTime: string;
  duration: number; // minutes

  // Pre-dialysis
  preWeight?: number; // kg
  preSystolic?: number;
  preDiastolic?: number;

  // Post-dialysis
  postWeight?: number; // kg
  postSystolic?: number;
  postDiastolic?: number;

  // Session details
  ufGoal?: number; // ml
  ufRemoved?: number; // ml
  bloodFlowRate?: number; // ml/min
  dialysateFlowRate?: number; // ml/min

  symptoms?: string[];
  complications?: string;
  staffNotes?: string;
  notes?: string;

  createdAt: string;
  updatedAt: string;
  synced: boolean;
}

// Food & Nutrition
export interface FoodEntry {
  id: string;
  userId: string;
  date: string;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  foodName: string;

  // Nutrients (per 100g or serving)
  servingSize?: number;
  servingUnit?: string;
  calories?: number;
  protein?: number; // g
  carbohydrates?: number; // g
  fat?: number; // g

  // Critical for dialysis patients
  potassium?: number; // mg
  phosphorus?: number; // mg
  sodium?: number; // mg
  fluid?: number; // ml

  photoUrl?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  synced: boolean;
}

export interface DailyNutrition {
  date: string;
  totalCalories: number;
  totalProtein: number;
  totalPotassium: number;
  totalPhosphorus: number;
  totalSodium: number;
  totalFluid: number;
  goals: {
    potassium: number;
    phosphorus: number;
    sodium: number;
    fluid: number;
  };
}

// Medication
export interface Medication {
  id: string;
  userId: string;
  name: string;
  dosage: string;
  unit: string;
  frequency: 'daily' | 'twice-daily' | 'three-times-daily' | 'as-needed' | 'custom';
  customFrequency?: string;
  times: string[]; // e.g., ["08:00", "20:00"]
  startDate: string;
  endDate?: string;
  purpose?: string;
  instructions?: string;
  reminderEnabled: boolean;
  active: boolean;
  createdAt: string;
  updatedAt: string;
  synced: boolean;
}

export interface MedicationLog {
  id: string;
  medicationId: string;
  userId: string;
  scheduledTime: string;
  takenTime?: string;
  status: 'taken' | 'missed' | 'skipped';
  notes?: string;
  createdAt: string;
  synced: boolean;
}

// Notifications & Alerts
export interface Alert {
  id: string;
  userId: string;
  type: 'lab' | 'vital' | 'medication' | 'fluid' | 'appointment';
  severity: 'info' | 'warning' | 'critical';
  title: string;
  message: string;
  data?: any;
  read: boolean;
  createdAt: string;
}

export interface NotificationSettings {
  labAlerts: boolean;
  medicationReminders: boolean;
  fluidAlerts: boolean;
  vitalAlerts: boolean;
  appointmentReminders: boolean;
  quietHoursStart?: string;
  quietHoursEnd?: string;
}

// Sharing & Access
export interface SharedAccess {
  id: string;
  patientId: string;
  sharedWithId: string;
  sharedWithEmail: string;
  sharedWithName: string;
  role: 'caregiver' | 'doctor';
  permissions: {
    viewVitals: boolean;
    viewLabs: boolean;
    viewMedications: boolean;
    viewFood: boolean;
    viewDialysis: boolean;
  };
  status: 'pending' | 'active' | 'revoked';
  createdAt: string;
  updatedAt: string;
}

// Subscription
export interface Subscription {
  userId: string;
  plan: 'free' | 'premium';
  status: 'active' | 'expired' | 'cancelled';
  startDate: string;
  endDate?: string;
  platform: 'ios' | 'android';
  transactionId?: string;
}

// Charts & Analytics
export interface ChartDataPoint {
  date: string;
  value: number;
  label?: string;
}

export interface TrendData {
  period: '7d' | '30d' | '90d' | '1y';
  data: ChartDataPoint[];
  average: number;
  trend: 'up' | 'down' | 'stable';
  change: number; // percentage
}

// App State
export interface AppSettings {
  theme: 'light' | 'dark' | 'auto';
  language: 'en' | 'es' | 'fr' | 'de';
  units: {
    weight: 'kg' | 'lb';
    height: 'cm' | 'in';
    temperature: 'c' | 'f';
    fluid: 'ml' | 'oz';
  };
  notifications: NotificationSettings;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

// Sync
export interface SyncStatus {
  lastSync?: string;
  pendingCount: number;
  isSyncing: boolean;
  syncErrors: string[];
}
