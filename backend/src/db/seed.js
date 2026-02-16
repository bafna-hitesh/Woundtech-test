import db from './connection.js';

// Sample clinicians
const clinicians = [
  { name: 'Dr. Sarah Johnson', specialty: 'General Medicine', email: 'sarah.johnson@clinic.com' },
  { name: 'Dr. Michael Chen', specialty: 'Cardiology', email: 'michael.chen@clinic.com' },
  { name: 'Dr. Emily Williams', specialty: 'Dermatology', email: 'emily.williams@clinic.com' },
  { name: 'Dr. James Brown', specialty: 'Orthopedics', email: 'james.brown@clinic.com' },
  { name: 'Dr. Lisa Martinez', specialty: 'Pediatrics', email: 'lisa.martinez@clinic.com' },
];

// Sample patients
const patients = [
  { name: 'John Smith', date_of_birth: '1985-03-15', email: 'john.smith@email.com', phone: '555-0101' },
  { name: 'Mary Johnson', date_of_birth: '1990-07-22', email: 'mary.johnson@email.com', phone: '555-0102' },
  { name: 'Robert Davis', date_of_birth: '1978-11-08', email: 'robert.davis@email.com', phone: '555-0103' },
  { name: 'Jennifer Wilson', date_of_birth: '1995-01-30', email: 'jennifer.wilson@email.com', phone: '555-0104' },
  { name: 'David Miller', date_of_birth: '1982-09-12', email: 'david.miller@email.com', phone: '555-0105' },
  { name: 'Susan Taylor', date_of_birth: '1988-04-25', email: 'susan.taylor@email.com', phone: '555-0106' },
  { name: 'Michael Anderson', date_of_birth: '1972-12-03', email: 'michael.anderson@email.com', phone: '555-0107' },
  { name: 'Lisa Thomas', date_of_birth: '1999-06-18', email: 'lisa.thomas@email.com', phone: '555-0108' },
];

// Generate sample visits for the current month (for calendar view demo)
function generateVisits() {
  const visits = [];
  const statuses = ['scheduled', 'completed', 'cancelled'];
  const notes = [
    'Regular checkup',
    'Follow-up appointment',
    'Initial consultation',
    'Lab results review',
    'Vaccination',
    'Prescription renewal',
    null,
  ];
  
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  
  // Generate visits for current month and next month
  for (let dayOffset = -7; dayOffset < 30; dayOffset++) {
    // Create 2-4 visits per day
    const visitsPerDay = Math.floor(Math.random() * 3) + 2;
    
    for (let i = 0; i < visitsPerDay; i++) {
      const date = new Date(year, month, now.getDate() + dayOffset);
      const hour = 9 + Math.floor(Math.random() * 8); // 9 AM to 5 PM
      const minute = Math.random() < 0.5 ? 0 : 30; // On the hour or half hour
      
      date.setHours(hour, minute, 0, 0);
      
      // Past visits are usually completed, future visits are scheduled
      let status;
      if (dayOffset < 0) {
        status = Math.random() < 0.8 ? 'completed' : 'cancelled';
      } else if (dayOffset === 0) {
        status = Math.random() < 0.5 ? 'completed' : 'scheduled';
      } else {
        status = Math.random() < 0.9 ? 'scheduled' : 'cancelled';
      }
      
      visits.push({
        clinician_id: Math.floor(Math.random() * clinicians.length) + 1,
        patient_id: Math.floor(Math.random() * patients.length) + 1,
        visit_date: date.toISOString().slice(0, 16).replace('T', ' '),
        duration_minutes: [30, 45, 60][Math.floor(Math.random() * 3)],
        status,
        notes: notes[Math.floor(Math.random() * notes.length)],
      });
    }
  }
  
  return visits;
}

// Run seeding
function seed() {
  console.log('Seeding database...\n');
  
  // Clear existing data
  db.exec('DELETE FROM visits');
  db.exec('DELETE FROM patients');
  db.exec('DELETE FROM clinicians');
  
  // Reset auto-increment counters
  db.exec("DELETE FROM sqlite_sequence WHERE name IN ('clinicians', 'patients', 'visits')");
  
  // Insert clinicians
  const insertClinician = db.prepare(`
    INSERT INTO clinicians (name, specialty, email) VALUES (@name, @specialty, @email)
  `);
  
  for (const clinician of clinicians) {
    insertClinician.run(clinician);
  }
  console.log(`✓ Inserted ${clinicians.length} clinicians`);
  
  // Insert patients
  const insertPatient = db.prepare(`
    INSERT INTO patients (name, date_of_birth, email, phone)
    VALUES (@name, @date_of_birth, @email, @phone)
  `);
  
  for (const patient of patients) {
    insertPatient.run(patient);
  }
  console.log(`✓ Inserted ${patients.length} patients`);
  
  // Insert visits
  const visits = generateVisits();
  const insertVisit = db.prepare(`
    INSERT INTO visits (clinician_id, patient_id, visit_date, duration_minutes, status, notes)
    VALUES (@clinician_id, @patient_id, @visit_date, @duration_minutes, @status, @notes)
  `);
  
  for (const visit of visits) {
    insertVisit.run(visit);
  }
  console.log(`✓ Inserted ${visits.length} visits`);
  
  console.log('\n✅ Database seeded successfully!');
}

seed();
