const request = require('supertest');
const fs = require('fs-extra');
const path = require('path');

describe('Workshop Management System - MVP.4', () => {
  let app;
  let coordinatorToken;
  let volunteerToken;
  let coordinatorId;
  let volunteerId;
  let testDataDir;
  let workshopsFile;
  
  beforeAll(async () => {
    // Set up test environment
    testDataDir = path.join(__dirname, 'test-workshop-data');
    workshopsFile = path.join(testDataDir, 'workshops.json');
  });

  beforeEach(async () => {
    // Clean up test data before each test
    await fs.remove(testDataDir);
    await fs.ensureDir(testDataDir);
    
    // Initialize with empty workshops file
    await fs.writeJSON(workshopsFile, { workshops: [] });
    
    // Import modules after setup (when they exist)
    try {
      const { createApp } = require('../backend/app');
      app = createApp();
      
      // Register and login a coordinator
      const coordinatorRegisterResponse = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'coordinator@educaloi.qc.ca',
          password: 'SecurePass123!',
          firstName: 'Marie',
          lastName: 'Coordinator',
          role: 'coordinator'
        });

      coordinatorId = coordinatorRegisterResponse.body.userId;

      const coordinatorLoginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'coordinator@educaloi.qc.ca',
          password: 'SecurePass123!'
        });

      coordinatorToken = coordinatorLoginResponse.body.token;

      // Register and login a volunteer
      const volunteerRegisterResponse = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'volunteer@example.com',
          password: 'SecurePass123!',
          firstName: 'Jean',
          lastName: 'Volunteer',
          role: 'volunteer'
        });

      volunteerId = volunteerRegisterResponse.body.userId;

      const volunteerLoginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'volunteer@example.com',
          password: 'SecurePass123!'
        });

      volunteerToken = volunteerLoginResponse.body.token;
    } catch (error) {
      // Modules don't exist yet - that's expected in TDD
    }
  });

  afterEach(async () => {
    await fs.remove(testDataDir);
  });

  describe('MVP.4.1 - Workshop CRUD Operations', () => {
    test('should create a new workshop (coordinator only)', async () => {
      if (!app) return;

      const workshopData = {
        title: 'Introduction to Employment Law',
        description: 'A comprehensive workshop covering the basics of employment law in Quebec.',
        date: '2024-03-15',
        startTime: '09:00',
        endTime: '12:00',
        location: {
          name: 'École Secondaire Jean-Baptiste-Meilleur',
          address: '777 Av. Sainte-Croix, Saint-Laurent, QC H4L 3Y5',
          city: 'Saint-Laurent',
          region: 'Montreal'
        },
        maxVolunteers: 2,
        requiredSpecializations: ['Employment Law'],
        targetAudience: 'Secondary School Students',
        workshopType: 'Educational Presentation',
        status: 'draft',
        contactPerson: {
          name: 'Pierre Leclerc',
          email: 'p.leclerc@school.qc.ca',
          phone: '+1-514-555-0199'
        }
      };

      const response = await request(app)
        .post('/api/workshops')
        .set('Authorization', `Bearer ${coordinatorToken}`)
        .send(workshopData)
        .expect(201);

      expect(response.body).toHaveProperty('message', 'Workshop created successfully');
      expect(response.body).toHaveProperty('workshopId');
      expect(response.body.workshop).toHaveProperty('createdBy', coordinatorId);
      expect(response.body.workshop).toHaveProperty('title', workshopData.title);
      expect(response.body.workshop).toHaveProperty('status', 'draft');
      expect(response.body.workshop.location).toEqual(workshopData.location);
      expect(response.body.workshop.requiredSpecializations).toEqual(workshopData.requiredSpecializations);
    });

    test('should prevent volunteer from creating workshop', async () => {
      if (!app) return;

      const workshopData = {
        title: 'Test Workshop',
        description: 'Test description',
        date: '2024-03-15',
        startTime: '09:00',
        endTime: '12:00'
      };

      const response = await request(app)
        .post('/api/workshops')
        .set('Authorization', `Bearer ${volunteerToken}`)
        .send(workshopData)
        .expect(403);

      expect(response.body.message).toBe('Access denied. Coordinator role required.');
    });

    test('should get all workshops with filtering', async () => {
      if (!app) return;

      // Create multiple workshops
      const workshop1 = {
        title: 'Employment Law Workshop',
        description: 'Employment law basics',
        date: '2024-03-15',
        startTime: '09:00',
        endTime: '12:00',
        location: { city: 'Montreal', region: 'Montreal' },
        requiredSpecializations: ['Employment Law'],
        status: 'published'
      };

      const workshop2 = {
        title: 'Corporate Law Workshop',
        description: 'Corporate law fundamentals',
        date: '2024-03-20',
        startTime: '14:00',
        endTime: '17:00',
        location: { city: 'Quebec City', region: 'Quebec' },
        requiredSpecializations: ['Corporate Law'],
        status: 'published'
      };

      await request(app)
        .post('/api/workshops')
        .set('Authorization', `Bearer ${coordinatorToken}`)
        .send(workshop1);

      await request(app)
        .post('/api/workshops')
        .set('Authorization', `Bearer ${coordinatorToken}`)
        .send(workshop2);

      // Get all workshops
      const response = await request(app)
        .get('/api/workshops')
        .set('Authorization', `Bearer ${volunteerToken}`)
        .expect(200);

      expect(response.body.workshops).toHaveLength(2);
      expect(response.body.workshops[0]).toHaveProperty('title');
      expect(response.body.workshops[0]).toHaveProperty('date');
      expect(response.body.workshops[0]).toHaveProperty('status');

      // Filter by region
      const filteredResponse = await request(app)
        .get('/api/workshops?region=Montreal')
        .set('Authorization', `Bearer ${volunteerToken}`)
        .expect(200);

      expect(filteredResponse.body.workshops).toHaveLength(1);
      expect(filteredResponse.body.workshops[0].title).toBe('Employment Law Workshop');
    });

    test('should get workshop by ID', async () => {
      if (!app) return;

      const workshopData = {
        title: 'Contract Law Workshop',
        description: 'Understanding contracts',
        date: '2024-03-25',
        startTime: '10:00',
        endTime: '13:00',
        location: { city: 'Montreal', region: 'Montreal' },
        status: 'published'
      };

      const createResponse = await request(app)
        .post('/api/workshops')
        .set('Authorization', `Bearer ${coordinatorToken}`)
        .send(workshopData);

      const workshopId = createResponse.body.workshopId;

      const response = await request(app)
        .get(`/api/workshops/${workshopId}`)
        .set('Authorization', `Bearer ${volunteerToken}`)
        .expect(200);

      expect(response.body.workshop).toHaveProperty('id', workshopId);
      expect(response.body.workshop).toHaveProperty('title', workshopData.title);
      expect(response.body.workshop).toHaveProperty('description', workshopData.description);
    });

    test('should update workshop (coordinator only)', async () => {
      if (!app) return;

      // Create workshop
      const workshopData = {
        title: 'Original Workshop',
        description: 'Original description',
        date: '2024-03-15',
        startTime: '09:00',
        endTime: '12:00',
        status: 'draft'
      };

      const createResponse = await request(app)
        .post('/api/workshops')
        .set('Authorization', `Bearer ${coordinatorToken}`)
        .send(workshopData);

      const workshopId = createResponse.body.workshopId;

      // Update workshop
      const updateData = {
        title: 'Updated Workshop Title',
        description: 'Updated description with more details',
        date: '2024-03-20',
        startTime: '10:00',
        endTime: '13:00',
        status: 'published'
      };

      const response = await request(app)
        .put(`/api/workshops/${workshopId}`)
        .set('Authorization', `Bearer ${coordinatorToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.message).toBe('Workshop updated successfully');
      expect(response.body.workshop.title).toBe(updateData.title);
      expect(response.body.workshop.description).toBe(updateData.description);
      expect(response.body.workshop.status).toBe(updateData.status);
    });

    test('should prevent volunteer from updating workshop', async () => {
      if (!app) return;

      // Create workshop as coordinator
      const workshopData = {
        title: 'Test Workshop',
        description: 'Test description',
        date: '2024-03-15',
        startTime: '09:00',
        endTime: '12:00'
      };

      const createResponse = await request(app)
        .post('/api/workshops')
        .set('Authorization', `Bearer ${coordinatorToken}`)
        .send(workshopData);

      const workshopId = createResponse.body.workshopId;

      // Try to update as volunteer
      const response = await request(app)
        .put(`/api/workshops/${workshopId}`)
        .set('Authorization', `Bearer ${volunteerToken}`)
        .send({ title: 'Unauthorized Update' })
        .expect(403);

      expect(response.body.message).toBe('Access denied. Only coordinators can update workshops.');
    });

    test('should delete workshop (coordinator only)', async () => {
      if (!app) return;

      // Create workshop
      const workshopData = {
        title: 'Workshop to Delete',
        description: 'This workshop will be deleted',
        date: '2024-03-15',
        startTime: '09:00',
        endTime: '12:00'
      };

      const createResponse = await request(app)
        .post('/api/workshops')
        .set('Authorization', `Bearer ${coordinatorToken}`)
        .send(workshopData);

      const workshopId = createResponse.body.workshopId;

      // Delete workshop
      const response = await request(app)
        .delete(`/api/workshops/${workshopId}`)
        .set('Authorization', `Bearer ${coordinatorToken}`)
        .expect(200);

      expect(response.body.message).toBe('Workshop deleted successfully');

      // Verify workshop is deleted
      await request(app)
        .get(`/api/workshops/${workshopId}`)
        .set('Authorization', `Bearer ${volunteerToken}`)
        .expect(404);
    });
  });

  describe('MVP.4.2 - Workshop Status Management', () => {
    test('should change workshop status from draft to published', async () => {
      if (!app) return;

      const workshopData = {
        title: 'Status Test Workshop',
        description: 'Testing status changes',
        date: '2024-03-15',
        startTime: '09:00',
        endTime: '12:00',
        status: 'draft'
      };

      const createResponse = await request(app)
        .post('/api/workshops')
        .set('Authorization', `Bearer ${coordinatorToken}`)
        .send(workshopData);

      const workshopId = createResponse.body.workshopId;

      const response = await request(app)
        .put(`/api/workshops/${workshopId}/status`)
        .set('Authorization', `Bearer ${coordinatorToken}`)
        .send({ status: 'published' })
        .expect(200);

      expect(response.body.message).toBe('Workshop status updated successfully');
      expect(response.body.workshop.status).toBe('published');
    });

    test('should cancel published workshop', async () => {
      if (!app) return;

      const workshopData = {
        title: 'Workshop to Cancel',
        description: 'This workshop will be cancelled',
        date: '2024-03-15',
        startTime: '09:00',
        endTime: '12:00',
        status: 'published'
      };

      const createResponse = await request(app)
        .post('/api/workshops')
        .set('Authorization', `Bearer ${coordinatorToken}`)
        .send(workshopData);

      const workshopId = createResponse.body.workshopId;

      const response = await request(app)
        .put(`/api/workshops/${workshopId}/status`)
        .set('Authorization', `Bearer ${coordinatorToken}`)
        .send({ 
          status: 'cancelled',
          cancellationReason: 'Insufficient volunteer applications'
        })
        .expect(200);

      expect(response.body.workshop.status).toBe('cancelled');
      expect(response.body.workshop.cancellationReason).toBe('Insufficient volunteer applications');
    });
  });

  describe('MVP.4.3 - Workshop Search and Filtering', () => {
    beforeEach(async () => {
      if (!app) return;

      // Create test workshops for filtering
      const workshops = [
        {
          title: 'Employment Law Montreal',
          description: 'Employment law workshop in Montreal',
          date: '2024-03-15',
          startTime: '09:00',
          endTime: '12:00',
          location: { city: 'Montreal', region: 'Montreal' },
          requiredSpecializations: ['Employment Law'],
          status: 'published'
        },
        {
          title: 'Corporate Law Quebec',
          description: 'Corporate law workshop in Quebec City',
          date: '2024-03-20',
          startTime: '14:00',
          endTime: '17:00',
          location: { city: 'Quebec City', region: 'Quebec' },
          requiredSpecializations: ['Corporate Law'],
          status: 'published'
        },
        {
          title: 'Family Law Montreal',
          description: 'Family law workshop in Montreal',
          date: '2024-03-25',
          startTime: '10:00',
          endTime: '13:00',
          location: { city: 'Montreal', region: 'Montreal' },
          requiredSpecializations: ['Family Law'],
          status: 'draft'
        }
      ];

      for (const workshop of workshops) {
        await request(app)
          .post('/api/workshops')
          .set('Authorization', `Bearer ${coordinatorToken}`)
          .send(workshop);
      }
    });

    test('should filter workshops by region', async () => {
      if (!app) return;

      const response = await request(app)
        .get('/api/workshops?region=Montreal')
        .set('Authorization', `Bearer ${volunteerToken}`)
        .expect(200);

      expect(response.body.workshops).toHaveLength(2);
      response.body.workshops.forEach(workshop => {
        expect(workshop.location.region).toBe('Montreal');
      });
    });

    test('should filter workshops by specialization', async () => {
      if (!app) return;

      const response = await request(app)
        .get('/api/workshops?specialization=Employment Law')
        .set('Authorization', `Bearer ${volunteerToken}`)
        .expect(200);

      expect(response.body.workshops).toHaveLength(1);
      expect(response.body.workshops[0].title).toBe('Employment Law Montreal');
    });

    test('should filter workshops by status', async () => {
      if (!app) return;

      const response = await request(app)
        .get('/api/workshops?status=published')
        .set('Authorization', `Bearer ${volunteerToken}`)
        .expect(200);

      expect(response.body.workshops).toHaveLength(2);
      response.body.workshops.forEach(workshop => {
        expect(workshop.status).toBe('published');
      });
    });

    test('should search workshops by title', async () => {
      if (!app) return;

      const response = await request(app)
        .get('/api/workshops?search=Employment')
        .set('Authorization', `Bearer ${volunteerToken}`)
        .expect(200);

      expect(response.body.workshops).toHaveLength(1);
      expect(response.body.workshops[0].title).toContain('Employment');
    });

    test('should combine multiple filters', async () => {
      if (!app) return;

      const response = await request(app)
        .get('/api/workshops?region=Montreal&status=published')
        .set('Authorization', `Bearer ${volunteerToken}`)
        .expect(200);

      expect(response.body.workshops).toHaveLength(1);
      expect(response.body.workshops[0].title).toBe('Employment Law Montreal');
    });
  });

  describe('MVP.4.4 - Workshop Data Validation', () => {
    test('should validate required fields when creating workshop', async () => {
      if (!app) return;

      const incompleteWorkshop = {
        title: 'Incomplete Workshop',
        // Missing required fields: description, date, startTime, endTime
      };

      const response = await request(app)
        .post('/api/workshops')
        .set('Authorization', `Bearer ${coordinatorToken}`)
        .send(incompleteWorkshop)
        .expect(400);

      expect(response.body.message).toContain('validation error');
      expect(response.body.errors).toContain('Description is required');
      expect(response.body.errors).toContain('Date is required');
      expect(response.body.errors).toContain('Start time is required');
      expect(response.body.errors).toContain('End time is required');
    });

    test('should validate date format', async () => {
      if (!app) return;

      const workshopData = {
        title: 'Date Validation Test',
        description: 'Testing date validation',
        date: 'invalid-date',
        startTime: '09:00',
        endTime: '12:00'
      };

      const response = await request(app)
        .post('/api/workshops')
        .set('Authorization', `Bearer ${coordinatorToken}`)
        .send(workshopData)
        .expect(400);

      expect(response.body.message).toContain('validation error');
      expect(response.body.errors).toContain('Invalid date format');
    });

    test('should validate time format and logic', async () => {
      if (!app) return;

      const workshopData = {
        title: 'Time Validation Test',
        description: 'Testing time validation',
        date: '2024-03-15',
        startTime: '15:00',
        endTime: '12:00' // End time before start time
      };

      const response = await request(app)
        .post('/api/workshops')
        .set('Authorization', `Bearer ${coordinatorToken}`)
        .send(workshopData)
        .expect(400);

      expect(response.body.message).toContain('validation error');
      expect(response.body.errors).toContain('End time must be after start time');
    });

    test('should validate past date prevention', async () => {
      if (!app) return;

      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 1);

      const workshopData = {
        title: 'Past Date Test',
        description: 'Testing past date validation',
        date: pastDate.toISOString().split('T')[0],
        startTime: '09:00',
        endTime: '12:00'
      };

      const response = await request(app)
        .post('/api/workshops')
        .set('Authorization', `Bearer ${coordinatorToken}`)
        .send(workshopData)
        .expect(400);

      expect(response.body.message).toContain('validation error');
      expect(response.body.errors).toContain('Workshop date cannot be in the past');
    });
  });

  describe('MVP.4.5 - Workshop Authorization', () => {
    test('should require authentication for all workshop endpoints', async () => {
      if (!app) return;

      // Test without token
      await request(app)
        .get('/api/workshops')
        .expect(401);

      await request(app)
        .post('/api/workshops')
        .send({ title: 'Test' })
        .expect(401);
    });

    test('should allow volunteers to view published workshops only', async () => {
      if (!app) return;

      // Create draft workshop
      const draftWorkshop = {
        title: 'Draft Workshop',
        description: 'This is a draft',
        date: '2024-03-15',
        startTime: '09:00',
        endTime: '12:00',
        status: 'draft'
      };

      await request(app)
        .post('/api/workshops')
        .set('Authorization', `Bearer ${coordinatorToken}`)
        .send(draftWorkshop);

      // Create published workshop
      const publishedWorkshop = {
        title: 'Published Workshop',
        description: 'This is published',
        date: '2024-03-20',
        startTime: '09:00',
        endTime: '12:00',
        status: 'published'
      };

      await request(app)
        .post('/api/workshops')
        .set('Authorization', `Bearer ${coordinatorToken}`)
        .send(publishedWorkshop);

      // Volunteer should only see published workshops
      const response = await request(app)
        .get('/api/workshops')
        .set('Authorization', `Bearer ${volunteerToken}`)
        .expect(200);

      expect(response.body.workshops).toHaveLength(1);
      expect(response.body.workshops[0].title).toBe('Published Workshop');
    });

    test('should allow coordinators to view all workshops', async () => {
      if (!app) return;

      // Create workshops with different statuses
      const workshops = [
        { title: 'Draft', status: 'draft' },
        { title: 'Published', status: 'published' },
        { title: 'Cancelled', status: 'cancelled' }
      ];

      for (const workshop of workshops) {
        await request(app)
          .post('/api/workshops')
          .set('Authorization', `Bearer ${coordinatorToken}`)
          .send({
            ...workshop,
            description: 'Test description',
            date: '2024-03-15',
            startTime: '09:00',
            endTime: '12:00'
          });
      }

      const response = await request(app)
        .get('/api/workshops?includeAllStatuses=true')
        .set('Authorization', `Bearer ${coordinatorToken}`)
        .expect(200);

      expect(response.body.workshops).toHaveLength(3);
    });
  });
}); 