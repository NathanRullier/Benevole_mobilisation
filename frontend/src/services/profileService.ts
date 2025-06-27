// MVP.3F.2: Profile Service
// API integration for profile management

import { apiClient } from './apiClient';

export interface ProfileData {
  id?: string;
  userId: string;
  
  // Personal Information
  phone: string;
  address: string;
  city: string;
  province: string;
  postalCode: string;
  languages: string[];
  
  // Professional Information
  barAssociation: string;
  licenseNumber: string;
  yearsOfExperience: number;
  specializations: string[];
  currentPosition: string;
  firmName: string;
  
  // Availability
  availableDays: string[];
  preferredTimeSlots: string[];
  maxWorkshopsPerMonth: number;
  travelRadius: number;
  
  // Additional
  bio: string;
  profilePhoto: string;
  
  // Metadata
  createdAt?: string;
  updatedAt?: string;
  completenessPercentage?: number;
}

export interface ProfileSearchFilters {
  specializations?: string[];
  availableDays?: string[];
  timeSlots?: string[];
  location?: {
    city?: string;
    province?: string;
    radius?: number;
  };
  experienceLevel?: {
    min?: number;
    max?: number;
  };
  languages?: string[];
  search?: string;
}

export interface ProfileSearchResult {
  profiles: ProfileData[];
  total: number;
  page: number;
  limit: number;
}

