import { z } from 'zod';

// ============ CLINICIAN SCHEMAS ============

export const createClinicianSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  specialty: z.string().max(100).optional(),
  email: z.string().email('Invalid email format').optional(),
});

// ============ PATIENT SCHEMAS ============

export const createPatientSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  date_of_birth: z.string().optional(), // Format: YYYY-MM-DD
  email: z.string().email('Invalid email format').optional(),
  phone: z.string().max(20).optional(),
});

// ============ VISIT SCHEMAS ============

export const createVisitSchema = z.object({
  clinician_id: z.number().int().positive('Clinician ID must be a positive integer'),
  patient_id: z.number().int().positive('Patient ID must be a positive integer'),
  visit_date: z.string().min(1, 'Visit date is required'), // Format: YYYY-MM-DD HH:MM
  duration_minutes: z.number().int().min(15).max(480).default(30), // 15 min to 8 hours
  status: z.enum(['scheduled', 'completed', 'cancelled']).default('scheduled'),
  notes: z.string().max(1000).optional(),
});

export const updateVisitSchema = z.object({
  visit_date: z.string().optional(),
  duration_minutes: z.number().int().min(15).max(480).optional(),
  status: z.enum(['scheduled', 'completed', 'cancelled']).optional(),
  notes: z.string().max(1000).optional(),
});

// ============ QUERY SCHEMAS (for filtering) ============

export const visitQuerySchema = z.object({
  clinician_id: z.string().transform(Number).pipe(z.number().int().positive()).optional(),
  patient_id: z.string().transform(Number).pipe(z.number().int().positive()).optional(),
  start_date: z.string().optional(), // For calendar date range
  end_date: z.string().optional(),   // For calendar date range
  status: z.enum(['scheduled', 'completed', 'cancelled']).optional(),
});

// ============ VALIDATION MIDDLEWARE ============

// Helper function to create Express middleware from Zod schema
export function validateBody(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);
    
    if (!result.success) {
      // Format Zod errors into readable messages
      const errors = result.error.errors.map(err => ({
        field: err.path.join('.'),
        message: err.message,
      }));
      
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors,
      });
    }
    
    // Replace req.body with validated & transformed data
    req.body = result.data;
    next();
  };
}

// Middleware to validate query parameters
export function validateQuery(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.query);
    
    if (!result.success) {
      const errors = result.error.errors.map(err => ({
        field: err.path.join('.'),
        message: err.message,
      }));
      
      return res.status(400).json({
        success: false,
        message: 'Invalid query parameters',
        errors,
      });
    }
    
    req.query = result.data;
    next();
  };
}
