const express = require('express');
const router = express.Router();
const { authenticateToken, requireRole } = require('../middleware/auth');
const workshopService = require('../services/workshopService');

// Create workshop (coordinator only)
router.post('/', authenticateToken, requireRole('coordinator'), async (req, res) => {
  try {
    const workshopData = {
      ...req.body,
      createdBy: req.user.userId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const result = await workshopService.createWorkshop(workshopData);
    res.status(201).json(result);
  } catch (error) {
    if (error.message.includes('validation error')) {
      res.status(400).json({ 
        message: error.message,
        errors: error.errors || []
      });
    } else {
      res.status(500).json({ 
        message: 'Internal server error',
        error: error.message 
      });
    }
  }
});

// Get all workshops with filtering
router.get('/', authenticateToken, async (req, res) => {
  try {
    const filters = {
      region: req.query.region,
      specialization: req.query.specialization,
      status: req.query.status,
      search: req.query.search,
      date: req.query.date,
      includeAllStatuses: req.query.includeAllStatuses === 'true'
    };

    const userRole = req.user.role;
    const result = await workshopService.getAllWorkshops(filters, userRole);
    res.json(result);
  } catch (error) {
    res.status(500).json({ 
      message: 'Internal server error',
      error: error.message 
    });
  }
});

// Get workshop by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const workshopId = req.params.id;
    const userRole = req.user.role;
    
    const result = await workshopService.getWorkshopById(workshopId, userRole);
    
    if (!result.workshop) {
      return res.status(404).json({ message: 'Workshop not found' });
    }
    
    res.json(result);
  } catch (error) {
    res.status(500).json({ 
      message: 'Internal server error',
      error: error.message 
    });
  }
});

// Update workshop (coordinator only)
router.put('/:id', authenticateToken, requireRole('coordinator'), async (req, res) => {
  try {
    const workshopId = req.params.id;
    const updateData = {
      ...req.body,
      updatedAt: new Date().toISOString()
    };
    
    const result = await workshopService.updateWorkshop(workshopId, updateData);
    
    if (!result.workshop) {
      return res.status(404).json({ message: 'Workshop not found' });
    }
    
    res.json(result);
  } catch (error) {
    if (error.message.includes('validation error')) {
      res.status(400).json({ 
        message: error.message,
        errors: error.errors || []
      });
    } else {
      res.status(500).json({ 
        message: 'Internal server error',
        error: error.message 
      });
    }
  }
});

// Update workshop status (coordinator only)
router.put('/:id/status', authenticateToken, requireRole('coordinator'), async (req, res) => {
  try {
    const workshopId = req.params.id;
    const { status, cancellationReason } = req.body;
    
    const result = await workshopService.updateWorkshopStatus(workshopId, status, cancellationReason);
    
    if (!result.workshop) {
      return res.status(404).json({ message: 'Workshop not found' });
    }
    
    res.json(result);
  } catch (error) {
    if (error.message.includes('validation error')) {
      res.status(400).json({ 
        message: error.message,
        errors: error.errors || []
      });
    } else {
      res.status(500).json({ 
        message: 'Internal server error',
        error: error.message 
      });
    }
  }
});

// Delete workshop (coordinator only)
router.delete('/:id', authenticateToken, requireRole('coordinator'), async (req, res) => {
  try {
    const workshopId = req.params.id;
    const result = await workshopService.deleteWorkshop(workshopId);
    
    if (!result.success) {
      return res.status(404).json({ message: 'Workshop not found' });
    }
    
    res.json({ message: 'Workshop deleted successfully' });
  } catch (error) {
    res.status(500).json({ 
      message: 'Internal server error',
      error: error.message 
    });
  }
});

// Get workshops by coordinator
router.get('/coordinator/my-workshops', authenticateToken, requireRole('coordinator'), async (req, res) => {
  try {
    const coordinatorId = req.user.userId;
    const result = await workshopService.getWorkshopsByCoordinator(coordinatorId);
    res.json(result);
  } catch (error) {
    res.status(500).json({ 
      message: 'Internal server error',
      error: error.message 
    });
  }
});

// Get workshops for volunteer matching
router.get('/volunteer/available', authenticateToken, requireRole('volunteer'), async (req, res) => {
  try {
    const volunteerId = req.user.userId;
    const filters = {
      region: req.query.region,
      specialization: req.query.specialization,
      date: req.query.date
    };
    
    const result = await workshopService.getAvailableWorkshopsForVolunteer(volunteerId, filters);
    res.json(result);
  } catch (error) {
    res.status(500).json({ 
      message: 'Internal server error',
      error: error.message 
    });
  }
});

module.exports = router; 