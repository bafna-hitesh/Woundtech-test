import { Router } from 'express';
import * as visitService from '../services/visit.service.js';
import {
  createVisitSchema,
  updateVisitSchema,
  visitQuerySchema,
  validateBody,
  validateQuery,
} from '../validators/schemas.js';

const router = Router();

// GET /api/visits - List visits with optional filters
// Query params: clinician_id, patient_id, start_date, end_date, status
router.get('/', validateQuery(visitQuerySchema), (req, res) => {
  try {
    const visits = visitService.getVisits(req.query);
    res.json({
      success: true,
      data: visits,
      count: visits.length,
    });
  } catch (error) {
    console.error('Error fetching visits:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch visits',
    });
  }
});

// GET /api/visits/:id - Get single visit
router.get('/:id', (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const visit = visitService.getVisitById(id);
    
    if (!visit) {
      return res.status(404).json({
        success: false,
        message: 'Visit not found',
      });
    }
    
    res.json({
      success: true,
      data: visit,
    });
  } catch (error) {
    console.error('Error fetching visit:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch visit',
    });
  }
});

// POST /api/visits - Create new visit
router.post('/', validateBody(createVisitSchema), (req, res) => {
  try {
    const visit = visitService.createVisit(req.body);
    res.status(201).json({
      success: true,
      data: visit,
      message: 'Visit created successfully',
    });
  } catch (error) {
    // Handle foreign key constraint errors
    if (error.code === 'SQLITE_CONSTRAINT_FOREIGNKEY') {
      return res.status(400).json({
        success: false,
        message: 'Invalid clinician_id or patient_id. Make sure both exist.',
      });
    }
    
    console.error('Error creating visit:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create visit',
    });
  }
});

// PUT /api/visits/:id - Update visit
router.put('/:id', validateBody(updateVisitSchema), (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    
    // Check if visit exists
    const existing = visitService.getVisitById(id);
    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Visit not found',
      });
    }
    
    const visit = visitService.updateVisit(id, req.body);
    res.json({
      success: true,
      data: visit,
      message: 'Visit updated successfully',
    });
  } catch (error) {
    console.error('Error updating visit:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update visit',
    });
  }
});

// DELETE /api/visits/:id - Delete visit
router.delete('/:id', (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const deleted = visitService.deleteVisit(id);
    
    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Visit not found',
      });
    }
    
    res.json({
      success: true,
      message: 'Visit deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting visit:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete visit',
    });
  }
});

export default router;
