# Patient Visit Tracker

A web application for tracking patient visits by clinicians, featuring a calendar-based UI and patient check-in workflow.

## Tech Stack

### Backend
- **Node.js** with Express.js
- **SQLite** (better-sqlite3) - File-based database
- **Zod** - Request validation

### Frontend
- **React 19** with Vite
- **Material UI (MUI)** - Component library
- **Zustand** - State management
- **Day.js** - Date handling

## Features

- **Calendar View** - Monthly calendar displaying all scheduled visits
- **Visit Management** - Create, edit, and delete patient visits
- **Patient Check-in Workflow** - Process today's appointments in sequence
- **Filtering** - Filter visits by clinician, patient, or status
- **Status Tracking** - Track visit status (scheduled/completed/cancelled)

## Local Setup Instructions

### Prerequisites
- Node.js (v18 or higher)
- npm

### 1. Clone the Repository
```bash
git clone <repository-url>
cd test
```

### 2. Setup Backend
```bash
cd backend
npm install
npm run seed    # Populate database with sample data
npm run dev     # Start backend server (http://localhost:3001)
```

### 3. Setup Frontend (in a new terminal)
```bash
cd frontend
npm install
npm run dev     # Start frontend server (http://localhost:5173)
```

### 4. Access the Application
- Open **http://localhost:5173** in your browser
- Login with the demo credentials below

## Demo Credentials

| Username | Password |
|----------|----------|
| admin    | 12345    |

## Quick Test Guide

1. **Login** - Use credentials above
2. **View Calendar** - See monthly appointments with color-coded status
3. **Create Visit** - Click "New Visit" button or click + on any date
4. **Edit Visit** - Click on any visit card in the calendar
5. **Filter Visits** - Use dropdowns to filter by clinician/patient/status
6. **Check-in Workflow** - Click green "Start Check-in" button to process today's patients sequentially
7. **Add Patient/Clinician** - Use buttons in the header

## Project Structure

```
test/
├── backend/
│   ├── src/
│   │   ├── index.js           # Express server entry
│   │   ├── db/
│   │   │   ├── connection.js  # SQLite connection
│   │   │   ├── schema.sql     # Database schema
│   │   │   └── seed.js        # Sample data
│   │   ├── routes/            # API endpoints
│   │   ├── services/          # Business logic
│   │   └── validators/        # Zod schemas
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── App.jsx            # Main app component
│   │   ├── api/               # API client
│   │   ├── store/             # Zustand state management
│   │   └── components/        # React components
│   └── package.json
│
└── README.md
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/clinicians` | List all clinicians |
| POST | `/api/clinicians` | Create clinician |
| GET | `/api/patients` | List all patients |
| POST | `/api/patients` | Create patient |
| GET | `/api/visits` | List visits (supports filtering) |
| POST | `/api/visits` | Create visit |
| PUT | `/api/visits/:id` | Update visit |
| DELETE | `/api/visits/:id` | Delete visit |

### Visit Query Parameters
- `clinician_id` - Filter by clinician
- `patient_id` - Filter by patient
- `start_date` - Filter visits on/after date (YYYY-MM-DD)
- `end_date` - Filter visits on/before date (YYYY-MM-DD)
- `status` - Filter by status (scheduled/completed/cancelled)

## Database Schema

### Tables
- **clinicians** - id, name, specialty, email, created_at
- **patients** - id, name, date_of_birth, email, phone, created_at
- **visits** - id, clinician_id, patient_id, visit_date, duration_minutes, status, notes, created_at

## Design Decisions

### Why SQLite?
- Zero configuration required
- Perfect for local development and demos
- Single file database - easy to share and reset

### Why Zustand over Redux?
- Minimal boilerplate
- Simple API
- Built-in persistence middleware
- Perfect for this scale of application

### Why Material UI?
- Comprehensive component library
- Built-in date/time pickers
- Consistent design system
- Rapid development

### Architecture: Routes → Services → Database
- **Separation of concerns** - Routes handle HTTP, services handle business logic
- **Testability** - Services can be tested independently
- **Maintainability** - Clear structure for future modifications

### Calendar-based UI
- Intuitive visualization for appointment scheduling
- Easy to see daily workload at a glance
- Click-to-add functionality on specific dates

### Check-in Workflow
- Sequential patient processing for efficiency
- Progress tracking with visual feedback
- Skip option for flexibility

## Available Scripts

### Backend
```bash
npm run dev     # Start with auto-reload
npm run start   # Production start
npm run seed    # Reset database with sample data
```

### Frontend
```bash
npm run dev     # Start development server
npm run build   # Build for production
npm run lint    # Run ESLint
```
