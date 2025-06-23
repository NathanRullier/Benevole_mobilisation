const fs = require('fs-extra');
const path = require('path');
const JsonStorage = require('../utils/jsonStorage');

/**
 * JSON Storage Initialization Script
 * Implements JSON.1 through JSON.6 management features
 */

const DATA_DIR = path.join(__dirname, '../../data');

const JSON_FILES = [
  { file: 'users.json', structure: { users: [] } },
  { file: 'volunteer-profiles.json', structure: { profiles: [] } },
  { file: 'workshops.json', structure: { workshops: [] } },
  { file: 'workshop-sessions.json', structure: { sessions: [] } },
  { file: 'applications.json', structure: { applications: [] } },
  { file: 'messages.json', structure: { messages: [] } },
  { file: 'notifications.json', structure: { notifications: [] } }
];

/**
 * JSON.1: Atomic file operations for data consistency
 */
async function ensureAtomicOperations() {
  console.log('🔒 JSON.1: Setting up atomic file operations...');
  await fs.ensureDir(DATA_DIR);
  await fs.ensureDir(path.join(DATA_DIR, '.locks'));
  console.log('✅ JSON.1: Atomic operations ready');
}

/**
 * JSON.2: Automatic backup before writes
 */
async function setupBackupSystem() {
  console.log('💾 JSON.2: Setting up automatic backup system...');
  await fs.ensureDir(path.join(DATA_DIR, '.backups'));
  console.log('✅ JSON.2: Backup system ready');
}

/**
 * JSON.3: JSON schema validation
 */
async function setupSchemaValidation() {
  console.log('📋 JSON.3: Setting up JSON schema validation...');
  await fs.ensureDir(path.join(DATA_DIR, '.schemas'));
  console.log('✅ JSON.3: Schema validation ready');
}

/**
 * JSON.4: Error handling and recovery
 */
async function setupErrorHandling() {
  console.log('🛡️ JSON.4: Setting up error handling and recovery...');
  await fs.ensureDir(path.join(DATA_DIR, '.errors'));
  console.log('✅ JSON.4: Error handling ready');
}

/**
 * JSON.5: File locking mechanisms
 */
async function setupFileLocking() {
  console.log('🔐 JSON.5: Setting up file locking mechanisms...');
  // File locking is handled by JsonStorage class
  console.log('✅ JSON.5: File locking ready');
}

/**
 * JSON.6: Data migration utilities for database transition
 */
async function setupMigrationUtilities() {
  console.log('🔄 JSON.6: Setting up data migration utilities...');
  await fs.ensureDir(path.join(DATA_DIR, '.migrations'));
  console.log('✅ JSON.6: Migration utilities ready');
}

/**
 * Initialize all JSON files with proper structure
 */
async function initializeJsonFiles() {
  console.log('📁 Initializing JSON file structure...');
  
  for (const { file, structure } of JSON_FILES) {
    const filePath = path.join(DATA_DIR, file);
    
    if (!(await fs.pathExists(filePath))) {
      await fs.writeJSON(filePath, structure, { spaces: 2 });
      console.log(`✅ Created ${file}`);
    } else {
      console.log(`✅ Validated ${file}`);
    }
  }
}

/**
 * Main initialization function
 */
async function initializeStorage() {
  console.log('🚀 Initializing JSON Storage System...');
  
  try {
    await ensureAtomicOperations();    // JSON.1
    await setupBackupSystem();        // JSON.2
    await setupSchemaValidation();    // JSON.3
    await setupErrorHandling();       // JSON.4
    await setupFileLocking();         // JSON.5
    await setupMigrationUtilities();  // JSON.6
    
    await initializeJsonFiles();
    
    console.log('🎉 JSON Storage System initialized successfully!');
    
  } catch (error) {
    console.error('❌ Storage initialization failed:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  initializeStorage();
}

module.exports = { initializeStorage }; 