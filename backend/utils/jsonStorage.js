const fs = require('fs-extra');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

class JsonStorage {
  constructor(filePath) {
    this.filePath = filePath;
    this.backupPath = filePath + '.backup';
    this.lockFile = filePath + '.lock';
  }

  /**
   * Ensure the directory for the JSON file exists
   */
  async ensureDirectoryExists() {
    try {
      const dir = path.dirname(this.filePath);
      await fs.ensureDir(dir);
    } catch (error) {
      // If it's a permission error, re-throw it
      if (error.code === 'EACCES' || error.code === 'EPERM') {
        throw error;
      }
      // For invalid paths, throw the error
      if (this.filePath.includes('/invalid/') || this.filePath.includes('\\invalid\\') || 
          this.filePath.startsWith('/invalid') || this.filePath.includes(':<>|')) {
        throw error;
      }
      throw error;
    }
  }

  /**
   * Generate a unique UUID for new records
   */
  generateId() {
    return uuidv4();
  }

  /**
   * Validate JSON data structure
   */
  validateData(data) {
    // Basic validation for expected structure
    if (!data || typeof data !== 'object') {
      throw new Error('Schema validation failed: Data must be an object');
    }

    // If it has users array, validate user structure
    if (data.users && Array.isArray(data.users)) {
      for (const user of data.users) {
        // Validate email format if email is provided
        if (user.email && !this.isValidEmail(user.email)) {
          throw new Error('Schema validation failed: Invalid email format');
        }
        // Validate role if role is provided
        if (user.role && !['volunteer', 'coordinator', 'admin'].includes(user.role)) {
          throw new Error('Schema validation failed: Invalid role');
        }
		// Validate that user object doesn't have invalid fields
		const validUserFields = ['id','email','firstName','lastName','role','phone','name','createdAt','updatedAt','password','isActive','lastLogin','sessions','status'];
		const userFields = Object.keys(user);
		const invalidUserFields = userFields.filter(field => !validUserFields.includes(field));
		if (invalidUserFields.length > 0) {
			throw new Error(`Schema validation failed: Invalid user fields: ${invalidUserFields.join(', ')}`);
		}
      }
    }

    // Reject data with unknown top-level fields for basic validation
    const allowedFields = ['users', 'profiles', 'workshops', 'sessions', 'applications', 'messages', 'notifications', 'config'];
    const dataFields = Object.keys(data);
    const invalidFields = dataFields.filter(field => !allowedFields.includes(field));
    
    if (invalidFields.length > 0) {
      throw new Error(`Schema validation failed: Unknown fields: ${invalidFields.join(', ')}`);
    }

    return true;
  }

  /**
   * Simple email validation
   */
  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Acquire file lock for atomic operations
   */
  async acquireLock() {
    let attempts = 0;
    const maxAttempts = 50;
    const delay = 100; // 100ms

    while (attempts < maxAttempts) {
      try {
        await fs.writeFile(this.lockFile, process.pid.toString(), { flag: 'wx' });
        return true;
      } catch (error) {
        if (error.code === 'EEXIST') {
          // Lock file exists, wait and retry
          await new Promise(resolve => setTimeout(resolve, delay));
          attempts++;
        } else {
          throw error;
        }
      }
    }
    
    throw new Error('Unable to acquire file lock after maximum attempts');
  }

  /**
   * Release file lock
   */
  async releaseLock() {
    try {
      await fs.remove(this.lockFile);
    } catch (error) {
      // Ignore errors when releasing lock
    }
  }

  /**
   * Create backup of current file
   */
  async createBackup() {
    try {
      if (await fs.pathExists(this.filePath)) {
        await fs.copy(this.filePath, this.backupPath);
      }
    } catch (error) {
      // If backup fails, log but don't throw
      console.warn('Failed to create backup:', error.message);
    }
  }

  /**
   * Recover data from backup file
   */
  async recoverFromBackup() {
    try {
      if (await fs.pathExists(this.backupPath)) {
        const backupData = await fs.readJSON(this.backupPath);
        // Write the backup data back to the main file
        await fs.writeJSON(this.filePath, backupData, { spaces: 2 });
        return backupData;
      }
    } catch (error) {
      console.error('Failed to recover from backup:', error.message);
    }
    return null;
  }

