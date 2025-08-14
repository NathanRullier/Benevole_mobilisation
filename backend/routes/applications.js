const express = require('express');
const path = require('path');
const fs = require('fs-extra');
const { authenticateToken, requireRole } = require('../middleware/auth');
const JsonStorage = require('../utils/jsonStorage');

const router = express.Router();

const dataDir = path.join(__dirname, '../../data');
const applicationsFile = path.join(dataDir, 'applications.json');
const workshopsFile = path.join(dataDir, 'workshops.json');

const applicationsStorage = new JsonStorage(applicationsFile);
const workshopsStorage = new JsonStorage(workshopsFile);

async function ensureFiles() {
	await fs.ensureDir(dataDir);
	if (!await fs.pathExists(applicationsFile)) {
		await applicationsStorage.write({ applications: [] });
	}
	if (!await fs.pathExists(workshopsFile)) {
		await workshopsStorage.write({ workshops: [] });
	}
}

function validateApplicationBody(body) {
	const errors = [];
	if (!body.message) errors.push('Message is required');
	if (!body.availabilityConfirmation) errors.push('Availability confirmation is required');
	if (body.availabilityConfirmation && !['confirmed', 'tentative'].includes(body.availabilityConfirmation)) {
		errors.push('Invalid availability confirmation');
	}
	return errors;
}

// POST /api/applications/workshops/:workshopId - volunteer applies
router.post('/workshops/:workshopId', authenticateToken, async (req, res) => {
	try {
		await ensureFiles();
		const { workshopId } = req.params;
		const volunteerId = req.user.id;

		const errors = validateApplicationBody(req.body);
		if (errors.length) {
			return res.status(400).json({ message: 'validation error', errors });
		}

		const workshopsData = await workshopsStorage.read();
		const workshop = (workshopsData.workshops || []).find(w => w.id === workshopId);
		if (!workshop) {
			return res.status(404).json({ message: 'Workshop not found' });
		}
		if (workshop.status === 'cancelled') {
			return res.status(400).json({ message: 'Workshop cannot accept applications' });
		}
		if (typeof workshop.maxVolunteers === 'number' && typeof workshop.applicationsCount === 'number' && workshop.applicationsCount >= workshop.maxVolunteers) {
			return res.status(400).json({ message: 'This workshop is full' });
		}

		const appsData = await applicationsStorage.read();
		appsData.applications = appsData.applications || [];
		const hasDuplicate = appsData.applications.some(a => a.workshopId === workshopId && a.volunteerId === volunteerId);
		if (hasDuplicate) {
			return res.status(409).json({ message: 'You have already applied to this workshop' });
		}

		const application = {
			workshopId,
			volunteerId,
			message: req.body.message,
			availabilityConfirmation: req.body.availabilityConfirmation,
			additionalNotes: req.body.additionalNotes || '',
			status: 'pending',
			appliedAt: new Date().toISOString()
		};
		const saved = await applicationsStorage.addRecord('applications', application);

		// Update workshop counts in place if present
		if (typeof workshop.applicationsCount === 'number') {
			const updatedCount = workshop.applicationsCount + 1;
			await workshopsStorage.updateRecord('workshops', workshop.id, { applicationsCount: updatedCount });
		}

		return res.status(201).json({
			message: 'Application submitted successfully',
			applicationId: saved.id,
			application: saved,
			notification: { sent: false, type: 'application_submitted', recipient: volunteerId, scheduled: true }
		});
	} catch (error) {
		return res.status(500).json({ message: 'Internal server error', error: error.message });
	}
});

// GET /api/applications/workshops/:workshopId - list applications for a workshop (coordinator)
router.get('/workshops/:workshopId', authenticateToken, requireRole('coordinator'), async (req, res) => {
	try {
		await ensureFiles();
		const { workshopId } = req.params;
		const apps = (await applicationsStorage.read()).applications || [];
		const list = apps.filter(a => a.workshopId === workshopId);
		return res.json({ applications: list, total: list.length });
	} catch (error) {
		return res.status(500).json({ message: 'Internal server error', error: error.message });
	}
});

