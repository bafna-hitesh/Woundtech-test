import db from '../db/connection.js';

// Get all patients
export function getAllPatients() {
  const stmt = db.prepare('SELECT * FROM patients ORDER BY name ASC');
  return stmt.all();
}

// Get single patient by ID
export function getPatientById(id) {
  const stmt = db.prepare('SELECT * FROM patients WHERE id = ?');
  return stmt.get(id);
}

// Create new patient
export function createPatient(data) {
  const stmt = db.prepare(`
    INSERT INTO patients (name, date_of_birth, email, phone)
    VALUES (@name, @date_of_birth, @email, @phone)
  `);
  
  const result = stmt.run({
    name: data.name,
    date_of_birth: data.date_of_birth || null,
    email: data.email || null,
    phone: data.phone || null,
  });
  
  // Return the newly created patient
  return getPatientById(result.lastInsertRowid);
}

// Delete patient
export function deletePatient(id) {
  const stmt = db.prepare('DELETE FROM patients WHERE id = ?');
  const result = stmt.run(id);
  return result.changes > 0;
}
