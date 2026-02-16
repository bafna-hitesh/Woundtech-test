import db from '../db/connection.js';

// Get visits with optional filters (for calendar view)
export function getVisits(filters = {}) {
  let query = `
    SELECT 
      v.id,
      v.visit_date,
      v.duration_minutes,
      v.status,
      v.notes,
      v.created_at,
      v.clinician_id,
      v.patient_id,
      c.name as clinician_name,
      c.specialty as clinician_specialty,
      p.name as patient_name,
      p.email as patient_email
    FROM visits v
    JOIN clinicians c ON v.clinician_id = c.id
    JOIN patients p ON v.patient_id = p.id
    WHERE 1=1
  `;
  
  const params = {};
  
  // Filter by clinician
  if (filters.clinician_id) {
    query += ' AND v.clinician_id = @clinician_id';
    params.clinician_id = filters.clinician_id;
  }
  
  // Filter by patient
  if (filters.patient_id) {
    query += ' AND v.patient_id = @patient_id';
    params.patient_id = filters.patient_id;
  }
  
  // Filter by status
  if (filters.status) {
    query += ' AND v.status = @status';
    params.status = filters.status;
  }
  
  // Filter by date range (important for calendar view!)
  if (filters.start_date) {
    query += ' AND v.visit_date >= @start_date';
    // Ensure we match from start of day
    params.start_date = filters.start_date.includes(' ') 
      ? filters.start_date 
      : `${filters.start_date} 00:00`;
  }
  
  if (filters.end_date) {
    query += ' AND v.visit_date <= @end_date';
    // Ensure we match until end of day
    params.end_date = filters.end_date.includes(' ') 
      ? filters.end_date 
      : `${filters.end_date} 23:59`;
  }
  
  // Order by visit date (newest first for list, can be adjusted for calendar)
  query += ' ORDER BY v.visit_date DESC';
  
  const stmt = db.prepare(query);
  return stmt.all(params);
}

// Get single visit by ID
export function getVisitById(id) {
  const stmt = db.prepare(`
    SELECT 
      v.*,
      c.name as clinician_name,
      c.specialty as clinician_specialty,
      p.name as patient_name,
      p.email as patient_email
    FROM visits v
    JOIN clinicians c ON v.clinician_id = c.id
    JOIN patients p ON v.patient_id = p.id
    WHERE v.id = ?
  `);
  return stmt.get(id);
}

// Create new visit
export function createVisit(data) {
  const stmt = db.prepare(`
    INSERT INTO visits (clinician_id, patient_id, visit_date, duration_minutes, status, notes)
    VALUES (@clinician_id, @patient_id, @visit_date, @duration_minutes, @status, @notes)
  `);
  
  const result = stmt.run({
    clinician_id: data.clinician_id,
    patient_id: data.patient_id,
    visit_date: data.visit_date,
    duration_minutes: data.duration_minutes || 30,
    status: data.status || 'scheduled',
    notes: data.notes || null,
  });
  
  return getVisitById(result.lastInsertRowid);
}

// Update visit (for changing status, rescheduling, etc.)
export function updateVisit(id, data) {
  // Build dynamic UPDATE query based on provided fields
  const fields = [];
  const params = { id };
  
  if (data.visit_date !== undefined) {
    fields.push('visit_date = @visit_date');
    params.visit_date = data.visit_date;
  }
  
  if (data.duration_minutes !== undefined) {
    fields.push('duration_minutes = @duration_minutes');
    params.duration_minutes = data.duration_minutes;
  }
  
  if (data.status !== undefined) {
    fields.push('status = @status');
    params.status = data.status;
  }
  
  if (data.notes !== undefined) {
    fields.push('notes = @notes');
    params.notes = data.notes;
  }
  
  if (fields.length === 0) {
    return getVisitById(id); // Nothing to update
  }
  
  const query = `UPDATE visits SET ${fields.join(', ')} WHERE id = @id`;
  const stmt = db.prepare(query);
  stmt.run(params);
  
  return getVisitById(id);
}

// Delete visit
export function deleteVisit(id) {
  const stmt = db.prepare('DELETE FROM visits WHERE id = ?');
  const result = stmt.run(id);
  return result.changes > 0;
}
