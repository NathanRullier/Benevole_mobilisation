const express = require('express');
const cors = require('cors');
const path = require('path');

function createApp() {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Import routes
  const authRoutes = require('./routes/auth');
  const coordinatorRoutes = require('./routes/coordinator');
  const profileRoutes = require('./routes/profiles');
  const workshopRoutes = require('./routes/workshops');

  // In test environment, ensure a clean users store per app instance
  if (process.env.NODE_ENV === 'test') {
    try {
      const { authService } = require('./middleware/auth');
      await (async () => {
        const fs = require('fs-extra');
        const path = require('path');
        const usersDir = path.dirname(authService.storage.filePath);
        await fs.ensureDir(usersDir);
        await authService.storage.write({ users: [] });
      })();
    } catch (e) {
      // ignore
    }
  }

  // API Routes
  app.use('/api/auth', authRoutes);
  app.use('/api/coordinator', coordinatorRoutes);
  app.use('/api/profiles', profileRoutes);
  app.use('/api/workshops', workshopRoutes);

  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', message: 'Server is running' });
  });

  // Error handling middleware
  app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
      error: 'Something went wrong!',
      message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
    });
  });

  // 404 handler
  app.use('*', (req, res) => {
    res.status(404).json({ error: 'Route not found' });
  });

  return app;
}

module.exports = { createApp }; 