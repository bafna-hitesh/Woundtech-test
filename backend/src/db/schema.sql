-- Clinicians table: Stores healthcare providers
CREATE TABLE IF NOT EXISTS clinicians (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  specialty TEXT,
  email TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Patients table: Stores patient information
CREATE TABLE IF NOT EXISTS patients (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  date_of_birth DATE,
  email TEXT,
  phone TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Visits table: Links clinicians and patients with appointment details
CREATE TABLE IF NOT EXISTS visits (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  clinician_id INTEGER NOT NULL,
  patient_id INTEGER NOT NULL,
  visit_date DATETIME NOT NULL,
  duration_minutes INTEGER DEFAULT 30,
  status TEXT DEFAULT 'scheduled' CHECK(status IN ('scheduled', 'completed', 'cancelled')),
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (clinician_id) REFERENCES clinicians(id) ON DELETE CASCADE,
  FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE
);

-- Index for faster date range queries (important for calendar view)
CREATE INDEX IF NOT EXISTS idx_visits_date ON visits(visit_date);

-- Index for filtering by clinician
CREATE INDEX IF NOT EXISTS idx_visits_clinician ON visits(clinician_id);

-- Index for filtering by patient
CREATE INDEX IF NOT EXISTS idx_visits_patient ON visits(patient_id);
