import apiClient from './apiClient';

export interface WorkshopLocation {
  name?: string;
  address?: string;
  city: string;
  region: string;
}

export interface ContactPerson {
  name: string;
  email: string;
  phone?: string;
}

export interface WorkshopData {
  id?: string;
  title: string;
  description: string;
  date: string;
  startTime: string;
  endTime: string;
  location: WorkshopLocation;
  maxVolunteers?: number;
  requiredSpecializations?: string[];
  targetAudience?: string;
  workshopType?: string;
  contactPerson?: ContactPerson;
  status: 'draft' | 'published' | 'cancelled' | 'completed';
  createdBy?: string;
  applicationsCount?: number;
  applications?: any[];
  createdAt?: string;
  updatedAt?: string;
  cancellationReason?: string;
}

export interface WorkshopFilters {
  region?: string;
  specialization?: string;
  status?: string;
  search?: string;
  date?: string;
  includeAllStatuses?: boolean;
}

export interface WorkshopListResponse {
  workshops: WorkshopData[];
  total: number;
}

class WorkshopService {
  // Get all workshops with optional filtering
  async getWorkshops(filters: WorkshopFilters = {}): Promise<WorkshopListResponse> {
    try {
      const params = new URLSearchParams();
      
      if (filters.region) params.append('region', filters.region);
      if (filters.specialization) params.append('specialization', filters.specialization);
      if (filters.status) params.append('status', filters.status);
      if (filters.search) params.append('search', filters.search);
      if (filters.date) params.append('date', filters.date);
      if (filters.includeAllStatuses) params.append('includeAllStatuses', 'true');

      const queryString = params.toString();
      const url = queryString ? `/workshops?${queryString}` : '/workshops';
      
      const response = await apiClient.get(url);
      return response.data;
    } catch (error) {
      console.error('Error fetching workshops:', error);
      throw error;
    }
  }

  // Get available workshops for volunteers
  async getAvailableWorkshops(filters: WorkshopFilters = {}): Promise<WorkshopListResponse> {
    try {
      const params = new URLSearchParams();
      
      if (filters.region) params.append('region', filters.region);
      if (filters.specialization) params.append('specialization', filters.specialization);
      if (filters.date) params.append('date', filters.date);

      const queryString = params.toString();
      const url = queryString ? `/workshops/volunteer/available?${queryString}` : '/workshops/volunteer/available';
      
      const response = await apiClient.get(url);
      return response.data;
    } catch (error) {
      console.error('Error fetching available workshops:', error);
      throw error;
    }
  }

  // Get workshop by ID
  async getWorkshopById(id: string): Promise<{ workshop: WorkshopData }> {
    try {
      const response = await apiClient.get(`/workshops/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching workshop:', error);
      throw error;
    }
  }

  // Create workshop (coordinator only)
  async createWorkshop(workshopData: Omit<WorkshopData, 'id' | 'createdAt' | 'updatedAt' | 'applicationsCount' | 'applications'>): Promise<{ message: string; workshopId: string; workshop: WorkshopData }> {
    try {
      const response = await apiClient.post('/workshops', workshopData);
      return response.data;
    } catch (error) {
      console.error('Error creating workshop:', error);
      throw error;
    }
  }

  // Update workshop (coordinator only)
  async updateWorkshop(id: string, workshopData: Partial<WorkshopData>): Promise<{ message: string; workshop: WorkshopData }> {
    try {
      const response = await apiClient.put(`/workshops/${id}`, workshopData);
      return response.data;
    } catch (error) {
      console.error('Error updating workshop:', error);
      throw error;
    }
  }

  // Update workshop status (coordinator only)
  async updateWorkshopStatus(id: string, status: WorkshopData['status'], cancellationReason?: string): Promise<{ message: string; workshop: WorkshopData }> {
    try {
      const response = await apiClient.put(`/workshops/${id}/status`, {
        status,
        cancellationReason
      });
      return response.data;
    } catch (error) {
      console.error('Error updating workshop status:', error);
      throw error;
    }
  }

  // Delete workshop (coordinator only)
  async deleteWorkshop(id: string): Promise<{ message: string }> {
    try {
      const response = await apiClient.delete(`/workshops/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting workshop:', error);
      throw error;
    }
  }

  // Get coordinator's workshops
  async getMyWorkshops(): Promise<WorkshopListResponse> {
    try {
      const response = await apiClient.get('/workshops/coordinator/my-workshops');
      return response.data;
    } catch (error) {
      console.error('Error fetching coordinator workshops:', error);
      throw error;
    }
  }

  // Helper method to format workshop time display
  formatWorkshopTime(workshop: WorkshopData): string {
    return `${workshop.startTime}-${workshop.endTime}`;
  }

  // Helper method to get status color
  getStatusColor(status: WorkshopData['status']): 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' {
    switch (status) {
      case 'draft': return 'default';
      case 'published': return 'success';
      case 'cancelled': return 'error';
      case 'completed': return 'info';
      default: return 'default';
    }
  }

  // Helper method to check if workshop is in the past
  isWorkshopPast(workshop: WorkshopData): boolean {
    const workshopDate = new Date(workshop.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return workshopDate < today;
  }

  // Helper method to check if workshop is upcoming
  isWorkshopUpcoming(workshop: WorkshopData): boolean {
    const workshopDate = new Date(workshop.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return workshopDate >= today;
  }
}

export const workshopService = new WorkshopService();