// PUT /api/applications/:applicationId/status - update status (coordinator)
router.put('/:applicationId/status', authenticateToken, requireRole('coordinator'), async (req, res) => {
	try {
		await ensureFiles();
		const { applicationId } = req.params;
		const { status, reviewNotes } = req.body;
		if (!['approved', 'declined', 'pending'].includes(status)) {
			return res.status(400).json({ message: 'Invalid status' });
		}
		const appsData = await applicationsStorage.read();
		appsData.applications = appsData.applications || [];
		const app = appsData.applications.find(a => a.id === applicationId);
		if (!app) {
			return res.status(404).json({ message: 'Application not found' });
		}
		const updated = await applicationsStorage.updateRecord('applications', applicationId, {
			status,
			reviewNotes,
			reviewedBy: req.user.id,
			reviewedAt: new Date().toISOString()
		});
		return res.json({ application: updated, notification: { sent: false, type: `application_${status}`, recipient: updated.volunteerId, scheduled: true } });
	} catch (error) {
		return res.status(500).json({ message: 'Internal server error', error: error.message });
	}
});

// GET /api/applications/coordinator/all - list all with filters (coordinator)
router.get('/coordinator/all', authenticateToken, requireRole('coordinator'), async (req, res) => {
	try {
		await ensureFiles();
		const { status } = req.query;
		const apps = (await applicationsStorage.read()).applications || [];
		const filtered = status ? apps.filter(a => a.status === status) : apps;
		return res.json({ applications: filtered, total: filtered.length });
	} catch (error) {
		return res.status(500).json({ message: 'Internal server error', error: error.message });
	}
});

// GET /api/applications/volunteer/my-applications - volunteer's own apps
router.get('/volunteer/my-applications', authenticateToken, async (req, res) => {
	try {
		if (req.user.role !== 'volunteer') {
			return res.status(403).json({ message: 'Forbidden' });
		}
		await ensureFiles();
		const { status, startDate, endDate } = req.query;
		const apps = (await applicationsStorage.read()).applications || [];
		let mine = apps.filter(a => a.volunteerId === req.user.id);
		if (status) {
			mine = mine.filter(a => a.status === status);
		}
		if (startDate || endDate) {
			const start = startDate ? new Date(startDate) : null;
			const end = endDate ? new Date(endDate) : null;
			mine = mine.filter(a => {
				const applied = new Date(a.appliedAt);
				if (start && applied < start) return false;
				if (end && applied > end) return false;
				return true;
			});
		}
		return res.json({ applications: mine, total: mine.length });
	} catch (error) {
		return res.status(500).json({ message: 'Internal server error', error: error.message });
	}
});

// GET /api/applications/statistics - coordinator stats
router.get('/statistics', authenticateToken, requireRole('coordinator'), async (req, res) => {
	try {
		await ensureFiles();
		const apps = (await applicationsStorage.read()).applications || [];
		const total = apps.length;
		const pending = apps.filter(a => a.status === 'pending').length;
		const approved = apps.filter(a => a.status === 'approved').length;
		const declined = apps.filter(a => a.status === 'declined').length;
		const approvalRate = total ? (approved / total) * 100 : 0;
		return res.json({ statistics: { total, pending, approved, declined, approvalRate: Math.round(approvalRate * 100) / 100 } });
	} catch (error) {
		return res.status(500).json({ message: 'Internal server error', error: error.message });
	}
});

// GET /api/applications/workshops/:workshopId/statistics - workshop-specific stats
router.get('/workshops/:workshopId/statistics', authenticateToken, requireRole('coordinator'), async (req, res) => {
	try {
		await ensureFiles();
		const { workshopId } = req.params;
		const apps = (await applicationsStorage.read()).applications || [];
		const list = apps.filter(a => a.workshopId === workshopId);
		const totalApplications = list.length;
		const pendingApplications = list.filter(a => a.status === 'pending').length;
		const approvedApplications = list.filter(a => a.status === 'approved').length;
		return res.json({ statistics: { workshopId, totalApplications, pendingApplications, approvedApplications } });
	} catch (error) {
		return res.status(500).json({ message: 'Internal server error', error: error.message });
	}
});

module.exports = router; 