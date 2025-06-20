const express = require('express');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();

/**
 * GET /api/coordinator/dashboard
 * Get coordinator dashboard data (coordinator only)
 */
router.get('/dashboard', authenticateToken, requireRole('coordinator'), async (req, res) => {
  try {
    // Mock dashboard data for now
    const dashboardData = {
      dashboard: {
        totalWorkshops: 0,
        pendingApplications: 0,
        activeVolunteers: 0,
        upcomingWorkshops: [],
        recentActivity: []
      },
      coordinator: req.user
    };

    res.json(dashboardData);
  } catch (error) {
    console.error('Dashboard fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard data' });
  }
});

/**
 * GET /api/coordinator/workshops
 * Get all workshops (coordinator only)
 */
router.get('/workshops', authenticateToken, requireRole('coordinator'), async (req, res) => {
  try {
    // Mock workshops data
    const workshops = [];

    res.json({
      workshops,
      total: workshops.length
    });
  } catch (error) {
    console.error('Workshops fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch workshops' });
  }
});

/**
 * POST /api/coordinator/workshops
 * Create new workshop (coordinator only)
 */
router.post('/workshops', authenticateToken, requireRole('coordinator'), async (req, res) => {
  try {
    const { title, description, date, location } = req.body;

    // Basic validation
    if (!title || !description || !date || !location) {
      return res.status(400).json({ 
        error: 'Title, description, date, and location are required' 
      });
    }

    // Mock workshop creation
    const workshop = {
      id: `workshop_${Date.now()}`,
      title,
      description,
      date,
      location,
      coordinatorId: req.user.id,
      status: 'draft',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    res.status(201).json({
      message: 'Workshop created successfully',
      workshop
    });
  } catch (error) {
    console.error('Workshop creation error:', error);
    res.status(500).json({ error: 'Failed to create workshop' });
  }
});

/**
 * GET /api/coordinator/volunteers
 * Get all volunteers (coordinator only)
 */
router.get('/volunteers', authenticateToken, requireRole('coordinator'), async (req, res) => {
  try {
    // Mock volunteers data
    const volunteers = [];

    res.json({
      volunteers,
      total: volunteers.length
    });
  } catch (error) {
    console.error('Volunteers fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch volunteers' });
  }
});

module.exports = router; 