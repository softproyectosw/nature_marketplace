/**
 * Authentication utilities for Nature Marketplace
 * Uses Django backend with JWT tokens
 */

import { apiClient } from './api/client';

// Token storage keys
const ACCESS_TOKEN_KEY = 'nature_access_token';
const REFRESH_TOKEN_KEY = 'nature_refresh_token';

// Types
export interface User {
  id: number;
  email: string;
  username: string;
  first_name: string;
  last_name: string;
}

export interface AuthTokens {
  access: string;
  refresh: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password1: string;
  password2: string;
  first_name?: string;
  last_name?: string;
}

export interface AuthResponse {
  user: User;
  access: string;
  refresh: string;
}

// Token management
export const auth = {
  /**
   * Get stored access token
   */
  getAccessToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(ACCESS_TOKEN_KEY);
  },

  /**
   * Get stored refresh token
   */
  getRefreshToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  },

  /**
   * Store tokens in localStorage and cookies (for middleware)
   */
  setTokens(tokens: AuthTokens): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(ACCESS_TOKEN_KEY, tokens.access);
    localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refresh);
    // Also set cookie for middleware access
    document.cookie = `${ACCESS_TOKEN_KEY}=${tokens.access}; path=/; max-age=${60 * 60}`; // 1 hour
  },

  /**
   * Clear stored tokens from localStorage and cookies
   */
  clearTokens(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    // Clear cookie
    document.cookie = `${ACCESS_TOKEN_KEY}=; path=/; max-age=0`;
  },

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return !!this.getAccessToken();
  },

  /**
   * Login with email and password
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/auth/login/', credentials);
    this.setTokens({ access: response.access, refresh: response.refresh });
    return response;
  },

  /**
   * Register a new user
   */
  async register(data: RegisterData): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/auth/registration/', data);
    this.setTokens({ access: response.access, refresh: response.refresh });
    return response;
  },

  /**
   * Logout current user
   */
  async logout(): Promise<void> {
    try {
      await apiClient.post('/auth/logout/', {});
    } catch {
      // Ignore errors on logout
    } finally {
      this.clearTokens();
    }
  },

  /**
   * Refresh access token
   */
  async refreshToken(): Promise<string | null> {
    const refresh = this.getRefreshToken();
    if (!refresh) return null;

    try {
      const response = await apiClient.post<{ access: string }>('/auth/token/refresh/', {
        refresh,
      });
      localStorage.setItem(ACCESS_TOKEN_KEY, response.access);
      return response.access;
    } catch {
      this.clearTokens();
      return null;
    }
  },

  /**
   * Get current user profile
   */
  async getCurrentUser(): Promise<User | null> {
    if (!this.isAuthenticated()) return null;

    try {
      return await apiClient.get<User>('/auth/user/');
    } catch {
      return null;
    }
  },

  /**
   * Get Google OAuth URL
   */
  getGoogleAuthUrl(): string {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    return `${apiUrl}/api/auth/social/google/login/`;
  },
};

export default auth;
