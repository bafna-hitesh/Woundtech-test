# Quick Reference Cheat Sheet

Use this during development or interview for quick lookups.

---

## Project Commands

```bash
cd test/backend
npm install          # Install dependencies
npm run seed         # Populate sample data
npm run dev          # Start with auto-reload
npm start            # Start normally
```

---

## API Endpoints (Copy-Paste Ready)

### Health Check
```bash
curl http://localhost:3001/api/health
```

### Clinicians
```bash
# List all
curl http://localhost:3001/api/clinicians

# Get one
curl http://localhost:3001/api/clinicians/1

# Create
curl -X POST http://localhost:3001/api/clinicians \
  -H "Content-Type: application/json" \
  -d '{"name": "Dr. Test", "specialty": "Testing"}'

# Delete
curl -X DELETE http://localhost:3001/api/clinicians/1
```

### Patients
```bash
# List all
curl http://localhost:3001/api/patients

# Get one
curl http://localhost:3001/api/patients/1

# Create
curl -X POST http://localhost:3001/api/patients \
  -H "Content-Type: application/json" \
  -d '{"name": "Test Patient", "email": "test@email.com"}'

# Delete
curl -X DELETE http://localhost:3001/api/patients/1
```

### Visits
```bash
# List all
curl http://localhost:3001/api/visits

# With filters (calendar view)
curl "http://localhost:3001/api/visits?start_date=2026-02-01&end_date=2026-02-28"
curl "http://localhost:3001/api/visits?clinician_id=1"
curl "http://localhost:3001/api/visits?status=scheduled"

# Get one
curl http://localhost:3001/api/visits/1

# Create
curl -X POST http://localhost:3001/api/visits \
  -H "Content-Type: application/json" \
  -d '{"clinician_id": 1, "patient_id": 1, "visit_date": "2026-02-15 10:00", "duration_minutes": 30}'

# Update (change status)
curl -X PUT http://localhost:3001/api/visits/1 \
  -H "Content-Type: application/json" \
  -d '{"status": "completed"}'

# Delete
curl -X DELETE http://localhost:3001/api/visits/1
```

---

## Request/Response Format

### Successful Response
```json
{
  "success": true,
  "data": { ... },
  "message": "Operation successful"
}
```

### Error Response
```json
{
  "success": false,
  "message": "What went wrong",
  "errors": [
    { "field": "name", "message": "Name is required" }
  ]
}
```

---

## Request Bodies (Required Fields)

### Create Clinician
```json
{
  "name": "Dr. Example",      // REQUIRED
  "specialty": "Cardiology",  // optional
  "email": "doc@clinic.com"   // optional
}
```

### Create Patient
```json
{
  "name": "John Doe",          // REQUIRED
  "date_of_birth": "1990-05-15", // optional (YYYY-MM-DD)
  "email": "john@email.com",   // optional
  "phone": "555-0100"          // optional
}
```

### Create Visit
```json
{
  "clinician_id": 1,           // REQUIRED (must exist)
  "patient_id": 2,             // REQUIRED (must exist)
  "visit_date": "2026-02-15 10:00", // REQUIRED (YYYY-MM-DD HH:MM)
  "duration_minutes": 30,      // optional, default: 30
  "status": "scheduled",       // optional, default: "scheduled"
  "notes": "Initial consult"   // optional
}
```

### Update Visit
```json
{
  "visit_date": "2026-02-16 14:00",  // optional
  "duration_minutes": 45,            // optional
  "status": "completed",             // optional
  "notes": "Updated notes"           // optional
}
```

---

## Query Parameters (GET /api/visits)

| Param | Example | Description |
|-------|---------|-------------|
| `clinician_id` | `?clinician_id=1` | Filter by clinician |
| `patient_id` | `?patient_id=2` | Filter by patient |
| `start_date` | `?start_date=2026-02-01` | Visits on/after date |
| `end_date` | `?end_date=2026-02-28` | Visits on/before date |
| `status` | `?status=scheduled` | Filter by status |

Combine: `?start_date=2026-02-01&end_date=2026-02-28&clinician_id=1`

---

## HTTP Status Codes We Return

| Code | Meaning | When |
|------|---------|------|
| 200 | OK | Successful GET, PUT, DELETE |
| 201 | Created | Successful POST |
| 400 | Bad Request | Validation failed |
| 404 | Not Found | Resource doesn't exist |
| 500 | Server Error | Something broke |

---

## File Locations

| What | Where |
|------|-------|
| Server entry | `src/index.js` |
| Database connection | `src/db/connection.js` |
| Schema (tables) | `src/db/schema.sql` |
| Seed data | `src/db/seed.js` |
| Validation schemas | `src/validators/schemas.js` |
| Clinician routes | `src/routes/clinicians.js` |
| Patient routes | `src/routes/patients.js` |
| Visit routes | `src/routes/visits.js` |
| Clinician service | `src/services/clinician.service.js` |
| Patient service | `src/services/patient.service.js` |
| Visit service | `src/services/visit.service.js` |

---

## Common Interview Questions & Answers

**Q: Why separate routes and services?**
A: Separation of concerns. Routes handle HTTP, services handle business logic. Makes code testable and reusable.

**Q: Why use better-sqlite3?**
A: Synchronous API (simpler code), very fast, and great for local development with zero setup.

**Q: Why db.prepare() instead of direct SQL strings?**
A: Prevents SQL injection attacks. Parameters are safely escaped.

**Q: Why Zod for validation?**
A: Runtime type checking (JS doesn't have this), clear error messages, self-documenting schemas.

**Q: Why indexes on visits table?**
A: Calendar view queries by date range frequently. Indexes make these queries O(log n) instead of O(n).

**Q: Why ON DELETE CASCADE on foreign keys?**
A: If a clinician/patient is deleted, their visits are automatically deleted. Maintains referential integrity.

**Q: Why status field with CHECK constraint?**
A: Ensures only valid statuses can be stored. Database-level validation as last line of defense.

**Q: Why consistent response format?**
A: Frontend always knows what to expect. `success` boolean makes error handling simple.
