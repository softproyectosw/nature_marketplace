'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// Use same token keys as lib/auth.ts
const ACCESS_TOKEN_KEY = 'nature_access_token';
const REFRESH_TOKEN_KEY = 'nature_refresh_token';

export interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  avatar?: string;
  is_active: boolean;
  date_joined: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (data: RegisterData) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

interface RegisterData {
  email: string;
  password: string;
  first_name?: string;
  last_name?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing session on mount
  useEffect(() => {
    checkAuth();
  }, []);

  async function checkAuth() {
    const token = localStorage.getItem(ACCESS_TOKEN_KEY);
    if (!token) {
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch(`${API_URL}/api/users/profile/`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (res.ok) {
        const profileData = await res.json();
        // Map profile data to User interface
        setUser({
          id: profileData.id,
          email: profileData.email,
          first_name: profileData.first_name || '',
          last_name: profileData.last_name || '',
          avatar: profileData.avatar_url,
          is_active: true,
          date_joined: profileData.created_at,
        });
      } else {
        // Token invalid, try refresh
        const refreshed = await refreshToken();
        if (!refreshed) {
          localStorage.removeItem(ACCESS_TOKEN_KEY);
          localStorage.removeItem(REFRESH_TOKEN_KEY);
        }
      }
    } catch (error) {
      console.error('Auth check failed:', error);
    } finally {
      setIsLoading(false);
    }
  }

  async function refreshToken(): Promise<boolean> {
    const refresh = localStorage.getItem(REFRESH_TOKEN_KEY);
    if (!refresh) return false;

    try {
      const res = await fetch(`${API_URL}/api/auth/token/refresh/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh }),
      });

      if (res.ok) {
        const data = await res.json();
        localStorage.setItem(ACCESS_TOKEN_KEY, data.access);
        await checkAuth();
        return true;
      }
    } catch (error) {
      console.error('Token refresh failed:', error);
    }
    return false;
  }

  async function login(email: string, password: string): Promise<{ success: boolean; error?: string }> {
    try {
      const res = await fetch(`${API_URL}/api/auth/login/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        localStorage.setItem(ACCESS_TOKEN_KEY, data.access);
        localStorage.setItem(REFRESH_TOKEN_KEY, data.refresh);
        // Also set cookie for middleware access
        document.cookie = `${ACCESS_TOKEN_KEY}=${data.access}; path=/; max-age=${60 * 60}`;
        
        // Map user data from login response
        if (data.user) {
          setUser({
            id: data.user.pk || data.user.id,
            email: data.user.email,
            first_name: data.user.first_name || '',
            last_name: data.user.last_name || '',
            avatar: data.user.avatar,
            is_active: true,
            date_joined: data.user.date_joined || new Date().toISOString(),
          });
        } else {
          // Fetch profile if user not in response
          await checkAuth();
        }
        return { success: true };
      } else {
        return { success: false, error: data.detail || 'Login failed' };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'Network error. Please try again.' };
    }
  }

  async function register(data: RegisterData): Promise<{ success: boolean; error?: string }> {
    try {
      const res = await fetch(`${API_URL}/api/auth/registration/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: data.email,
          password1: data.password,
          password2: data.password,
          first_name: data.first_name || '',
          last_name: data.last_name || '',
        }),
      });

      const responseData = await res.json();

      if (res.ok) {
        // Auto-login after registration
        if (responseData.access) {
          localStorage.setItem(ACCESS_TOKEN_KEY, responseData.access);
          localStorage.setItem(REFRESH_TOKEN_KEY, responseData.refresh);
          // Also set cookie for middleware access
          document.cookie = `${ACCESS_TOKEN_KEY}=${responseData.access}; path=/; max-age=${60 * 60}`;
          // Map user data
          if (responseData.user) {
            setUser({
              id: responseData.user.pk || responseData.user.id,
              email: responseData.user.email,
              first_name: responseData.user.first_name || '',
              last_name: responseData.user.last_name || '',
              avatar: responseData.user.avatar,
              is_active: true,
              date_joined: responseData.user.date_joined || new Date().toISOString(),
            });
          } else {
            await checkAuth();
          }
        }
        return { success: true };
      } else {
        const errorMsg = responseData.email?.[0] || responseData.password1?.[0] || responseData.detail || 'Registration failed';
        return { success: false, error: errorMsg };
      }
    } catch (error) {
      console.error('Registration error:', error);
      return { success: false, error: 'Network error. Please try again.' };
    }
  }

  function logout() {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    // Also clear cookie
    document.cookie = `${ACCESS_TOKEN_KEY}=; path=/; max-age=0`;
    setUser(null);
    
    // Force page reload to update auth state in all components
    window.location.href = '/';
  }

  async function refreshUser() {
    await checkAuth();
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
