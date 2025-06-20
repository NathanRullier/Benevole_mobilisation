const express = require('express');
const { authenticateToken, authService } = require('../middleware/auth');

const router = express.Router();

/**
 * POST /api/auth/register
 * Register a new user
 */
router.post('/register', async (req, res) => {
  try {
    const { email, password, firstName, lastName, role } = req.body;

    // Register user
    const user = await authService.register({
      email,
      password,
      firstName,
      lastName,
      role
    });

    res.status(201).json({
      message: 'User registered successfully',
      userId: user.id,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    
    // Handle different types of errors
    if (error.message.includes('already exists')) {
      return res.status(409).json({ error: error.message });
    }
    
    if (error.message.includes('validation failed') || 
        error.message.includes('Invalid') ||
        error.message.includes('required')) {
      return res.status(400).json({ error: error.message });
    }

    res.status(500).json({ error: 'Registration failed' });
  }
});

/**
 * POST /api/auth/login
 * Authenticate user and return JWT token
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Authenticate user
    const result = await authService.login(email, password);

    res.json({
      message: 'Login successful',
      token: result.token,
      sessionId: result.sessionId,
      user: result.user
    });
  } catch (error) {
    console.error('Login error:', error);
    
    if (error.message.includes('Invalid credentials') ||
        error.message.includes('deactivated')) {
      return res.status(401).json({ error: error.message });
    }

    res.status(500).json({ error: 'Login failed' });
  }
});

/**
 * POST /api/auth/logout
 * Logout user and invalidate session
 */
router.post('/logout', authenticateToken, async (req, res) => {
  try {
    const result = await authService.logout(req.user.id, req.sessionId);
    
    res.json(result);
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ error: 'Logout failed' });
  }
});

/**
 * GET /api/auth/profile
 * Get current user's profile
 */
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const userProfile = await authService.getUserProfile(req.user.id);
    
    res.json({
      user: userProfile
    });
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

/**
 * PUT /api/auth/profile
 * Update current user's profile
 */
router.put('/profile', authenticateToken, async (req, res) => {
  try {
    const { firstName, lastName } = req.body;
    const updateData = {};

    // Only allow updating specific fields
    if (firstName) updateData.firstName = firstName;
    if (lastName) updateData.lastName = lastName;

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ error: 'No valid fields to update' });
    }

    // Update user in storage
    const updatedUser = await authService.storage.updateRecord('users', req.user.id, updateData);
    
    // Return updated user without password
    const { password, sessions, ...userWithoutSensitiveData } = updatedUser;
    
    res.json({
      message: 'Profile updated successfully',
      user: userWithoutSensitiveData
    });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

/**
 * GET /api/auth/verify
 * Verify if current token is valid
 */
router.get('/verify', authenticateToken, (req, res) => {
  res.json({
    valid: true,
    user: req.user
  });
});

/**
 * POST /api/auth/refresh
 * Refresh JWT token (extend session)
 */
router.post('/refresh', authenticateToken, async (req, res) => {
  try {
    // Generate new token with same payload but extended expiration
    const jwt = require('jsonwebtoken');
    const tokenPayload = {
      userId: req.user.id,
      email: req.user.email,
      role: req.user.role,
      sessionId: req.sessionId
    };

    const newToken = jwt.sign(tokenPayload, authService.jwtSecret, {
      expiresIn: '24h',
      issuer: 'volunteer-platform',
      audience: 'volunteer-platform-users'
    });

    res.json({
      message: 'Token refreshed successfully',
      token: newToken
    });
  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(500).json({ error: 'Failed to refresh token' });
  }
});

module.exports = router; 