// MVP.2F.8: JWT Token Storage and Management
// MVP.2F.2: Authentication API service

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'volunteer' | 'coordinator';
  isActive: boolean;
  lastLogin?: string;
  createdAt: string;
  updatedAt?: string;
}

interface LoginRequest {
  email: string;
  password: string;
}

interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: 'volunteer' | 'coordinator';
}

interface AuthResponse {
  message: string;
  token: string;
  sessionId: string;
  user: User;
}

interface RegisterResponse {
  message: string;
  userId: string;
  user: User;
}

// Base API URL
const API_BASE_URL = 'http://localhost:3000/api/v1';

class AuthService {
  private readonly TOKEN_KEY = 'auth_token';
  private readonly USER_KEY = 'user_data';
  private readonly SESSION_KEY = 'session_id';

  // MVP.2F.8: JWT token storage in localStorage
  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  setToken(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  removeToken(): void {
    localStorage.removeItem(this.TOKEN_KEY);
  }

  // User data management
  getUser(): User | null {
    const userData = localStorage.getItem(this.USER_KEY);
    return userData ? JSON.parse(userData) : null;
  }

  setUser(user: User): void {
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
  }

  removeUser(): void {
    localStorage.removeItem(this.USER_KEY);
  }

  // Session management
  getSessionId(): string | null {
    return localStorage.getItem(this.SESSION_KEY);
  }

  setSessionId(sessionId: string): void {
    localStorage.setItem(this.SESSION_KEY, sessionId);
  }

  removeSessionId(): void {
    localStorage.removeItem(this.SESSION_KEY);
  }

  // MVP.2F.11: Session persistence check
  isAuthenticated(): boolean {
    return this.getToken() !== null && this.getUser() !== null;
  }

  // API call helper with auth header
  private async apiCall<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const token = this.getToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    // MVP.2F.8: Include token in API requests
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      // MVP.2F.11: Handle token expiration
      if (response.status === 401) {
        this.clearAuthData();
        throw new Error('Your session has expired. Please log in again.');
      }
      
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
  }

  // MVP.2F.7: User registration
  async register(data: RegisterRequest): Promise<RegisterResponse> {
    const response = await this.apiCall<RegisterResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });

    return response;
  }

  // MVP.2F.7: User login
  async login(data: LoginRequest): Promise<AuthResponse> {
    const response = await this.apiCall<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });

    // Store authentication data
    this.setToken(response.token);
    this.setUser(response.user);
    this.setSessionId(response.sessionId);

    return response;
  }

  // MVP.2F.7: User logout
  async logout(): Promise<void> {
    try {
      await this.apiCall('/auth/logout', {
        method: 'POST',
      });
    } catch (error) {
      // Even if logout fails on server, clear local data
      console.error('Logout error:', error);
    } finally {
      this.clearAuthData();
    }
  }

  // MVP.2F.8: Clear all authentication data
  clearAuthData(): void {
    this.removeToken();
    this.removeUser();
    this.removeSessionId();
  }

  // MVP.2F.9: Token verification
  async verifyToken(): Promise<boolean> {
    try {
      const response = await this.apiCall<{ valid: boolean; user: User }>('/auth/verify');
      
      if (response.valid && response.user) {
        // Update user data if token is valid
        this.setUser(response.user);
        return true;
      } else {
        this.clearAuthData();
        return false;
      }
    } catch (error) {
      this.clearAuthData();
      return false;
    }
  }

  // Get current user profile
  async getCurrentUser(): Promise<User> {
    const response = await this.apiCall<{ user: User }>('/auth/profile');
    
    // Update stored user data
    this.setUser(response.user);
    return response.user;
  }

  // Refresh token
  async refreshToken(): Promise<string> {
    const response = await this.apiCall<{ token: string; message: string }>('/auth/refresh', {
      method: 'POST',
    });

    this.setToken(response.token);
    return response.token;
  }

  // MVP.2F.10: Role-based access control
  hasRole(role: 'volunteer' | 'coordinator'): boolean {
    const user = this.getUser();
    if (!user) return false;

    // Coordinators have hierarchical access (can access volunteer features)
    if (role === 'volunteer') {
      return user.role === 'volunteer' || user.role === 'coordinator';
    }

    return user.role === role;
  }

  // Get user role
  getUserRole(): 'volunteer' | 'coordinator' | null {
    const user = this.getUser();
    return user ? user.role : null;
  }
}

// Export singleton instance
export const authService = new AuthService();
export type { User, LoginRequest, RegisterRequest, AuthResponse, RegisterResponse }; 