const fs = require('fs-extra');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const JsonStorage = require('../utils/jsonStorage');

class ProfileService {
  constructor() {
    this.dataDir = path.join(__dirname, '../../data');
    this.profilesFile = path.join(this.dataDir, 'volunteer-profiles.json');
    this.storage = new JsonStorage();
  }

  async initialize() {
    await fs.ensureDir(this.dataDir);
    
    if (!await fs.pathExists(this.profilesFile)) {
      await this.storage.write(this.profilesFile, { profiles: [] });
    }
  }

  // Validate profile data
  _validateProfileData(data) {
    const errors = [];

    // Required fields
    if (!data.phone) {
      errors.push('Phone number is required');
    } else if (!this._isValidPhoneNumber(data.phone)) {
      errors.push('Invalid phone number format. Use format: +1-xxx-xxx-xxxx');
    }

    if (!data.specializations || !Array.isArray(data.specializations) || data.specializations.length === 0) {
      errors.push('At least one specialization is required');
    }

    // Optional field validations
    if (data.experienceYears !== undefined) {
      if (typeof data.experienceYears !== 'number' || data.experienceYears < 0 || data.experienceYears > 50) {
        errors.push('Experience years must be a number between 0 and 50');
      }
    }

    if (data.languages && !Array.isArray(data.languages)) {
      errors.push('Languages must be an array');
    }

    if (data.regions && !Array.isArray(data.regions)) {
      errors.push('Regions must be an array');
    }

    if (data.licenseNumber && typeof data.licenseNumber !== 'string') {
      errors.push('License number must be a string');
    }

    if (data.barAssociation && typeof data.barAssociation !== 'string') {
      errors.push('Bar association must be a string');
    }

    if (data.bio && typeof data.bio !== 'string') {
      errors.push('Bio must be a string');
    }

    if (data.availabilityPreferences) {
      const prefs = data.availabilityPreferences;
      if (prefs.daysOfWeek && !Array.isArray(prefs.daysOfWeek)) {
        errors.push('Availability days must be an array');
      }
      if (prefs.timeSlots && !Array.isArray(prefs.timeSlots)) {
        errors.push('Time slots must be an array');
      }
      if (prefs.maxWorkshopsPerMonth !== undefined && 
          (typeof prefs.maxWorkshopsPerMonth !== 'number' || prefs.maxWorkshopsPerMonth < 1)) {
        errors.push('Max workshops per month must be a positive number');
      }
    }

    return errors;
  }

  _isValidPhoneNumber(phone) {
    // Basic phone validation for Quebec/Canada format
    const phoneRegex = /^\+1-\d{3}-\d{3}-\d{4}$/;
    return phoneRegex.test(phone);
  }

  // Create a new profile
  async createProfile(userId, profileData) {
    await this.initialize();

    // Validate input data
    const validationErrors = this._validateProfileData(profileData);
    if (validationErrors.length > 0) {
      throw new Error(`Validation failed: ${validationErrors.join(', ')}`);
    }

    const data = await this.storage.read(this.profilesFile);
    
    // Check if profile already exists for this user
    const existingProfile = data.profiles.find(p => p.userId === userId);
    if (existingProfile) {
      throw new Error('Profile already exists for this user');
    }

    const profileId = uuidv4();
    const newProfile = {
      profileId,
      userId,
      ...profileData,
      profilePhoto: profileData.profilePhoto || '/uploads/photos/default-avatar.jpg',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isActive: true
    };

    data.profiles.push(newProfile);
    await this.storage.write(this.profilesFile, data);

    return newProfile;
  }

  // Get profile by user ID
  async getProfileByUserId(userId) {
    await this.initialize();
    
    const data = await this.storage.read(this.profilesFile);
    const profile = data.profiles.find(p => p.userId === userId && p.isActive);
    
    if (!profile) {
      return null;
    }

    return profile;
  }

  // Get profile by profile ID
  async getProfileById(profileId) {
    await this.initialize();
    
    const data = await this.storage.read(this.profilesFile);
    const profile = data.profiles.find(p => p.profileId === profileId && p.isActive);
    
    return profile || null;
  }

  // Update profile
  async updateProfile(userId, updateData) {
    await this.initialize();

    // Validate input data
    const validationErrors = this._validateProfileData(updateData);
    if (validationErrors.length > 0) {
      throw new Error(`Validation failed: ${validationErrors.join(', ')}`);
    }

    const data = await this.storage.read(this.profilesFile);
    const profileIndex = data.profiles.findIndex(p => p.userId === userId && p.isActive);
    
    if (profileIndex === -1) {
      throw new Error('Profile not found');
    }

    // Update profile data
    data.profiles[profileIndex] = {
      ...data.profiles[profileIndex],
      ...updateData,
      updatedAt: new Date().toISOString()
    };

    await this.storage.write(this.profilesFile, data);
    return data.profiles[profileIndex];
  }

