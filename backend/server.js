const { createApp } = require('./app');
const path = require('path');

// Load environment variables if .env file exists
const envPath = path.join(__dirname, '../.env');
try {
  require('dotenv').config({ path: envPath });
} catch (error) {
  // .env file doesn't exist, continue without it
}

// Create Express app
const app = createApp();

// Set port from environment or default to 3000
const PORT = process.env.PORT || 3000;

// Start server
const server = app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`📁 Data directory: ${path.join(__dirname, '../data')}`);
  console.log(`🔧 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🏥 Health check: http://localhost:${PORT}/api/health`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('👋 SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('💤 Process terminated');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('👋 SIGINT received, shutting down gracefully');
  server.close(() => {
    console.log('💤 Process terminated');
    process.exit(0);
  });
});

module.exports = { app, server }; 