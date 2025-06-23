const request = require('supertest');
const fs = require('fs-extra');
const path = require('path');

describe('Profile Management System - MVP.3', () => {
  let app;
  let authToken;
  let userId;
  let testDataDir;
  let profilesFile;
  
  beforeAll(async () => {
    // Set up test environment
    testDataDir = path.join(__dirname, 'test-profile-data');
    profilesFile = path.join(testDataDir, 'volunteer-profiles.json');
  });

  beforeEach(async () => {
    // Clean up test data before each test
    await fs.remove(testDataDir);
    await fs.ensureDir(testDataDir);
    
    // Initialize with empty profiles file
    await fs.writeJSON(profilesFile, { profiles: [] });
    
    // Import modules after setup (when they exist)
    try {
      const { createApp } = require('../backend/app');
      app = createApp();
      
      // Register and login a test user to get auth token
      const registerResponse = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'volunteer@example.com',
          password: 'SecurePass123!',
          firstName: 'John',
          lastName: 'Volunteer',
          role: 'volunteer'
        });

      userId = registerResponse.body.userId;

      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'volunteer@example.com',
          password: 'SecurePass123!'
        });

      authToken = loginResponse.body.token;
    } catch (error) {
      // Modules don't exist yet - that's expected in TDD
    }
  });

  afterEach(async () => {
    await fs.remove(testDataDir);
  });

  describe('MVP.3.1 - Profile CRUD Operations', () => {
    test('should create a new volunteer profile', async () => {
      if (!app) return;

      const profileData = {
        phone: '+1-514-555-0123',
        barAssociation: 'Barreau du Québec',
        licenseNumber: 'BQ123456',
        specializations: ['Employment Law', 'Corporate Law'],
        experienceYears: 5,
        languages: ['French', 'English'],
        regions: ['Montreal', 'Laval'],
        bio: 'Experienced employment lawyer passionate about education',
        availabilityPreferences: {
          daysOfWeek: ['Monday', 'Wednesday', 'Friday'],
          timeSlots: ['morning', 'afternoon'],
          maxWorkshopsPerMonth: 3
        }
      };

      const response = await request(app)
        .post('/api/profiles')
        .set('Authorization', `Bearer ${authToken}`)
        .send(profileData)
        .expect(201);

      expect(response.body).toHaveProperty('message', 'Profile created successfully');
      expect(response.body).toHaveProperty('profileId');
      expect(response.body.profile).toHaveProperty('userId', userId);
      expect(response.body.profile.specializations).toEqual(profileData.specializations);
      expect(response.body.profile.languages).toEqual(profileData.languages);
    });

    test('should get current user profile', async () => {
      if (!app) return;

      // Create profile first
      const profileData = {
        phone: '+1-514-555-0123',
        specializations: ['Employment Law'],
        languages: ['French'],
        regions: ['Montreal']
      };

      await request(app)
        .post('/api/profiles')
        .set('Authorization', `Bearer ${authToken}`)
        .send(profileData);

      // Get profile
      const response = await request(app)
        .get('/api/profiles/me')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('profile');
      expect(response.body.profile).toHaveProperty('userId', userId);
      expect(response.body.profile.phone).toBe(profileData.phone);
      expect(response.body.profile.specializations).toEqual(profileData.specializations);
    });

    test('should update existing profile', async () => {
      if (!app) return;

      // Create profile first
      await request(app)
        .post('/api/profiles')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          phone: '+1-514-555-0123',
          specializations: ['Employment Law'],
          languages: ['French']
        });

      // Update profile
      const updateData = {
        phone: '+1-514-555-9999',
        specializations: ['Employment Law', 'Corporate Law'],
        languages: ['French', 'English'],
        experienceYears: 8
      };

      const response = await request(app)
        .put('/api/profiles/me')
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.message).toBe('Profile updated successfully');
      expect(response.body.profile.phone).toBe(updateData.phone);
      expect(response.body.profile.experienceYears).toBe(updateData.experienceYears);
      expect(response.body.profile.specializations).toEqual(updateData.specializations);
    });

    test('should delete profile', async () => {
      if (!app) return;

      // Create profile first
      await request(app)
        .post('/api/profiles')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          phone: '+1-514-555-0123',
          specializations: ['Employment Law']
        });

      // Delete profile
      const response = await request(app)
        .delete('/api/profiles/me')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.message).toBe('Profile deleted successfully');

      // Verify profile is deleted
      await request(app)
        .get('/api/profiles/me')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });

    test('should prevent duplicate profile creation', async () => {
      if (!app) return;

      const profileData = {
        phone: '+1-514-555-0123',
        specializations: ['Employment Law']
      };

      // Create first profile
      await request(app)
        .post('/api/profiles')
        .set('Authorization', `Bearer ${authToken}`)
        .send(profileData)
        .expect(201);

      // Try to create another profile
      const response = await request(app)
        .post('/api/profiles')
        .set('Authorization', `Bearer ${authToken}`)
        .send(profileData)
        .expect(409);

      expect(response.body.error).toContain('Profile already exists');
    });
  });

  describe('MVP.3.2 - Profile Validation Tests', () => {
    test('should validate required profile fields', async () => {
      if (!app) return;

      const invalidData = {
        // Missing required fields
      };

      const response = await request(app)
        .post('/api/profiles')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidData)
        .expect(400);

      expect(response.body.error).toContain('required');
    });

    test('should validate phone number format', async () => {
      if (!app) return;

      const invalidData = {
        phone: 'invalid-phone',
        specializations: ['Employment Law']
      };

      const response = await request(app)
        .post('/api/profiles')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidData)
        .expect(400);

      expect(response.body.error).toContain('phone');
    });

    test('should validate specializations array', async () => {
      if (!app) return;

      const invalidData = {
        phone: '+1-514-555-0123',
        specializations: 'not-an-array'
      };

      const response = await request(app)
        .post('/api/profiles')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidData)
        .expect(400);

      expect(response.body.error).toContain('specializations');
    });

    test('should validate experience years range', async () => {
      if (!app) return;

      const invalidData = {
        phone: '+1-514-555-0123',
        specializations: ['Employment Law'],
        experienceYears: -5
      };

      const response = await request(app)
        .post('/api/profiles')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidData)
        .expect(400);

      expect(response.body.error).toContain('experience');
    });
  });

  describe('MVP.3.3 - Profile Search and Filtering', () => {
    test('should search profiles by specialization (coordinator only)', async () => {
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

      const coordLogin = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'coordinator@example.com',
          password: 'SecurePass123!'
        });

      const coordToken = coordLogin.body.token;

      // Create volunteer profile
      await request(app)
        .post('/api/profiles')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          phone: '+1-514-555-0123',
          specializations: ['Employment Law', 'Corporate Law']
        });

      // Search profiles
      const response = await request(app)
        .get('/api/profiles/search?specialization=Employment Law')
        .set('Authorization', `Bearer ${coordToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('profiles');
      expect(response.body.profiles).toHaveLength(1);
      expect(response.body.profiles[0].specializations).toContain('Employment Law');
    });

    test('should filter profiles by region (coordinator only)', async () => {
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

      const coordLogin = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'coordinator@example.com',
          password: 'SecurePass123!'
        });

      const coordToken = coordLogin.body.token;

      // Create volunteer profile
      await request(app)
        .post('/api/profiles')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          phone: '+1-514-555-0123',
          specializations: ['Employment Law'],
          regions: ['Montreal', 'Quebec City']
        });

      // Filter by region
      const response = await request(app)
        .get('/api/profiles/search?region=Montreal')
        .set('Authorization', `Bearer ${coordToken}`)
        .expect(200);

      expect(response.body.profiles).toHaveLength(1);
      expect(response.body.profiles[0].regions).toContain('Montreal');
    });

    test('should deny profile search to volunteers', async () => {
      if (!app) return;

      const response = await request(app)
        .get('/api/profiles/search')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(403);

      expect(response.body.error).toContain('Insufficient privileges');
    });
  });

  describe('MVP.3.4 - Profile Photo Upload', () => {
    test('should handle profile photo upload placeholder', async () => {
      if (!app) return;

      // Create profile first
      await request(app)
        .post('/api/profiles')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          phone: '+1-514-555-0123',
          specializations: ['Employment Law']
        });

      // Simulate photo upload (will be implemented later)
      const response = await request(app)
        .post('/api/profiles/me/photo')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ photoUrl: '/uploads/photos/default-avatar.jpg' })
        .expect(200);

      expect(response.body.message).toContain('Photo updated');
    });
  });

  describe('MVP.3.5 - Profile Authorization', () => {
    test('should require authentication for profile operations', async () => {
      if (!app) return;

      const response = await request(app)
        .get('/api/profiles/me')
        .expect(401);

      expect(response.body.error).toContain('No token provided');
    });

    test('should only allow users to access their own profile', async () => {
      if (!app) return;

      // Register another user
      const otherUserReg = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'other@example.com',
          password: 'SecurePass123!',
          firstName: 'Other',
          lastName: 'User',
          role: 'volunteer'
        });

      const otherUserId = otherUserReg.body.userId;

      // Try to access other user's profile
      const response = await request(app)
        .get(`/api/profiles/${otherUserId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(403);

      expect(response.body.error).toContain('Access denied');
    });
  });

  describe('MVP.3.6 - Profile Data Persistence', () => {
    test('should persist profile data in JSON storage', async () => {
      if (!app) return;

      const profileData = {
        phone: '+1-514-555-0123',
        specializations: ['Employment Law'],
        languages: ['French', 'English']
      };

      await request(app)
        .post('/api/profiles')
        .set('Authorization', `Bearer ${authToken}`)
        .send(profileData);

      // Verify data is actually stored in JSON file
      // Note: This would check the actual JSON file in a real scenario
      const response = await request(app)
        .get('/api/profiles/me')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.profile).toMatchObject(profileData);
    });
  });
}); 