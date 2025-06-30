// MVP.5.1: Application Workflow Tests
// Tests for volunteer application and coordinator review system

const request = require('supertest');
const { createApp } = require('../backend/app');
const fs = require('fs-extra');
const path = require('path');

describe('Application Management - MVP.5 Backend', () => {
  let app;
  let volunteerToken;
  let coordinatorToken;
  let testWorkshopId;
  let testVolunteerId;
  let testCoordinatorId;
  let testApplicationId;
  
  const dataDir = path.join(__dirname, '../data');
  const applicationsFile = path.join(dataDir, 'applications.json');
  const workshopsFile = path.join(dataDir, 'workshops.json');
  const usersFile = path.join(dataDir, 'users.json');

  beforeAll(async () => {
    app = createApp();
    
    // Ensure data directory exists
    await fs.ensureDir(dataDir);
    
    // Create test users
    const testUsers = {
      users: [
        {
          id: 'test-volunteer-id',
          email: 'volunteer@example.com',
          password: '$2b$10$hashedPassword',
          role: 'volunteer',
          firstName: 'John',
          lastName: 'Volunteer',
          phone: '514-555-0123',
          specializations: ['Employment Law', 'Family Law'],
          location: { city: 'Montreal', region: 'Montreal' },
          availability: {
            days: ['monday', 'wednesday', 'friday'],
            timeSlots: ['morning', 'afternoon'],
            maxWorkshopsPerMonth: 3
          }
        },
        {
          id: 'test-coordinator-id',
          email: 'coordinator@example.com',
          password: '$2b$10$hashedPassword',
          role: 'coordinator',
          firstName: 'Jane',
          lastName: 'Coordinator'
        }
      ]
    };
    await fs.writeJSON(usersFile, testUsers);
    
    // Create test workshop
    const testWorkshops = {
      workshops: [
        {
          id: 'test-workshop-id',
          title: 'Employment Law Workshop',
          description: 'Basic employment rights workshop',
          date: '2024-12-15',
          startTime: '10:00',
          endTime: '12:00',
          location: {
            name: 'Community Center',
            address: '123 Main St',
            city: 'Montreal',
            region: 'Montreal'
          },
          maxVolunteers: 2,
          requiredSpecializations: ['Employment Law'],
          status: 'published',
          createdBy: 'test-coordinator-id',
          applicationsCount: 0,
          applications: []
        }
      ]
    };
    await fs.writeJSON(workshopsFile, testWorkshops);
    
    // Initialize empty applications file
    await fs.writeJSON(applicationsFile, { applications: [] });
    
    // Login users to get tokens
    const volunteerLogin = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'volunteer@example.com',
        password: 'password'
      });
    volunteerToken = volunteerLogin.body.token;
    testVolunteerId = 'test-volunteer-id';
    
    const coordinatorLogin = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'coordinator@example.com',
        password: 'password'
      });
    coordinatorToken = coordinatorLogin.body.token;
    testCoordinatorId = 'test-coordinator-id';
    testWorkshopId = 'test-workshop-id';
  });

  afterAll(async () => {
    // Clean up test files
    await fs.remove(applicationsFile);
    await fs.remove(workshopsFile);
    await fs.remove(usersFile);
  });

  beforeEach(async () => {
    // Reset applications before each test
    await fs.writeJSON(applicationsFile, { applications: [] });
  });

  describe('Application Submission (Volunteer)', () => {
    test('should allow volunteer to apply for workshop', async () => {
      const applicationData = {
        message: 'I am very interested in this workshop and have experience in employment law.',
        availabilityConfirmation: 'confirmed',
        additionalNotes: 'I can help with setup if needed.'
      };

      const response = await request(app)
        .post(`/api/applications/workshops/${testWorkshopId}`)
        .set('Authorization', `Bearer ${volunteerToken}`)
        .send(applicationData);

      expect(response.status).toBe(201);
      expect(response.body).toMatchObject({
        message: 'Application submitted successfully',
        applicationId: expect.any(String),
        application: expect.objectContaining({
          workshopId: testWorkshopId,
          volunteerId: testVolunteerId,
          message: applicationData.message,
          availabilityConfirmation: 'confirmed',
          status: 'pending',
          appliedAt: expect.any(String)
        })
      });

      testApplicationId = response.body.applicationId;
    });

    test('should prevent duplicate applications', async () => {
      // Submit first application
      const applicationData = {
        message: 'First application',
        availabilityConfirmation: 'confirmed'
      };

      await request(app)
        .post(`/api/applications/workshops/${testWorkshopId}`)
        .set('Authorization', `Bearer ${volunteerToken}`)
        .send(applicationData);

      // Try to submit duplicate
      const response = await request(app)
        .post(`/api/applications/workshops/${testWorkshopId}`)
        .set('Authorization', `Bearer ${volunteerToken}`)
        .send(applicationData);

      expect(response.status).toBe(409);
      expect(response.body.message).toContain('already applied');
    });

    test('should validate required application fields', async () => {
      const response = await request(app)
        .post(`/api/applications/workshops/${testWorkshopId}`)
        .set('Authorization', `Bearer ${volunteerToken}`)
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('validation error');
      expect(response.body.errors).toContain('Message is required');
      expect(response.body.errors).toContain('Availability confirmation is required');
    });

    test('should validate availability confirmation values', async () => {
      const response = await request(app)
        .post(`/api/applications/workshops/${testWorkshopId}`)
        .set('Authorization', `Bearer ${volunteerToken}`)
        .send({
          message: 'Test message',
          availabilityConfirmation: 'invalid-value'
        });

      expect(response.status).toBe(400);
      expect(response.body.errors).toContain('Invalid availability confirmation');
    });

    test('should prevent application to non-existent workshop', async () => {
      const response = await request(app)
        .post('/api/applications/workshops/non-existent-id')
        .set('Authorization', `Bearer ${volunteerToken}`)
        .send({
          message: 'Test message',
          availabilityConfirmation: 'confirmed'
        });

      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Workshop not found');
    });

    test('should prevent application to cancelled workshop', async () => {
      // Create cancelled workshop
      const workshops = await fs.readJSON(workshopsFile);
      const cancelledWorkshop = {
        ...workshops.workshops[0],
        id: 'cancelled-workshop',
        status: 'cancelled'
      };
      workshops.workshops.push(cancelledWorkshop);
      await fs.writeJSON(workshopsFile, workshops);

      const response = await request(app)
        .post('/api/applications/workshops/cancelled-workshop')
        .set('Authorization', `Bearer ${volunteerToken}`)
        .send({
          message: 'Test message',
          availabilityConfirmation: 'confirmed'
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('cannot accept applications');
    });

    test('should prevent application to full workshop', async () => {
      // Create full workshop
      const workshops = await fs.readJSON(workshopsFile);
      const fullWorkshop = {
        ...workshops.workshops[0],
        id: 'full-workshop',
        maxVolunteers: 1,
        applicationsCount: 1
      };
      workshops.workshops.push(fullWorkshop);
      await fs.writeJSON(workshopsFile, workshops);

      const response = await request(app)
        .post('/api/applications/workshops/full-workshop')
        .set('Authorization', `Bearer ${volunteerToken}`)
        .send({
          message: 'Test message',
          availabilityConfirmation: 'confirmed'
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('workshop is full');
    });
  });

  describe('Application Management (Coordinator)', () => {
    beforeEach(async () => {
      // Create test application for coordinator tests
      const applications = {
        applications: [
          {
            id: 'test-app-id',
            workshopId: testWorkshopId,
            volunteerId: testVolunteerId,
            message: 'Test application message',
            availabilityConfirmation: 'confirmed',
            status: 'pending',
            appliedAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
        ]
      };
      await fs.writeJSON(applicationsFile, applications);
      testApplicationId = 'test-app-id';
    });

    test('should allow coordinator to view workshop applications', async () => {
      const response = await request(app)
        .get(`/api/applications/workshops/${testWorkshopId}`)
        .set('Authorization', `Bearer ${coordinatorToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        applications: expect.arrayContaining([
          expect.objectContaining({
            id: testApplicationId,
            workshopId: testWorkshopId,
            status: 'pending'
          })
        ]),
        total: 1
      });
    });

    test('should allow coordinator to approve application', async () => {
      const response = await request(app)
        .put(`/api/applications/${testApplicationId}/status`)
        .set('Authorization', `Bearer ${coordinatorToken}`)
        .send({
          status: 'approved',
          reviewNotes: 'Great candidate with relevant experience'
        });

      expect(response.status).toBe(200);
      expect(response.body.application).toMatchObject({
        id: testApplicationId,
        status: 'approved',
        reviewNotes: 'Great candidate with relevant experience',
        reviewedBy: testCoordinatorId,
        reviewedAt: expect.any(String)
      });
    });

    test('should allow coordinator to decline application', async () => {
      const response = await request(app)
        .put(`/api/applications/${testApplicationId}/status`)
        .set('Authorization', `Bearer ${coordinatorToken}`)
        .send({
          status: 'declined',
          reviewNotes: 'Unfortunately, we need someone with more experience'
        });

      expect(response.status).toBe(200);
      expect(response.body.application.status).toBe('declined');
    });

    test('should validate status update values', async () => {
      const response = await request(app)
        .put(`/api/applications/${testApplicationId}/status`)
        .set('Authorization', `Bearer ${coordinatorToken}`)
        .send({
          status: 'invalid-status'
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('Invalid status');
    });

    test('should prevent status update to non-existent application', async () => {
      const response = await request(app)
        .put('/api/applications/non-existent-id/status')
        .set('Authorization', `Bearer ${coordinatorToken}`)
        .send({
          status: 'approved'
        });

      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Application not found');
    });

    test('should allow coordinator to view all applications with filters', async () => {
      const response = await request(app)
        .get('/api/applications/coordinator/all')
        .set('Authorization', `Bearer ${coordinatorToken}`)
        .query({ status: 'pending' });

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        applications: expect.any(Array),
        total: expect.any(Number)
      });
    });
  });

  describe('Application History (Volunteer)', () => {
    beforeEach(async () => {
      // Create test applications for volunteer
      const applications = {
        applications: [
          {
            id: 'volunteer-app-1',
            workshopId: testWorkshopId,
            volunteerId: testVolunteerId,
            message: 'First application',
            availabilityConfirmation: 'confirmed',
            status: 'approved',
            appliedAt: '2024-01-01T10:00:00.000Z',
            reviewedAt: '2024-01-02T10:00:00.000Z'
          },
          {
            id: 'volunteer-app-2',
            workshopId: testWorkshopId,
            volunteerId: testVolunteerId,
            message: 'Second application',
            availabilityConfirmation: 'tentative',
            status: 'pending',
            appliedAt: '2024-01-10T10:00:00.000Z'
          }
        ]
      };
      await fs.writeJSON(applicationsFile, applications);
    });

    test('should allow volunteer to view their applications', async () => {
      const response = await request(app)
        .get('/api/applications/volunteer/my-applications')
        .set('Authorization', `Bearer ${volunteerToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        applications: expect.arrayContaining([
          expect.objectContaining({
            volunteerId: testVolunteerId,
            status: 'approved'
          }),
          expect.objectContaining({
            volunteerId: testVolunteerId,
            status: 'pending'
          })
        ]),
        total: 2
      });
    });

    test('should allow filtering applications by status', async () => {
      const response = await request(app)
        .get('/api/applications/volunteer/my-applications')
        .set('Authorization', `Bearer ${volunteerToken}`)
        .query({ status: 'approved' });

      expect(response.status).toBe(200);
      expect(response.body.applications).toHaveLength(1);
      expect(response.body.applications[0].status).toBe('approved');
    });

    test('should allow filtering applications by date range', async () => {
      const response = await request(app)
        .get('/api/applications/volunteer/my-applications')
        .set('Authorization', `Bearer ${volunteerToken}`)
        .query({
          startDate: '2024-01-01',
          endDate: '2024-01-05'
        });

      expect(response.status).toBe(200);
      expect(response.body.applications).toHaveLength(1);
    });
  });

  describe('Application Statistics', () => {
    beforeEach(async () => {
      // Create statistical test data
      const applications = {
        applications: [
          {
            id: 'stat-app-1',
            workshopId: testWorkshopId,
            volunteerId: testVolunteerId,
            status: 'approved',
            appliedAt: '2024-01-01T10:00:00.000Z'
          },
          {
            id: 'stat-app-2',
            workshopId: testWorkshopId,
            volunteerId: testVolunteerId,
            status: 'declined',
            appliedAt: '2024-01-02T10:00:00.000Z'
          },
          {
            id: 'stat-app-3',
            workshopId: testWorkshopId,
            volunteerId: testVolunteerId,
            status: 'pending',
            appliedAt: '2024-01-03T10:00:00.000Z'
          }
        ]
      };
      await fs.writeJSON(applicationsFile, applications);
    });

    test('should provide application statistics for coordinators', async () => {
      const response = await request(app)
        .get('/api/applications/statistics')
        .set('Authorization', `Bearer ${coordinatorToken}`);

      expect(response.status).toBe(200);
      expect(response.body.statistics).toMatchObject({
        total: 3,
        pending: 1,
        approved: 1,
        declined: 1,
        approvalRate: expect.closeTo(33.33, 1)
      });
    });

    test('should provide workshop-specific statistics', async () => {
      const response = await request(app)
        .get(`/api/applications/workshops/${testWorkshopId}/statistics`)
        .set('Authorization', `Bearer ${coordinatorToken}`);

      expect(response.status).toBe(200);
      expect(response.body.statistics).toMatchObject({
        workshopId: testWorkshopId,
        totalApplications: 3,
        pendingApplications: 1,
        approvedApplications: 1
      });
    });
  });

  describe('Authorization', () => {
    test('should prevent unauthorized access to applications', async () => {
      const response = await request(app)
        .get('/api/applications/volunteer/my-applications');

      expect(response.status).toBe(401);
    });

    test('should prevent volunteers from accessing coordinator endpoints', async () => {
      const response = await request(app)
        .get('/api/applications/coordinator/all')
        .set('Authorization', `Bearer ${volunteerToken}`);

      expect(response.status).toBe(403);
    });

    test('should prevent coordinators from accessing other volunteers applications directly', async () => {
      const response = await request(app)
        .get('/api/applications/volunteer/my-applications')
        .set('Authorization', `Bearer ${coordinatorToken}`);

      expect(response.status).toBe(403);
    });

    test('should prevent volunteers from updating application status', async () => {
      const response = await request(app)
        .put(`/api/applications/${testApplicationId}/status`)
        .set('Authorization', `Bearer ${volunteerToken}`)
        .send({ status: 'approved' });

      expect(response.status).toBe(403);
    });
  });

  describe('Notification System (Basic Email)', () => {
    test('should track notification events for application status changes', async () => {
      // Create application first
      await request(app)
        .post(`/api/applications/workshops/${testWorkshopId}`)
        .set('Authorization', `Bearer ${volunteerToken}`)
        .send({
          message: 'Test application',
          availabilityConfirmation: 'confirmed'
        });

      // Get the created application
      const applications = await fs.readJSON(applicationsFile);
      const applicationId = applications.applications[0].id;

      // Update status (should trigger notification tracking)
      const response = await request(app)
        .put(`/api/applications/${applicationId}/status`)
        .set('Authorization', `Bearer ${coordinatorToken}`)
        .send({
          status: 'approved',
          reviewNotes: 'Test approval'
        });

      expect(response.status).toBe(200);
      expect(response.body.notification).toMatchObject({
        sent: false, // Email system not implemented yet
        type: 'application_approved',
        recipient: testVolunteerId,
        scheduled: true
      });
    });

    test('should track application submission notifications', async () => {
      const response = await request(app)
        .post(`/api/applications/workshops/${testWorkshopId}`)
        .set('Authorization', `Bearer ${volunteerToken}`)
        .send({
          message: 'Test application with notification',
          availabilityConfirmation: 'confirmed'
        });

      expect(response.status).toBe(201);
      expect(response.body.notification).toMatchObject({
        type: 'application_submitted',
        scheduled: true
      });
    });
  });
}); 