# Backend Architecture Guide

This document explains the complete backend architecture of the Patient Visit Tracker API.

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Folder Structure](#folder-structure)
3. [Request Flow (How Data Moves)](#request-flow-how-data-moves)
4. [Layer-by-Layer Explanation](#layer-by-layer-explanation)
5. [SQLite Database](#sqlite-database)
6. [Zod Validation](#zod-validation)
7. [API Endpoints Reference](#api-endpoints-reference)
8. [Database Schema](#database-schema)
9. [Key Concepts to Remember](#key-concepts-to-remember)

---

## Project Overview

This is a REST API built with:
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework for handling HTTP requests
- **SQLite** - File-based database (no server needed)
- **better-sqlite3** - SQLite driver for Node.js
- **Zod** - Schema validation library

The API allows tracking patient visits by clinicians, with features like:
- CRUD operations for clinicians, patients, and visits
- Date range filtering (for calendar view)
- Status tracking (scheduled/completed/cancelled)

---

## Folder Structure

```
backend/
├── package.json              # Project config & dependencies
├── database.db               # SQLite database file (auto-created)
├── docs/                     # Documentation
│   └── BACKEND_ARCHITECTURE.md
└── src/
    ├── index.js              # Entry point - Express server setup
    ├── db/
    │   ├── connection.js     # Database connection & initialization
    │   ├── schema.sql        # SQL table definitions
    │   └── seed.js           # Sample data for testing
    ├── routes/
    │   ├── clinicians.js     # HTTP handlers for /api/clinicians
    │   ├── patients.js       # HTTP handlers for /api/patients
    │   └── visits.js         # HTTP handlers for /api/visits
    ├── services/
    │   ├── clinician.service.js  # Business logic for clinicians
    │   ├── patient.service.js    # Business logic for patients
    │   └── visit.service.js      # Business logic for visits
    └── validators/
        └── schemas.js        # Zod validation schemas
```

### Why This Structure?

| Folder | Responsibility | Why Separate? |
|--------|---------------|---------------|
| `routes/` | Handle HTTP requests/responses | Keeps HTTP logic isolated |
| `services/` | Business logic & database queries | Reusable, testable |
| `validators/` | Input validation | Single source of truth for data shapes |
| `db/` | Database connection & schema | Database concerns in one place |

This is called **"Separation of Concerns"** - each layer has ONE job.

---

## Request Flow (How Data Moves)

When a frontend makes an API call, here's exactly what happens:

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           REQUEST FLOW                                   │
└─────────────────────────────────────────────────────────────────────────┘

  Frontend (React)
       │
       │  HTTP Request: POST /api/visits
       │  Body: { clinician_id: 1, patient_id: 2, visit_date: "2026-02-15 10:00" }
       ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  1. EXPRESS MIDDLEWARE (index.js)                                        │
│     ├── cors() → Allows cross-origin requests                           │
│     ├── express.json() → Parses JSON body into req.body                 │
│     └── logging → Logs request for debugging                            │
└─────────────────────────────────────────────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  2. ROUTE MATCHING (index.js)                                           │
│     app.use('/api/visits', visitsRouter)                                │
│     → Matches! Forwards to visits.js router                             │
└─────────────────────────────────────────────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  3. ROUTE HANDLER (routes/visits.js)                                    │
│     router.post('/', validateBody(createVisitSchema), handler)          │
│                              │                                          │
│                              ▼                                          │
│     ┌──────────────────────────────────────────────────────────┐       │
│     │  VALIDATION MIDDLEWARE (validators/schemas.js)            │       │
│     │  - Checks if body matches createVisitSchema               │       │
│     │  - If INVALID → Returns 400 error with details            │       │
│     │  - If VALID → Calls next() to continue                    │       │
│     └──────────────────────────────────────────────────────────┘       │
└─────────────────────────────────────────────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  4. SERVICE LAYER (services/visit.service.js)                           │
│     const visit = visitService.createVisit(req.body)                    │
│     - Receives validated data                                           │
│     - Prepares SQL query                                                │
│     - Executes query on database                                        │
└─────────────────────────────────────────────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  5. DATABASE (db/connection.js → database.db)                           │
│     INSERT INTO visits (...) VALUES (...)                               │
│     - SQLite executes the query                                         │
│     - Returns lastInsertRowid                                           │
└─────────────────────────────────────────────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  6. RESPONSE                                                            │
│     Service returns created visit object                                │
│     Route sends JSON response:                                          │
│     {                                                                   │
│       "success": true,                                                  │
│       "data": { id: 42, clinician_id: 1, ... },                        │
│       "message": "Visit created successfully"                           │
│     }                                                                   │
└─────────────────────────────────────────────────────────────────────────┘
       │
       ▼
  Frontend receives response
```

---

## Layer-by-Layer Explanation

### Layer 1: Entry Point (index.js)

```javascript
// What happens when server starts:
import express from 'express';
const app = express();

// 1. Middleware setup (runs on EVERY request)
app.use(cors());           // Allow frontend to call us
app.use(express.json());   // Parse JSON bodies

// 2. Mount routers (each handles a resource)
app.use('/api/clinicians', cliniciansRouter);
app.use('/api/patients', patientsRouter);
app.use('/api/visits', visitsRouter);

// 3. Start listening
app.listen(3001);
```

**Key concept: Middleware**
Middleware are functions that run BEFORE your route handler. They can:
- Modify the request (like parsing JSON)
- Modify the response (like adding headers)
- End the request (like returning an error)
- Call `next()` to continue to the next middleware/handler

Order matters! That's why `cors()` comes first.

---

### Layer 2: Routes (routes/*.js)

Routes define WHAT endpoints exist and HOW to respond.

```javascript
// routes/visits.js
import { Router } from 'express';
const router = Router();

// Define endpoint: POST /api/visits
router.post('/', validateBody(createVisitSchema), (req, res) => {
  // req.body contains the validated JSON data
  // res is used to send response back
  
  try {
    const visit = visitService.createVisit(req.body);
    res.status(201).json({ success: true, data: visit });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error' });
  }
});
```

**Route responsibilities:**
- Define HTTP method (GET, POST, PUT, DELETE)
- Define URL path
- Apply validation middleware
- Call service functions
- Format and send response
- Handle errors

**What routes should NOT do:**
- Contain business logic
- Directly access database
- Know about SQL

---

### Layer 3: Services (services/*.js)

Services contain BUSINESS LOGIC and DATABASE OPERATIONS.

```javascript
// services/visit.service.js
import db from '../db/connection.js';

export function createVisit(data) {
  // 1. Prepare SQL statement (prevents SQL injection)
  const stmt = db.prepare(`
    INSERT INTO visits (clinician_id, patient_id, visit_date, ...)
    VALUES (@clinician_id, @patient_id, @visit_date, ...)
  `);
  
  // 2. Execute with parameters
  const result = stmt.run({
    clinician_id: data.clinician_id,
    patient_id: data.patient_id,
    visit_date: data.visit_date,
    // ...
  });
  
  // 3. Return the created record
  return getVisitById(result.lastInsertRowid);
}
```

**Why separate services from routes?**

1. **Testability**: You can test `createVisit()` without spinning up Express
2. **Reusability**: Multiple routes can use same service function
3. **Single Responsibility**: Routes handle HTTP, services handle logic
4. **Easier refactoring**: Change database without touching routes

---

### Layer 4: Validators (validators/schemas.js)

Validators ensure incoming data is correct BEFORE it reaches your code.

```javascript
import { z } from 'zod';

// Define the shape data MUST have
export const createVisitSchema = z.object({
  clinician_id: z.number().int().positive(),
  patient_id: z.number().int().positive(),
  visit_date: z.string().min(1),
  duration_minutes: z.number().int().min(15).max(480).default(30),
  status: z.enum(['scheduled', 'completed', 'cancelled']).default('scheduled'),
  notes: z.string().max(1000).optional(),
});

// Middleware factory that validates req.body
export function validateBody(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);
    
    if (!result.success) {
      return res.status(400).json({
        success: false,
        errors: result.error.errors,
      });
    }
    
    req.body = result.data; // Use validated data
    next();                  // Continue to route handler
  };
}
```

**Why validate?**
- Prevents crashes from unexpected data
- Provides clear error messages to frontend
- Documents what data each endpoint expects
- Protects database from invalid data

---

### Layer 5: Database (db/*.js)

#### connection.js - Sets up SQLite

```javascript
import Database from 'better-sqlite3';

// Create/open database file
const db = new Database('database.db');

// Enable foreign keys (OFF by default in SQLite!)
db.pragma('foreign_keys = ON');

// Run schema to create tables
db.exec(schemaSQL);

export default db;
```

#### schema.sql - Defines table structure

```sql
CREATE TABLE IF NOT EXISTS visits (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  clinician_id INTEGER NOT NULL,
  patient_id INTEGER NOT NULL,
  visit_date DATETIME NOT NULL,
  duration_minutes INTEGER DEFAULT 30,
  status TEXT DEFAULT 'scheduled',
  notes TEXT,
  FOREIGN KEY (clinician_id) REFERENCES clinicians(id),
  FOREIGN KEY (patient_id) REFERENCES patients(id)
);
```

---

## SQLite Database

### What is SQLite?

SQLite is a **file-based** relational database. Unlike PostgreSQL or MySQL:
- No separate server process needed
- Entire database is ONE file (`database.db`)
- Zero configuration
- Perfect for development and small applications

### How better-sqlite3 works

```javascript
import Database from 'better-sqlite3';

// Open database (creates file if doesn't exist)
const db = new Database('database.db');

// PREPARE: Compile SQL statement
const stmt = db.prepare('SELECT * FROM clinicians WHERE id = ?');

// GET: Execute and return single row
const clinician = stmt.get(1);
// → { id: 1, name: 'Dr. Sarah Johnson', ... }

// ALL: Execute and return all matching rows
const allClinicians = db.prepare('SELECT * FROM clinicians').all();
// → [{ id: 1, ... }, { id: 2, ... }, ...]

// RUN: Execute INSERT/UPDATE/DELETE
const result = db.prepare('INSERT INTO clinicians (name) VALUES (?)').run('Dr. New');
// → { changes: 1, lastInsertRowid: 6 }
```

### Named Parameters (@name)

Instead of `?` placeholders, we use `@name` for clarity:

```javascript
// With ? placeholders (positional - easy to mess up order)
stmt.run(data.name, data.specialty, data.email);

// With @name (named - clear and safe)
stmt.run({
  name: data.name,
  specialty: data.specialty,
  email: data.email,
});
```

### Why db.prepare() ?

**Prevents SQL Injection attacks!**

```javascript
// DANGEROUS - user input directly in SQL
const query = `SELECT * FROM users WHERE name = '${userInput}'`;
// If userInput = "'; DROP TABLE users; --" ... your table is gone!

// SAFE - parameterized query
const stmt = db.prepare('SELECT * FROM users WHERE name = ?');
stmt.get(userInput);  // userInput is safely escaped
```

---

## Zod Validation

### Why Use Zod?

1. **Type safety at runtime** - JavaScript doesn't check types at runtime
2. **Clear error messages** - Tells users exactly what's wrong
3. **Documentation** - Schema shows what data each endpoint expects
4. **Transformation** - Can modify data (like string "123" → number 123)

### Common Zod Methods

```javascript
import { z } from 'zod';

// Basic types
z.string()                    // Must be a string
z.number()                    // Must be a number
z.boolean()                   // Must be true/false

// Modifiers
z.string().min(1)             // String with at least 1 character
z.string().max(100)           // String with at most 100 characters
z.string().email()            // Must be valid email format
z.number().int()              // Must be integer (not 3.14)
z.number().positive()         // Must be > 0
z.number().min(15).max(480)   // Must be between 15-480

// Optional & defaults
z.string().optional()         // Can be undefined
z.number().default(30)        // If missing, use 30

// Enums
z.enum(['scheduled', 'completed', 'cancelled'])  // Must be one of these

// Objects
z.object({
  name: z.string(),
  age: z.number().optional(),
})
```

### How Validation Works

```javascript
const schema = z.object({
  name: z.string().min(1, 'Name is required'),
  age: z.number().positive().optional(),
});

// safeParse returns { success, data/error }
const result = schema.safeParse({ name: '' });

if (!result.success) {
  console.log(result.error.errors);
  // [{ path: ['name'], message: 'Name is required' }]
} else {
  console.log(result.data);
  // { name: '...', age: ... }
}
```

---

## API Endpoints Reference

### Health Check
```
GET /api/health
Response: { success: true, message: "API is running", timestamp: "..." }
```

### Clinicians

| Method | Endpoint | Description | Request Body |
|--------|----------|-------------|--------------|
| GET | `/api/clinicians` | List all | - |
| GET | `/api/clinicians/:id` | Get one | - |
| POST | `/api/clinicians` | Create | `{ name, specialty?, email? }` |
| DELETE | `/api/clinicians/:id` | Delete | - |

### Patients

| Method | Endpoint | Description | Request Body |
|--------|----------|-------------|--------------|
| GET | `/api/patients` | List all | - |
| GET | `/api/patients/:id` | Get one | - |
| POST | `/api/patients` | Create | `{ name, date_of_birth?, email?, phone? }` |
| DELETE | `/api/patients/:id` | Delete | - |

### Visits

| Method | Endpoint | Description | Request Body |
|--------|----------|-------------|--------------|
| GET | `/api/visits` | List all (filterable) | - |
| GET | `/api/visits/:id` | Get one | - |
| POST | `/api/visits` | Create | `{ clinician_id, patient_id, visit_date, duration_minutes?, status?, notes? }` |
| PUT | `/api/visits/:id` | Update | `{ visit_date?, duration_minutes?, status?, notes? }` |
| DELETE | `/api/visits/:id` | Delete | - |

#### Visit Query Parameters (GET /api/visits)

| Parameter | Type | Description |
|-----------|------|-------------|
| `clinician_id` | number | Filter by clinician |
| `patient_id` | number | Filter by patient |
| `start_date` | string | Filter visits on/after this date (YYYY-MM-DD) |
| `end_date` | string | Filter visits on/before this date (YYYY-MM-DD) |
| `status` | string | Filter by status (scheduled/completed/cancelled) |

Example:
```
GET /api/visits?start_date=2026-02-01&end_date=2026-02-28&clinician_id=1
```

---

## Database Schema

### Entity Relationship Diagram

```
┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐
│   clinicians    │       │     visits      │       │    patients     │
├─────────────────┤       ├─────────────────┤       ├─────────────────┤
│ id (PK)         │──┐    │ id (PK)         │    ┌──│ id (PK)         │
│ name            │  │    │ clinician_id(FK)│────┘  │ name            │
│ specialty       │  └────│ patient_id (FK) │───────│ date_of_birth   │
│ email           │       │ visit_date      │       │ email           │
│ created_at      │       │ duration_minutes│       │ phone           │
└─────────────────┘       │ status          │       │ created_at      │
                          │ notes           │       └─────────────────┘
                          │ created_at      │
                          └─────────────────┘
```

### Tables

#### clinicians
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INTEGER | PRIMARY KEY, AUTO | Unique identifier |
| name | TEXT | NOT NULL | Clinician's full name |
| specialty | TEXT | - | Medical specialty |
| email | TEXT | - | Contact email |
| created_at | DATETIME | DEFAULT NOW | Record creation time |

#### patients
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INTEGER | PRIMARY KEY, AUTO | Unique identifier |
| name | TEXT | NOT NULL | Patient's full name |
| date_of_birth | DATE | - | Patient's DOB |
| email | TEXT | - | Contact email |
| phone | TEXT | - | Contact phone |
| created_at | DATETIME | DEFAULT NOW | Record creation time |

#### visits
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INTEGER | PRIMARY KEY, AUTO | Unique identifier |
| clinician_id | INTEGER | NOT NULL, FK | Links to clinicians.id |
| patient_id | INTEGER | NOT NULL, FK | Links to patients.id |
| visit_date | DATETIME | NOT NULL | Appointment date & time |
| duration_minutes | INTEGER | DEFAULT 30 | Appointment length |
| status | TEXT | CHECK constraint | scheduled/completed/cancelled |
| notes | TEXT | - | Visit notes |
| created_at | DATETIME | DEFAULT NOW | Record creation time |

### Indexes

```sql
CREATE INDEX idx_visits_date ON visits(visit_date);
CREATE INDEX idx_visits_clinician ON visits(clinician_id);
CREATE INDEX idx_visits_patient ON visits(patient_id);
```

**Why indexes?**
- The calendar view will frequently query by date range
- Filtering by clinician/patient is common
- Indexes make these queries much faster (especially with lots of data)

---

## Key Concepts to Remember

### 1. Separation of Concerns
Each layer has ONE job:
- Routes → HTTP handling
- Services → Business logic
- Validators → Data validation
- Database → Data storage

### 2. SQL Injection Prevention
Always use parameterized queries:
```javascript
// Good
db.prepare('SELECT * FROM users WHERE id = ?').get(userId);

// Bad - NEVER do this
db.prepare(`SELECT * FROM users WHERE id = ${userId}`);
```

### 3. Foreign Keys
Link tables together and ensure data integrity:
```sql
FOREIGN KEY (clinician_id) REFERENCES clinicians(id) ON DELETE CASCADE
```
- Can't create a visit with non-existent clinician_id
- If clinician is deleted, their visits are also deleted (CASCADE)

### 4. Consistent API Responses
Every response follows same format:
```javascript
{
  success: true/false,
  data: { ... },
  message: "...",
  errors: [...]
}
```

### 5. Validation Before Database
Always validate input BEFORE it reaches the database:
```
Request → Validation → Service → Database
           ↓ (if invalid)
        400 Error
```

### 6. CORS (Cross-Origin Resource Sharing)
Browsers block requests from different origins by default.
CORS headers tell browser "this frontend is allowed to call me."

```javascript
app.use(cors({
  origin: 'http://localhost:5173',  // Frontend URL
}));
```

---

## Interview Talking Points

When explaining this architecture, emphasize:

1. **Why layers?** → Testability, maintainability, single responsibility
2. **Why Zod?** → Runtime type safety, clear errors, self-documenting
3. **Why SQLite?** → Zero config, perfect for demos, same SQL knowledge applies
4. **Why indexes?** → Calendar view needs fast date queries
5. **Why status field?** → Real appointments have states (scheduled → completed)
6. **Why duration?** → Calendar shows time blocks, needs to know length

---

## Running the Backend

```bash
# Install dependencies
cd backend
npm install

# Seed database with sample data
npm run seed

# Start development server (auto-restarts on changes)
npm run dev

# Start production server
npm start
```

Server runs on `http://localhost:3001`

Test with:
```bash
curl http://localhost:3001/api/health
curl http://localhost:3001/api/clinicians
curl http://localhost:3001/api/visits?start_date=2026-02-01&end_date=2026-02-28
```
