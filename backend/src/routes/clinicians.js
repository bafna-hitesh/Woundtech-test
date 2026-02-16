import { Router } from 'express';
import * as clinicianService from '../services/clinician.service.js';
import { createClinicianSchema, validateBody } from '../validators/schemas.js';

const router = Router();

// GET /api/clinicians - List all clinicians
router.get('/', (req, res) => {
  try {
    const clinicians = clinicianService.getAllClinicians();
    res.json({
      success: true,
      data: clinicians,
    });
  } catch (error) {
    console.error('Error fetching clinicians:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch clinicians',
    });
  }
});

// GET /api/clinicians/:id - Get single clinician
router.get('/:id', (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const clinician = clinicianService.getClinicianById(id);
    
    if (!clinician) {
      return res.status(404).json({
        success: false,
        message: 'Clinician not found',
      });
    }
    
    res.json({
      success: true,
      data: clinician,
    });
  } catch (error) {
    console.error('Error fetching clinician:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch clinician',
    });
  }
});

// POST /api/clinicians - Create new clinician
router.post('/', validateBody(createClinicianSchema), (req, res) => {
  try {
    const clinician = clinicianService.createClinician(req.body);
    res.status(201).json({
      success: true,
      data: clinician,
      message: 'Clinician created successfully',
    });
  } catch (error) {
    console.error('Error creating clinician:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create clinician',
    });
  }
});

// DELETE /api/clinicians/:id - Delete clinician
router.delete('/:id', (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const deleted = clinicianService.deleteClinician(id);
    
    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Clinician not found',
      });
    }
    
    res.json({
      success: true,
      message: 'Clinician deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting clinician:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete clinician',
    });
  }
});

export default router;
