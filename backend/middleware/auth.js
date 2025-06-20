const AuthService = require('../services/authService');
const path = require('path');

// Initialize AuthService with the users file path
const usersFilePath = path.join(__dirname, '../../data/users.json');
const authService = new AuthService(usersFilePath);

/**
 * JWT Authentication Middleware
 */
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    // Verify token and get user data
    const { user, sessionId } = await authService.verifyToken(token);
    
    // Attach user and session info to request
    req.user = user;
    req.sessionId = sessionId;
    
    next();
  } catch (error) {
    return res.status(401).json({ error: error.message });
  }
};

/**
 * Role-based authorization middleware
 */
const requireRole = (requiredRole) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (!authService.hasRole(req.user.role, requiredRole)) {
      return res.status(403).json({ 
        error: 'Insufficient privileges',
        required: requiredRole,
        current: req.user.role
      });
    }

    next();
  };
};

/**
 * Optional authentication middleware (doesn't fail if no token)
 */
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      const { user, sessionId } = await authService.verifyToken(token);
      req.user = user;
      req.sessionId = sessionId;
    }
    
    next();
  } catch (error) {
    // Continue without user authentication
    next();
  }
};

module.exports = {
  authenticateToken,
  requireRole,
  optionalAuth,
  authService // Export for use in routes
}; 