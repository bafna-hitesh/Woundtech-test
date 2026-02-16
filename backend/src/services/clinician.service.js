import db from '../db/connection.js';

// Get all clinicians
export function getAllClinicians() {
  const stmt = db.prepare('SELECT * FROM clinicians ORDER BY name ASC');
  return stmt.all();
}

// Get single clinician by ID
export function getClinicianById(id) {
  const stmt = db.prepare('SELECT * FROM clinicians WHERE id = ?');
  return stmt.get(id);
}

// Create new clinician
export function createClinician(data) {
  const stmt = db.prepare(`
    INSERT INTO clinicians (name, specialty, email)
    VALUES (@name, @specialty, @email)
  `);
  
  const result = stmt.run({
    name: data.name,
    specialty: data.specialty || null,
    email: data.email || null,
  });
  
  // Return the newly created clinician
  return getClinicianById(result.lastInsertRowid);
}

// Delete clinician
export function deleteClinician(id) {
  const stmt = db.prepare('DELETE FROM clinicians WHERE id = ?');
  const result = stmt.run(id);
  return result.changes > 0; // Returns true if a row was deleted
}