class ProfileService {
  async getProfile(userId: string): Promise<ProfileData | null> {
    try {
      const response = await apiClient.get(`/api/profiles/${userId}`);
      return response.data as ProfileData;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null; // Profile doesn't exist yet
      }
      throw new Error('Failed to load profile');
    }
  }

  async createProfile(profileData: Omit<ProfileData, 'id' | 'createdAt' | 'updatedAt'>): Promise<ProfileData> {
    try {
      const response = await apiClient.post('/api/profiles', profileData);
      return response.data as ProfileData;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to create profile');
    }
  }

  async updateProfile(userId: string, profileData: Partial<ProfileData>): Promise<ProfileData> {
    try {
      const response = await apiClient.put(`/api/profiles/${userId}`, profileData);
      return response.data as ProfileData;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to update profile');
    }
  }

  async searchProfiles(filters: ProfileSearchFilters, page = 1, limit = 20): Promise<ProfileSearchResult> {
    try {
      const params = new URLSearchParams();
      
      if (filters.specializations?.length) {
        params.append('specializations', filters.specializations.join(','));
      }
      if (filters.availableDays?.length) {
        params.append('availableDays', filters.availableDays.join(','));
      }
      if (filters.timeSlots?.length) {
        params.append('timeSlots', filters.timeSlots.join(','));
      }
      if (filters.location?.city) {
        params.append('city', filters.location.city);
      }
      if (filters.location?.province) {
        params.append('province', filters.location.province);
      }
      if (filters.location?.radius) {
        params.append('radius', filters.location.radius.toString());
      }
      if (filters.experienceLevel?.min) {
        params.append('minExperience', filters.experienceLevel.min.toString());
      }
      if (filters.experienceLevel?.max) {
        params.append('maxExperience', filters.experienceLevel.max.toString());
      }
      if (filters.languages?.length) {
        params.append('languages', filters.languages.join(','));
      }
      if (filters.search) {
        params.append('search', filters.search);
      }
      
      params.append('page', page.toString());
      params.append('limit', limit.toString());

      const response = await apiClient.get(`/api/profiles/search?${params.toString()}`);
      return response.data as ProfileSearchResult;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to search profiles');
    }
  }

  async deleteProfile(userId: string): Promise<void> {
    try {
      await apiClient.delete(`/api/profiles/${userId}`);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to delete profile');
    }
  }

  async uploadProfilePhoto(userId: string, photo: File): Promise<string> {
    try {
      const formData = new FormData();
      formData.append('photo', photo);

      // For now, we'll implement a basic photo upload using direct fetch
      // since apiClient doesn't support FormData with custom headers
      const token = localStorage.getItem('authToken');
      
      const response = await fetch(`http://localhost:3000/api/v1/profiles/${userId}/photo`, {
        method: 'POST',
        headers: {
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const data = await response.json();
      return (data as { photoUrl: string }).photoUrl;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to upload photo');
    }
  }

  calculateCompleteness(profileData: Partial<ProfileData>): number {
    const requiredFields = [
      'phone', 'address', 'city', 'province', 'postalCode',
      'barAssociation', 'licenseNumber', 'yearsOfExperience',
      'specializations', 'availableDays', 'maxWorkshopsPerMonth'
    ];

    const arrayFields = ['languages', 'specializations', 'availableDays'];
    
    let completedFields = 0;
    let totalFields = requiredFields.length;

    requiredFields.forEach(field => {
      const value = profileData[field as keyof ProfileData];
      if (arrayFields.includes(field)) {
        if (Array.isArray(value) && value.length > 0) {
          completedFields++;
        }
      } else if (value !== undefined && value !== '' && value !== null) {
        completedFields++;
      }
    });

    // Optional fields that add to completeness
    const optionalFields = ['currentPosition', 'firmName', 'bio', 'profilePhoto'];
    optionalFields.forEach(field => {
      const value = profileData[field as keyof ProfileData];
      if (value !== undefined && value !== '' && value !== null) {
        completedFields++;
      }
    });
    totalFields += optionalFields.length;

    return Math.round((completedFields / totalFields) * 100);
  }

  getMissingFields(profileData: Partial<ProfileData>): string[] {
    const requiredFields = [
      { key: 'phone', label: 'Phone Number' },
      { key: 'address', label: 'Address' },
      { key: 'city', label: 'City' },
      { key: 'province', label: 'Province' },
      { key: 'postalCode', label: 'Postal Code' },
      { key: 'languages', label: 'Languages' },
      { key: 'barAssociation', label: 'Bar Association' },
      { key: 'licenseNumber', label: 'License Number' },
      { key: 'yearsOfExperience', label: 'Years of Experience' },
      { key: 'specializations', label: 'Specializations' },
      { key: 'availableDays', label: 'Available Days' },
      { key: 'maxWorkshopsPerMonth', label: 'Max Workshops per Month' }
    ];

    const arrayFields = ['languages', 'specializations', 'availableDays'];
    const missingFields: string[] = [];

    requiredFields.forEach(({ key, label }) => {
      const value = profileData[key as keyof ProfileData];
      if (arrayFields.includes(key)) {
        if (!Array.isArray(value) || value.length === 0) {
          missingFields.push(label);
        }
      } else if (value === undefined || value === '' || value === null) {
        missingFields.push(label);
      }
    });

    return missingFields;
  }

  getSpecializationOptions(): string[] {
    return [
      'Criminal Law',
      'Family Law',
      'Employment Law',
      'Immigration Law',
      'Personal Injury Law',
      'Property Law',
      'Corporate Law',
      'Tax Law',
      'Intellectual Property Law',
      'Environmental Law',
      'Human Rights Law',
      'Consumer Protection',
      'Bankruptcy and Insolvency',
      'Administrative Law',
      'Constitutional Law',
      'Contract Law',
      'Tort Law',
      'Other'
    ];
  }

  getAvailableDaysOptions(): string[] {
    return [
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday',
      'Sunday'
    ];
  }

  getTimeSlotOptions(): string[] {
    return [
      'Morning (9:00 AM - 12:00 PM)',
      'Afternoon (12:00 PM - 5:00 PM)',
      'Evening (5:00 PM - 8:00 PM)',
      'Weekend Morning (9:00 AM - 12:00 PM)',
      'Weekend Afternoon (12:00 PM - 5:00 PM)'
    ];
  }
}

export const profileService = new ProfileService(); 