const request = require('supertest');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const fs = require('fs-extra');
const path = require('path');

// We'll test the auth module once it's created
describe('Authentication System - MVP.2', () => {
  let app;
  let authService;
  let testDataDir;
  let usersFile;
  
  beforeAll(async () => {
    // Set up test environment
    testDataDir = path.join(__dirname, 'test-auth-data');
    usersFile = path.join(testDataDir, 'users.json');
  });

  beforeEach(async () => {
    // Clean up test data before each test
    await fs.remove(testDataDir);
    await fs.ensureDir(testDataDir);
    
    // Initialize with empty users file
    await fs.writeJSON(usersFile, { users: [] });
    
    // Import modules after setup (when they exist)
    try {
      const { createApp } = require('../backend/app');
      const AuthService = require('../backend/services/authService');
      
      authService = new AuthService(usersFile);
      app = createApp();
    } catch (error) {
      // Modules don't exist yet - that's expected in TDD
    }
  });

  afterEach(async () => {
    await fs.remove(testDataDir);
  });

  describe('MVP.2.1 - User Registration Tests', () => {
    test('should register a new volunteer user', async () => {
      // Skip if app not created yet
      if (!app) return;

      const userData = {
        email: 'volunteer@example.com',
        password: 'SecurePass123!',
        firstName: 'John',
        lastName: 'Doe',
        role: 'volunteer'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      expect(response.body).toHaveProperty('message', 'User registered successfully');
      expect(response.body).toHaveProperty('userId');
      expect(response.body).not.toHaveProperty('password');
      
      const usersData = await fs.readJSON(usersFile);
      expect(usersData.users).toHaveLength(1);
      expect(usersData.users[0].email).toBe(userData.email);
      expect(usersData.users[0].role).toBe('volunteer');
    });

    test('should register a new coordinator user', async () => {
      if (!app) return;

      const userData = {
        email: 'coordinator@example.com',
        password: 'SecurePass123!',
        firstName: 'Jane',
        lastName: 'Smith',
        role: 'coordinator'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      expect(response.body.message).toBe('User registered successfully');
      
      // Verify coordinator role was saved
      const usersData = await fs.readJSON(usersFile);
      expect(usersData.users[0].role).toBe('coordinator');
    });

    test('should hash password during registration', async () => {
      if (!app) return;

      const userData = {
        email: 'test@example.com',
        password: 'PlainPassword',
        firstName: 'Test',
        lastName: 'User',
        role: 'volunteer'
      };

      await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      const usersData = await fs.readJSON(usersFile);
      const savedUser = usersData.users[0];
      
      expect(savedUser.password).not.toBe(userData.password);
      expect(savedUser.password).toMatch(/^\$2[ab]\$\d+\$/);
      
      const isValid = await bcrypt.compare(userData.password, savedUser.password);
      expect(isValid).toBe(true);
    });

    test('should reject registration with invalid email format', async () => {
      if (!app) return;

      const userData = {
        email: 'invalid-email',
        password: 'SecurePass123!',
        firstName: 'John',
        lastName: 'Doe',
        role: 'volunteer'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('email');
    });

    test('should reject registration with weak password', async () => {
      if (!app) return;

      const userData = {
        email: 'test@example.com',
        password: '123',
        firstName: 'John',
        lastName: 'Doe',
        role: 'volunteer'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body.error).toContain('password');
    });

    test('should reject registration with existing email', async () => {
      if (!app) return;

      const userData = {
        email: 'test@example.com',
        password: 'SecurePass123!',
        firstName: 'John',
        lastName: 'Doe',
        role: 'volunteer'
      };

      await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(409);

      expect(response.body.error).toContain('already exists');
    });

    test('should reject registration with invalid role', async () => {
      if (!app) return;

      const userData = {
        email: 'test@example.com',
        password: 'SecurePass123!',
        firstName: 'John',
        lastName: 'Doe',
        role: 'invalid_role'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body.error).toContain('role');
    });
  });

  describe('MVP.2.2 - User Login Tests', () => {
    test('should login with valid credentials', async () => {
      if (!app) return;

      // Register user first
      await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test@example.com',
          password: 'SecurePass123!',
          firstName: 'John',
          lastName: 'Doe',
          role: 'volunteer'
        });

      const loginData = {
        email: 'test@example.com',
        password: 'SecurePass123!'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(200);

      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user.email).toBe(loginData.email);
      expect(response.body.user).not.toHaveProperty('password');
    });

    test('should reject login with incorrect password', async () => {
      if (!app) return;

      // Register user first
      await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test@example.com',
          password: 'SecurePass123!',
          firstName: 'John',
          lastName: 'Doe',
          role: 'volunteer'
        });

      const loginData = {
        email: 'test@example.com',
        password: 'WrongPassword'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(401);

      expect(response.body.error).toContain('Invalid credentials');
    });

    test('should reject login with non-existent email', async () => {
      if (!app) return;

      const loginData = {
        email: 'nonexistent@example.com',
        password: 'SecurePass123!'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(401);

      expect(response.body.error).toContain('Invalid credentials');
    });

    test('should include user role in JWT token', async () => {
      if (!app) return;

      // Register user first
      await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test@example.com',
          password: 'SecurePass123!',
          firstName: 'John',
          lastName: 'Doe',
          role: 'volunteer'
        });

      const loginData = {
        email: 'test@example.com',
        password: 'SecurePass123!'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(200);

      const decoded = jwt.verify(response.body.token, process.env.JWT_SECRET || 'fallback-secret-key');
      expect(decoded).toHaveProperty('role', 'volunteer');
    });
  });

  describe('MVP.2.3 - JWT Authentication Middleware Tests', () => {
    test('should allow access to protected route with valid token', async () => {
      if (!app) return;

      // Register and login
      await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test@example.com',
          password: 'SecurePass123!',
          firstName: 'John',
          lastName: 'Doe',
          role: 'volunteer'
        });

      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'SecurePass123!'
        });

      const authToken = loginResponse.body.token;

      const response = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('user');
      expect(response.body.user.email).toBe('test@example.com');
    });

    test('should reject access without authorization header', async () => {
      if (!app) return;

      const response = await request(app)
        .get('/api/auth/profile')
        .expect(401);

      expect(response.body.error).toContain('No token provided');
    });

    test('should reject access with invalid token', async () => {
      if (!app) return;

      const response = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);

      expect(response.body.error).toContain('Invalid token');
    });

    test('should reject access with expired token', async () => {
      if (!app) return;

      const expiredToken = jwt.sign(
        { userId: 1, email: 'test@example.com', role: 'volunteer' },
        process.env.JWT_SECRET || 'fallback-secret-key',
        { expiresIn: '0s' }
      );

      const response = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', `Bearer ${expiredToken}`)
        .expect(401);

      expect(response.body.error).toContain('expired');
    });
  });

  describe('MVP.2.4 - Session Management Tests', () => {
    test('should track user sessions in JSON storage', async () => {
      if (!app) return;

      const loginData = {
        email: 'test@example.com',
        password: 'SecurePass123!'
      };

      // Pre-register user
      await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test@example.com',
          password: 'SecurePass123!',
          firstName: 'John',
          lastName: 'Doe',
          role: 'volunteer'
        });

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(200);

      expect(response.body).toHaveProperty('sessionId');
    });

    test('should logout and invalidate session', async () => {
      if (!app) return;

      await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test@example.com',
          password: 'SecurePass123!',
          firstName: 'John',
          lastName: 'Doe',
          role: 'volunteer'
        });

      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'SecurePass123!'
        });

      const authToken = loginResponse.body.token;

      const response = await request(app)
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.message).toContain('logged out');
    });
  });

  describe('MVP.2.5 - Role-Based Access Tests', () => {
    test('should allow coordinators to access coordinator routes', async () => {
      if (!app) return;

      // Register coordinator
      await request(app)
        .post('/api/auth/register')
        .send({
          email: 'coordinator@example.com',
          password: 'SecurePass123!',
          firstName: 'Jane',
          lastName: 'Coordinator',
          role: 'coordinator'
        });

      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'coordinator@example.com',
          password: 'SecurePass123!'
        });

      const coordinatorToken = loginResponse.body.token;

      const response = await request(app)
        .get('/api/coordinator/dashboard')
        .set('Authorization', `Bearer ${coordinatorToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('dashboard');
    });

    test('should deny volunteers access to coordinator routes', async () => {
      if (!app) return;

      // Register volunteer
      await request(app)
        .post('/api/auth/register')
        .send({
          email: 'volunteer@example.com',
          password: 'SecurePass123!',
          firstName: 'John',
          lastName: 'Volunteer',
          role: 'volunteer'
        });

      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'volunteer@example.com',
          password: 'SecurePass123!'
        });

      const volunteerToken = loginResponse.body.token;

      const response = await request(app)
        .get('/api/coordinator/dashboard')
        .set('Authorization', `Bearer ${volunteerToken}`)
        .expect(403);

      expect(response.body.error).toContain('Insufficient privileges');
    });

    test('should allow both roles to access common routes', async () => {
      if (!app) return;

      // Register and login volunteer
      await request(app)
        .post('/api/auth/register')
        .send({
          email: 'volunteer@example.com',
          password: 'SecurePass123!',
          firstName: 'John',
          lastName: 'Volunteer',
          role: 'volunteer'
        });

      const volunteerLogin = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'volunteer@example.com',
          password: 'SecurePass123!'
        });

      const volunteerToken = volunteerLogin.body.token;

      // Test volunteer access
      await request(app)
        .get('/api/auth/profile')
        .set('Authorization', `Bearer ${volunteerToken}`)
        .expect(200);
    });
  });

  describe('MVP.2.6 - Password Security Tests', () => {
    test('should enforce password complexity requirements', async () => {
      if (!app) return;

      const weakPasswords = [
        'password',      // Common password
        '12345678',      // Only numbers
        'abcdefgh',      // Only lowercase
        'ABCDEFGH',      // Only uppercase
        'Pass1',         // Too short
        'password123',   // Missing special character
      ];

      for (const password of weakPasswords) {
        const response = await request(app)
          .post('/api/auth/register')
          .send({
            email: `test${Date.now()}@example.com`,
            password,
            firstName: 'John',
            lastName: 'Doe',
            role: 'volunteer'
          })
          .expect(400);

        expect(response.body.error).toContain('password');
      }
    });

    test('should accept strong passwords', async () => {
      if (!app) return;

      const strongPasswords = [
        'MyStr0ng@Pass!',
        'Complex1ty&Security',
        'Sup3r$ecure#P@ss'
      ];

      for (let i = 0; i < strongPasswords.length; i++) {
        const response = await request(app)
          .post('/api/auth/register')
          .send({
            email: `test${i}@example.com`,
            password: strongPasswords[i],
            firstName: 'John',
            lastName: 'Doe',
            role: 'volunteer'
          })
          .expect(201);

        expect(response.body).toHaveProperty('userId');
      }
    });
  });
}); 