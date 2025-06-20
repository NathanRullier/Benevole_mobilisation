const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const JsonStorage = require('../utils/jsonStorage');

class AuthService {
  constructor(usersFilePath) {
    this.storage = new JsonStorage(usersFilePath);
    this.jwtSecret = process.env.JWT_SECRET || 'fallback-secret-key';
    this.saltRounds = 12;
  }

  /**
   * Validate password strength
   */
  validatePassword(password) {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    const errors = [];

    if (password.length < minLength) {
      errors.push(`Password must be at least ${minLength} characters long`);
    }
    if (!hasUpperCase) {
      errors.push('Password must contain at least one uppercase letter');
    }
    if (!hasLowerCase) {
      errors.push('Password must contain at least one lowercase letter');
    }
    if (!hasNumbers) {
      errors.push('Password must contain at least one number');
    }
    if (!hasSpecialChar) {
      errors.push('Password must contain at least one special character');
    }

    // Check against common weak passwords
    const commonPasswords = ['password', '123456789', 'qwerty', 'abc123', 'password123'];
    if (commonPasswords.includes(password.toLowerCase())) {
      errors.push('Password is too common and easily guessable');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Validate email format
   */
  validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Validate user role
   */
  validateRole(role) {
    const validRoles = ['volunteer', 'coordinator'];
    return validRoles.includes(role);
  }

  /**
   * Check if user exists by email
   */
  async userExists(email) {
    const users = await this.storage.findRecords('users', { email });
    return users.length > 0;
  }

  /**
   * Register a new user
   */
  async register(userData) {
    const { email, password, firstName, lastName, role } = userData;

    // Validate required fields
    if (!email || !password || !firstName || !lastName || !role) {
      throw new Error('All fields are required: email, password, firstName, lastName, role');
    }

    // Validate email format
    if (!this.validateEmail(email)) {
      throw new Error('Invalid email format');
    }

    // Validate password strength
    const passwordValidation = this.validatePassword(password);
    if (!passwordValidation.isValid) {
      throw new Error(`Password validation failed: ${passwordValidation.errors.join(', ')}`);
    }

    // Validate role
    if (!this.validateRole(role)) {
      throw new Error('Invalid role. Must be either "volunteer" or "coordinator"');
    }

    // Check if user already exists
    if (await this.userExists(email)) {
      throw new Error('User with this email already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, this.saltRounds);

    // Create user object
    const newUser = {
      email,
      password: hashedPassword,
      firstName,
      lastName,
      role,
      isActive: true,
      lastLogin: null,
      sessions: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Save user to storage
    const savedUser = await this.storage.addRecord('users', newUser);

    // Return user without password
    const { password: _, ...userWithoutPassword } = savedUser;
    return userWithoutPassword;
  }

  /**
   * Authenticate user login
   */
  async login(email, password) {
    // Validate input
    if (!email || !password) {
      throw new Error('Email and password are required');
    }

    // Find user by email
    const users = await this.storage.findRecords('users', { email });
    if (users.length === 0) {
      throw new Error('Invalid credentials');
    }

    const user = users[0];

    // Check if user is active
    if (!user.isActive) {
      throw new Error('Account is deactivated');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new Error('Invalid credentials');
    }

    // Generate session ID and JWT token
    const sessionId = this.storage.generateId();
    const tokenPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
      sessionId
    };

    const token = jwt.sign(tokenPayload, this.jwtSecret, {
      expiresIn: '24h',
      issuer: 'volunteer-platform',
      audience: 'volunteer-platform-users'
    });

    // Update user with login information
    const session = {
      id: sessionId,
      token,
      createdAt: new Date().toISOString(),
      isActive: true,
      userAgent: '', // Can be populated from request headers
      ipAddress: '' // Can be populated from request
    };

    // Update user sessions and last login
    const updatedSessions = [...(user.sessions || []), session];
    await this.storage.updateRecord('users', user.id, {
      lastLogin: new Date().toISOString(),
      sessions: updatedSessions
    });

    // Return user data without password and the token
    const { password: _, sessions, ...userWithoutPassword } = user;
    return {
      user: userWithoutPassword,
      token,
      sessionId
    };
  }

  /**
   * Verify JWT token and get user data
   */
  async verifyToken(token) {
    try {
      // Verify and decode token
      const decoded = jwt.verify(token, this.jwtSecret, {
        issuer: 'volunteer-platform',
        audience: 'volunteer-platform-users'
      });

      // Find user by ID
      const users = await this.storage.findRecords('users', { id: decoded.userId });
      if (users.length === 0) {
        throw new Error('User not found');
      }

      const user = users[0];

      // Check if user is active
      if (!user.isActive) {
        throw new Error('Account is deactivated');
      }

      // Check if session is still active
      const session = user.sessions?.find(s => s.id === decoded.sessionId && s.isActive);
      if (!session) {
        throw new Error('Session is invalid or expired');
      }

      // Return user data without password
      const { password: _, sessions, ...userWithoutPassword } = user;
      return {
        user: userWithoutPassword,
        sessionId: decoded.sessionId
      };
    } catch (error) {
      if (error.name === 'JsonWebTokenError') {
        throw new Error('Invalid token');
      }
      if (error.name === 'TokenExpiredError') {
        throw new Error('Token has expired');
      }
      throw error;
    }
  }

  /**
   * Logout user and invalidate session
   */
  async logout(userId, sessionId) {
    // Find user
    const users = await this.storage.findRecords('users', { id: userId });
    if (users.length === 0) {
      throw new Error('User not found');
    }

    const user = users[0];

    // Deactivate the specific session
    const updatedSessions = user.sessions?.map(session => {
      if (session.id === sessionId) {
        return { ...session, isActive: false, loggedOutAt: new Date().toISOString() };
      }
      return session;
    }) || [];

    // Update user sessions
    await this.storage.updateRecord('users', userId, {
      sessions: updatedSessions
    });

    return { message: 'Successfully logged out' };
  }

  /**
   * Get user profile by ID
   */
  async getUserProfile(userId) {
    const users = await this.storage.findRecords('users', { id: userId });
    if (users.length === 0) {
      throw new Error('User not found');
    }

    const user = users[0];
    const { password: _, sessions, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  /**
   * Check if user has required role
   */
  hasRole(userRole, requiredRole) {
    const roleHierarchy = {
      coordinator: ['coordinator', 'volunteer'],
      volunteer: ['volunteer']
    };

    return roleHierarchy[userRole]?.includes(requiredRole) || false;
  }

  /**
   * Clean up expired sessions (utility method)
   */
  async cleanupExpiredSessions() {
    const data = await this.storage.read();
    const users = data.users || [];

    for (const user of users) {
      if (user.sessions && user.sessions.length > 0) {
        // Keep only active sessions from the last 7 days
        const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
        const validSessions = user.sessions.filter(session => 
          session.isActive && session.createdAt > oneWeekAgo
        );

        if (validSessions.length !== user.sessions.length) {
          await this.storage.updateRecord('users', user.id, {
            sessions: validSessions
          });
        }
      }
    }
  }
}

module.exports = AuthService; 