import express from 'express';
import cors from 'cors';

// Import routes
import cliniciansRouter from './routes/clinicians.js';
import patientsRouter from './routes/patients.js';
import visitsRouter from './routes/visits.js';

const app = express();
const PORT = process.env.PORT || 3001;

// ============ MIDDLEWARE ============

// Enable CORS for frontend (running on different port)
app.use(cors({
  origin: 'http://localhost:5173', // Vite's default port
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type'],
}));

// Parse JSON request bodies
app.use(express.json());

// Request logging (helpful for debugging)
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} | ${req.method} ${req.path}`);
  next();
});

// ============ ROUTES ============

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'API is running',
    timestamp: new Date().toISOString(),
  });
});

// Mount resource routers
app.use('/api/clinicians', cliniciansRouter);
app.use('/api/patients', patientsRouter);
app.use('/api/visits', visitsRouter);

// ============ ERROR HANDLING ============

// 404 handler for unknown routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.path} not found`,
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
  });
});

// ============ START SERVER ============

app.listen(PORT, () => {
  console.log(`
╔══════════════════════════════════════════════════════╗
║   Patient Visit Tracker API                          ║
║   Running on http://localhost:${PORT}                   ║
╠══════════════════════════════════════════════════════╣
║   Endpoints:                                         ║
║   GET    /api/health       - Health check            ║
║   GET    /api/clinicians   - List clinicians         ║
║   POST   /api/clinicians   - Create clinician        ║
║   GET    /api/patients     - List patients           ║
║   POST   /api/patients     - Create patient          ║
║   GET    /api/visits       - List visits (filterable)║
║   POST   /api/visits       - Create visit            ║
║   PUT    /api/visits/:id   - Update visit            ║
╚══════════════════════════════════════════════════════╝
  `);
});