  // Delete profile (soft delete)
  async deleteProfile(userId) {
    await this.initialize();

    const data = await this.storage.read(this.profilesFile);
    const profileIndex = data.profiles.findIndex(p => p.userId === userId && p.isActive);
    
    if (profileIndex === -1) {
      throw new Error('Profile not found');
    }

    // Soft delete
    data.profiles[profileIndex].isActive = false;
    data.profiles[profileIndex].deletedAt = new Date().toISOString();
    data.profiles[profileIndex].updatedAt = new Date().toISOString();

    await this.storage.write(this.profilesFile, data);
    return true;
  }

  // Search profiles (coordinator only)
  async searchProfiles(filters = {}) {
    await this.initialize();
    
    const data = await this.storage.read(this.profilesFile);
    let profiles = data.profiles.filter(p => p.isActive);

    // Apply filters
    if (filters.specialization) {
      profiles = profiles.filter(p => 
        p.specializations && p.specializations.some(s => 
          s.toLowerCase().includes(filters.specialization.toLowerCase())
        )
      );
    }

    if (filters.region) {
      profiles = profiles.filter(p => 
        p.regions && p.regions.some(r => 
          r.toLowerCase().includes(filters.region.toLowerCase())
        )
      );
    }

    if (filters.language) {
      profiles = profiles.filter(p => 
        p.languages && p.languages.some(l => 
          l.toLowerCase().includes(filters.language.toLowerCase())
        )
      );
    }

    if (filters.experienceMin !== undefined) {
      profiles = profiles.filter(p => 
        p.experienceYears && p.experienceYears >= filters.experienceMin
      );
    }

    if (filters.experienceMax !== undefined) {
      profiles = profiles.filter(p => 
        p.experienceYears && p.experienceYears <= filters.experienceMax
      );
    }

    if (filters.availability) {
      profiles = profiles.filter(p => 
        p.availabilityPreferences && 
        p.availabilityPreferences.daysOfWeek &&
        p.availabilityPreferences.daysOfWeek.includes(filters.availability)
      );
    }

    return profiles;
  }

  // Update profile photo
  async updateProfilePhoto(userId, photoUrl) {
    await this.initialize();

    const data = await this.storage.read(this.profilesFile);
    const profileIndex = data.profiles.findIndex(p => p.userId === userId && p.isActive);
    
    if (profileIndex === -1) {
      throw new Error('Profile not found');
    }

    data.profiles[profileIndex].profilePhoto = photoUrl;
    data.profiles[profileIndex].updatedAt = new Date().toISOString();

    await this.storage.write(this.profilesFile, data);
    return data.profiles[profileIndex];
  }

  // Get all profiles (coordinator only)
  async getAllProfiles() {
    await this.initialize();
    
    const data = await this.storage.read(this.profilesFile);
    return data.profiles.filter(p => p.isActive);
  }

  // Get profile statistics
  async getProfileStats() {
    await this.initialize();
    
    const data = await this.storage.read(this.profilesFile);
    const activeProfiles = data.profiles.filter(p => p.isActive);

    const stats = {
      totalProfiles: activeProfiles.length,
      bySpecialization: {},
      byRegion: {},
      byLanguage: {},
      averageExperience: 0
    };

    let totalExperience = 0;
    let experienceCount = 0;

    activeProfiles.forEach(profile => {
      // Count specializations
      if (profile.specializations) {
        profile.specializations.forEach(spec => {
          stats.bySpecialization[spec] = (stats.bySpecialization[spec] || 0) + 1;
        });
      }

      // Count regions
      if (profile.regions) {
        profile.regions.forEach(region => {
          stats.byRegion[region] = (stats.byRegion[region] || 0) + 1;
        });
      }

      // Count languages
      if (profile.languages) {
        profile.languages.forEach(lang => {
          stats.byLanguage[lang] = (stats.byLanguage[lang] || 0) + 1;
        });
      }

      // Calculate average experience
      if (profile.experienceYears !== undefined) {
        totalExperience += profile.experienceYears;
        experienceCount++;
      }
    });

    if (experienceCount > 0) {
      stats.averageExperience = Math.round(totalExperience / experienceCount * 10) / 10;
    }

    return stats;
  }
}

module.exports = ProfileService; 