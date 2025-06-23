const express = require('express');
const router = express.Router();
const ProfileService = require('../services/profileService');
const { authenticateToken, requireRole } = require('../middleware/auth');

const profileService = new ProfileService();

// Create a new profile
router.post('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const profileData = req.body;

    const newProfile = await profileService.createProfile(userId, profileData);
    
    res.status(201).json({
      message: 'Profile created successfully',
      profileId: newProfile.profileId,
      profile: newProfile
    });
  } catch (error) {
    console.error('Profile creation error:', error);
    
    if (error.message.includes('Validation failed')) {
      return res.status(400).json({ error: error.message });
    }
    
    if (error.message.includes('Profile already exists')) {
      return res.status(409).json({ error: error.message });
    }
    
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get current user's profile
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const profile = await profileService.getProfileByUserId(userId);
    
    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }
    
    res.json({ profile });
  } catch (error) {
    console.error('Profile retrieval error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update current user's profile
router.put('/me', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const updateData = req.body;

    const updatedProfile = await profileService.updateProfile(userId, updateData);
    
    res.json({
      message: 'Profile updated successfully',
      profile: updatedProfile
    });
  } catch (error) {
    console.error('Profile update error:', error);
    
    if (error.message.includes('Validation failed')) {
      return res.status(400).json({ error: error.message });
    }
    
    if (error.message.includes('Profile not found')) {
      return res.status(404).json({ error: error.message });
    }
    
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete current user's profile
router.delete('/me', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    
    await profileService.deleteProfile(userId);
    
    res.json({ message: 'Profile deleted successfully' });
  } catch (error) {
    console.error('Profile deletion error:', error);
    
    if (error.message.includes('Profile not found')) {
      return res.status(404).json({ error: error.message });
    }
    
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update profile photo
router.post('/me/photo', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { photoUrl } = req.body;

    if (!photoUrl) {
      return res.status(400).json({ error: 'Photo URL is required' });
    }

    const updatedProfile = await profileService.updateProfilePhoto(userId, photoUrl);
    
    res.json({
      message: 'Profile photo updated successfully',
      profile: updatedProfile
    });
  } catch (error) {
    console.error('Profile photo update error:', error);
    
    if (error.message.includes('Profile not found')) {
      return res.status(404).json({ error: error.message });
    }
    
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Search profiles (coordinator only)
router.get('/search', authenticateToken, requireRole('coordinator'), async (req, res) => {
  try {
    const filters = {
      specialization: req.query.specialization,
      region: req.query.region,
      language: req.query.language,
      experienceMin: req.query.experienceMin ? parseInt(req.query.experienceMin) : undefined,
      experienceMax: req.query.experienceMax ? parseInt(req.query.experienceMax) : undefined,
      availability: req.query.availability
    };

    // Remove undefined filters
    Object.keys(filters).forEach(key => {
      if (filters[key] === undefined) {
        delete filters[key];
      }
    });

    const profiles = await profileService.searchProfiles(filters);
    
    res.json({
      profiles,
      count: profiles.length,
      filters: filters
    });
  } catch (error) {
    console.error('Profile search error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all profiles (coordinator only)
router.get('/all', authenticateToken, requireRole('coordinator'), async (req, res) => {
  try {
    const profiles = await profileService.getAllProfiles();
    
    res.json({
      profiles,
      count: profiles.length
    });
  } catch (error) {
    console.error('Get all profiles error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get profile statistics (coordinator only)
router.get('/stats', authenticateToken, requireRole('coordinator'), async (req, res) => {
  try {
    const stats = await profileService.getProfileStats();
    
    res.json({ stats });
  } catch (error) {
    console.error('Profile stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get profile by ID - handles both profileId and userId with proper access control
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const requestingUserId = req.user.userId;
    const targetId = req.params.id;
    const isCoordinator = req.user.role === 'coordinator';
    
    let profile;
    
    // Try to get profile by profileId first (for coordinators)
    if (isCoordinator) {
      profile = await profileService.getProfileById(targetId);
      
      // If not found by profileId, try by userId
      if (!profile) {
        profile = await profileService.getProfileByUserId(targetId);
      }
    } else {
      // For volunteers, only allow access to their own profile by userId
      if (requestingUserId !== targetId) {
        return res.status(403).json({ error: 'Access denied. You can only access your own profile.' });
      }
      
      profile = await profileService.getProfileByUserId(targetId);
    }
    
    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }
    
    res.json({ profile });
  } catch (error) {
    console.error('Profile retrieval error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router; 