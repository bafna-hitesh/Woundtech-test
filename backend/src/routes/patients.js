import { Router } from 'express';
import * as patientService from '../services/patient.service.js';
import { createPatientSchema, validateBody } from '../validators/schemas.js';

const router = Router();

// GET /api/patients - List all patients
router.get('/', (req, res) => {
  try {
    const patients = patientService.getAllPatients();
    res.json({
      success: true,
      data: patients,
    });
  } catch (error) {
    console.error('Error fetching patients:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch patients',
    });
  }
});

// GET /api/patients/:id - Get single patient
router.get('/:id', (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const patient = patientService.getPatientById(id);
    
    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found',
      });
    }
    
    res.json({
      success: true,
      data: patient,
    });
  } catch (error) {
    console.error('Error fetching patient:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch patient',
    });
  }
});

// POST /api/patients - Create new patient
router.post('/', validateBody(createPatientSchema), (req, res) => {
  try {
    const patient = patientService.createPatient(req.body);
    res.status(201).json({
      success: true,
      data: patient,
      message: 'Patient created successfully',
    });
  } catch (error) {
    console.error('Error creating patient:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create patient',
    });
  }
});

// DELETE /api/patients/:id - Delete patient
router.delete('/:id', (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const deleted = patientService.deletePatient(id);
    
    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found',
      });
    }
    
    res.json({
      success: true,
      message: 'Patient deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting patient:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete patient',
    });
  }
});

export default router;
