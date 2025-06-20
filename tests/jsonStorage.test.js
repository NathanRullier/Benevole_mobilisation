const fs = require('fs-extra');
const path = require('path');
const JsonStorage = require('../backend/utils/jsonStorage');

describe('JsonStorage - File Operations', () => {
  const testDataDir = path.join(__dirname, 'test-data');
  const testFile = path.join(testDataDir, 'test.json');
  
  beforeEach(async () => {
    // Clean up test directory before each test
    await fs.remove(testDataDir);
    await fs.ensureDir(testDataDir);
  });

  afterEach(async () => {
    // Clean up after each test
    await fs.remove(testDataDir);
  });

  describe('MVP.1.1 - File System Operations', () => {
    test('should read empty JSON file', async () => {
      // Arrange: Create empty JSON file
      await fs.writeJSON(testFile, { users: [] });
      const storage = new JsonStorage(testFile);

      // Act: Read the file
      const data = await storage.read();

      // Assert: Should return empty users array
      expect(data).toEqual({ users: [] });
    });

    test('should write JSON data to file', async () => {
      // Arrange
      const storage = new JsonStorage(testFile);
      const testData = { users: [{ id: '1', name: 'Test User' }] };

      // Act: Write data
      await storage.write(testData);

      // Assert: File should contain the data
      const fileContent = await fs.readJSON(testFile);
      expect(fileContent).toEqual(testData);
    });

    test('should handle file locking during concurrent writes', async () => {
      // Arrange
      const storage = new JsonStorage(testFile);
      const data1 = { users: [{ id: '1', name: 'User 1' }] };
      const data2 = { users: [{ id: '2', name: 'User 2' }] };

      // Act: Attempt concurrent writes
      const promises = [
        storage.write(data1),
        storage.write(data2)
      ];

      // Assert: Both operations should complete without error
      await expect(Promise.all(promises)).resolves.not.toThrow();
    });

    test('should create backup before write operations', async () => {
      // Arrange
      const storage = new JsonStorage(testFile);
      const initialData = { users: [{ id: '1', name: 'Initial' }] };
      const updatedData = { users: [{ id: '1', name: 'Updated' }] };
      
      await storage.write(initialData);

      // Act: Update the data
      await storage.write(updatedData);

      // Assert: Backup file should exist with original data
      const backupFile = testFile + '.backup';
      expect(await fs.pathExists(backupFile)).toBe(true);
      const backupContent = await fs.readJSON(backupFile);
      expect(backupContent).toEqual(initialData);
    });

    test('should recover from backup if main file is corrupted', async () => {
      // Arrange
      const storage = new JsonStorage(testFile);
      const originalData = { users: [{ id: '1', name: 'Original' }] };
      const updatedData = { users: [{ id: '2', name: 'Updated' }] };
      
      // Write original data
      await storage.write(originalData);
      
      // Write updated data (this creates backup of original data)
      await storage.write(updatedData);
      
      // Corrupt the main file
      await fs.writeFile(testFile, 'invalid json content');

      // Act: Attempt to read (should trigger recovery)
      const recoveredData = await storage.read();

      // Assert: Should recover the original data from backup
      expect(recoveredData).toEqual(originalData);
    });

    test('should validate JSON schema before writing', async () => {
      // Arrange
      const storage = new JsonStorage(testFile);
      const invalidData = { invalidField: 'not allowed' };

      // Act & Assert: Should throw validation error
      await expect(storage.write(invalidData)).rejects.toThrow('Schema validation failed');
    });

    test('should handle atomic write operations', async () => {
      // Arrange
      const storage = new JsonStorage(testFile);
      const testData = { users: [{ id: '1', name: 'Atomic Test' }] };

      // Act: Write data
      await storage.write(testData);

      // Assert: File should exist and contain correct data
      expect(await fs.pathExists(testFile)).toBe(true);
      const content = await fs.readJSON(testFile);
      expect(content).toEqual(testData);
    });

    test('should generate unique IDs for new records', async () => {
      // Arrange
      const storage = new JsonStorage(testFile);
      await storage.write({ users: [] });

      // Act: Generate multiple IDs
      const id1 = storage.generateId();
      const id2 = storage.generateId();
      const id3 = storage.generateId();

      // Assert: All IDs should be unique and valid UUIDs
      expect(id1).not.toBe(id2);
      expect(id2).not.toBe(id3);
      expect(id1).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
    });

    test('should handle file permission errors gracefully', async () => {
      // Arrange - Use a path with invalid characters on Windows
      const storage = new JsonStorage('C:\\invalid:<>|path\\test.json');

      // Act & Assert: Should handle permission errors
      await expect(storage.read()).rejects.toThrow();
    });

    test('should ensure data directory exists before operations', async () => {
      // Arrange
      const nestedFile = path.join(testDataDir, 'nested', 'deep', 'test.json');
      const storage = new JsonStorage(nestedFile);
      const testData = { users: [] };

      // Act: Write to nested path
      await storage.write(testData);

      // Assert: Directory structure should be created
      expect(await fs.pathExists(nestedFile)).toBe(true);
      const content = await fs.readJSON(nestedFile);
      expect(content).toEqual(testData);
    });
  });

  describe('MVP.1.1 - JSON Data Validation', () => {
    test('should validate user data structure', async () => {
      // Arrange
      const storage = new JsonStorage(testFile);
      const validUserData = {
        users: [{
          id: '1',
          email: 'test@example.com',
          firstName: 'John',
          lastName: 'Doe',
          role: 'volunteer'
        }]
      };

      // Act & Assert: Valid data should not throw
      await expect(storage.write(validUserData)).resolves.not.toThrow();
    });

    test('should reject invalid user data structure', async () => {
      // Arrange
      const storage = new JsonStorage(testFile);
      const invalidUserData = {
        users: [{
          id: '1',
          // Missing required fields
          invalidField: 'test'
        }]
      };

      // Act & Assert: Invalid data should throw validation error
      await expect(storage.write(invalidUserData)).rejects.toThrow();
    });
  });
}); 