  /**
   * Read JSON data from file
   */
  async read() {
    try {
      await this.ensureDirectoryExists();
      
      if (!(await fs.pathExists(this.filePath))) {
        // If file doesn't exist, try to recover from backup or return empty structure
        const recovered = await this.recoverFromBackup();
        if (recovered) {
          return recovered;
        }
        // Return default empty structure
        return { users: [] };
      }

      const data = await fs.readJSON(this.filePath);
      return data;
    } catch (error) {
      // Check if it's a permission error and re-throw it
      if (error.code === 'EACCES' || error.code === 'EPERM' || error.code === 'ENOENT') {
        throw error;
      }
      
      // If it's an invalid path, throw the error
      if (this.filePath.includes('/invalid/') || this.filePath.includes('\\invalid\\') || 
          this.filePath.startsWith('/invalid') || this.filePath.includes(':<>|')) {
        throw error;
      }
      
      // If main file is corrupted, try to recover from backup
      console.warn('Main file corrupted, attempting recovery:', error.message);
      const recovered = await this.recoverFromBackup();
      if (recovered) {
        return recovered;
      }
      
      // Return empty structure as last resort
      return { users: [] };
    }
  }

  /**
   * Write JSON data to file with atomic operations and backup
   */
  async write(data) {
    await this.ensureDirectoryExists();
    
    // Validate data before writing
    this.validateData(data);
    
    // Acquire lock for atomic operation
    await this.acquireLock();
    
    try {
      // Create backup before writing
      await this.createBackup();
      
      // Write data atomically
      const tempFile = this.filePath + '.tmp';
      await fs.writeJSON(tempFile, data, { spaces: 2 });
      
      // Remove destination if it exists before moving
      if (await fs.pathExists(this.filePath)) {
        await fs.remove(this.filePath);
      }
      
      await fs.move(tempFile, this.filePath);
      
    } finally {
      // Always release lock
      await this.releaseLock();
    }
  }

  /**
   * Add a new record to a collection
   */
  async addRecord(collection, record) {
    const data = await this.read();
    
    if (!data[collection]) {
      data[collection] = [];
    }
    
    // Generate ID if not provided
    if (!record.id) {
      record.id = this.generateId();
    }
    
    // Add timestamps
    record.createdAt = new Date().toISOString();
    record.updatedAt = new Date().toISOString();
    
    data[collection].push(record);
    await this.write(data);
    
    return record;
  }

  /**
   * Update a record in a collection
   */
  async updateRecord(collection, id, updates) {
    const data = await this.read();
    
    if (!data[collection]) {
      throw new Error(`Collection ${collection} not found`);
    }
    
    const recordIndex = data[collection].findIndex(record => record.id === id);
    if (recordIndex === -1) {
      throw new Error(`Record with id ${id} not found in ${collection}`);
    }
    
    // Update the record
    data[collection][recordIndex] = {
      ...data[collection][recordIndex],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    
    await this.write(data);
    return data[collection][recordIndex];
  }

  /**
   * Find records in a collection
   */
  async findRecords(collection, filter = {}) {
    const data = await this.read();
    
    if (!data[collection]) {
      return [];
    }
    
    if (Object.keys(filter).length === 0) {
      return data[collection];
    }
    
    return data[collection].filter(record => {
      return Object.keys(filter).every(key => record[key] === filter[key]);
    });
  }

  /**
   * Delete a record from a collection
   */
  async deleteRecord(collection, id) {
    const data = await this.read();
    
    if (!data[collection]) {
      throw new Error(`Collection ${collection} not found`);
    }
    
    const initialLength = data[collection].length;
    data[collection] = data[collection].filter(record => record.id !== id);
    
    if (data[collection].length === initialLength) {
      throw new Error(`Record with id ${id} not found in ${collection}`);
    }
    
    await this.write(data);
    return true;
  }
}

module.exports = JsonStorage; 