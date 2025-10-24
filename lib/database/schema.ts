/**
 * SQLite Database Schema for Kidney Care App
 * Offline-first storage with sync capabilities
 */

export const CREATE_TABLES = `
  -- Users table
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    role TEXT NOT NULL,
    profile_picture TEXT,
    date_of_birth TEXT,
    gender TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );

  -- Vitals table
  CREATE TABLE IF NOT EXISTS vitals (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    date TEXT NOT NULL,
    weight REAL,
    systolic INTEGER,
    diastolic INTEGER,
    heart_rate INTEGER,
    oxygen_saturation REAL,
    fluid_intake REAL,
    urine_output REAL,
    temperature REAL,
    notes TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    synced INTEGER DEFAULT 0,
    FOREIGN KEY (user_id) REFERENCES users (id)
  );

  -- Lab reports table
  CREATE TABLE IF NOT EXISTS lab_reports (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    date TEXT NOT NULL,
    report_name TEXT,
    creatinine REAL,
    egfr REAL,
    bun REAL,
    potassium REAL,
    sodium REAL,
    phosphorus REAL,
    calcium REAL,
    magnesium REAL,
    bicarbonate REAL,
    albumin REAL,
    hemoglobin REAL,
    wbc REAL,
    rbc REAL,
    platelets REAL,
    ferritin REAL,
    pth REAL,
    pdf_url TEXT,
    image_url TEXT,
    notes TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    synced INTEGER DEFAULT 0,
    FOREIGN KEY (user_id) REFERENCES users (id)
  );

  -- Dialysis sessions table
  CREATE TABLE IF NOT EXISTS dialysis_sessions (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    date TEXT NOT NULL,
    start_time TEXT NOT NULL,
    end_time TEXT NOT NULL,
    duration INTEGER NOT NULL,
    pre_weight REAL,
    pre_systolic INTEGER,
    pre_diastolic INTEGER,
    post_weight REAL,
    post_systolic INTEGER,
    post_diastolic INTEGER,
    uf_goal REAL,
    uf_removed REAL,
    blood_flow_rate REAL,
    dialysate_flow_rate REAL,
    symptoms TEXT,
    complications TEXT,
    staff_notes TEXT,
    notes TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    synced INTEGER DEFAULT 0,
    FOREIGN KEY (user_id) REFERENCES users (id)
  );

  -- Food entries table
  CREATE TABLE IF NOT EXISTS food_entries (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    date TEXT NOT NULL,
    meal_type TEXT NOT NULL,
    food_name TEXT NOT NULL,
    serving_size REAL,
    serving_unit TEXT,
    calories REAL,
    protein REAL,
    carbohydrates REAL,
    fat REAL,
    potassium REAL,
    phosphorus REAL,
    sodium REAL,
    fluid REAL,
    photo_url TEXT,
    notes TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    synced INTEGER DEFAULT 0,
    FOREIGN KEY (user_id) REFERENCES users (id)
  );

  -- Medications table
  CREATE TABLE IF NOT EXISTS medications (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    name TEXT NOT NULL,
    dosage TEXT NOT NULL,
    unit TEXT NOT NULL,
    frequency TEXT NOT NULL,
    custom_frequency TEXT,
    times TEXT NOT NULL,
    start_date TEXT NOT NULL,
    end_date TEXT,
    purpose TEXT,
    instructions TEXT,
    reminder_enabled INTEGER DEFAULT 1,
    active INTEGER DEFAULT 1,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    synced INTEGER DEFAULT 0,
    FOREIGN KEY (user_id) REFERENCES users (id)
  );

  -- Medication logs table
  CREATE TABLE IF NOT EXISTS medication_logs (
    id TEXT PRIMARY KEY,
    medication_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    scheduled_time TEXT NOT NULL,
    taken_time TEXT,
    status TEXT NOT NULL,
    notes TEXT,
    created_at TEXT NOT NULL,
    synced INTEGER DEFAULT 0,
    FOREIGN KEY (medication_id) REFERENCES medications (id),
    FOREIGN KEY (user_id) REFERENCES users (id)
  );

  -- Alerts table
  CREATE TABLE IF NOT EXISTS alerts (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    type TEXT NOT NULL,
    severity TEXT NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    data TEXT,
    read INTEGER DEFAULT 0,
    created_at TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users (id)
  );

  -- Shared access table
  CREATE TABLE IF NOT EXISTS shared_access (
    id TEXT PRIMARY KEY,
    patient_id TEXT NOT NULL,
    shared_with_id TEXT NOT NULL,
    shared_with_email TEXT NOT NULL,
    shared_with_name TEXT NOT NULL,
    role TEXT NOT NULL,
    permissions TEXT NOT NULL,
    status TEXT NOT NULL,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY (patient_id) REFERENCES users (id)
  );

  -- App settings table
  CREATE TABLE IF NOT EXISTS app_settings (
    user_id TEXT PRIMARY KEY,
    theme TEXT DEFAULT 'auto',
    language TEXT DEFAULT 'en',
    units TEXT NOT NULL,
    notifications TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users (id)
  );

  -- Subscription table
  CREATE TABLE IF NOT EXISTS subscriptions (
    user_id TEXT PRIMARY KEY,
    plan TEXT NOT NULL,
    status TEXT NOT NULL,
    start_date TEXT NOT NULL,
    end_date TEXT,
    platform TEXT NOT NULL,
    transaction_id TEXT,
    FOREIGN KEY (user_id) REFERENCES users (id)
  );

  -- Sync queue table
  CREATE TABLE IF NOT EXISTS sync_queue (
    id TEXT PRIMARY KEY,
    table_name TEXT NOT NULL,
    record_id TEXT NOT NULL,
    operation TEXT NOT NULL,
    data TEXT NOT NULL,
    created_at TEXT NOT NULL,
    attempts INTEGER DEFAULT 0,
    last_attempt TEXT,
    error TEXT
  );
`;

export const CREATE_INDEXES = `
  CREATE INDEX IF NOT EXISTS idx_vitals_user_date ON vitals (user_id, date DESC);
  CREATE INDEX IF NOT EXISTS idx_vitals_synced ON vitals (synced);

  CREATE INDEX IF NOT EXISTS idx_labs_user_date ON lab_reports (user_id, date DESC);
  CREATE INDEX IF NOT EXISTS idx_labs_synced ON lab_reports (synced);

  CREATE INDEX IF NOT EXISTS idx_dialysis_user_date ON dialysis_sessions (user_id, date DESC);
  CREATE INDEX IF NOT EXISTS idx_dialysis_synced ON dialysis_sessions (synced);

  CREATE INDEX IF NOT EXISTS idx_food_user_date ON food_entries (user_id, date DESC);
  CREATE INDEX IF NOT EXISTS idx_food_synced ON food_entries (synced);

  CREATE INDEX IF NOT EXISTS idx_medications_user_active ON medications (user_id, active);
  CREATE INDEX IF NOT EXISTS idx_medications_synced ON medications (synced);

  CREATE INDEX IF NOT EXISTS idx_med_logs_med_id ON medication_logs (medication_id, scheduled_time DESC);
  CREATE INDEX IF NOT EXISTS idx_med_logs_synced ON medication_logs (synced);

  CREATE INDEX IF NOT EXISTS idx_alerts_user_read ON alerts (user_id, read, created_at DESC);

  CREATE INDEX IF NOT EXISTS idx_sync_queue_created ON sync_queue (created_at ASC);
`;
