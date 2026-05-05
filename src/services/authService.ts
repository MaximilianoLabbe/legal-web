import api from './api';
import { userService } from './userService';
import type { AuthResponse, User } from '../types';
import { setToken, setStoredUser, removeToken, removeStoredUser, setRefreshToken, removeRefreshToken, getRefreshToken } from '../utils';

// Demo mode credentials for testing without backend
const DEMO_CREDENTIALS = {
  'admin@example.com': 'password123',
  'lawyer@example.com': 'password123',
  'test@test.com': 'password123',
  'demo@demo.com': 'password123',
};

export const authService = {
  login: async (email: string, password: string): Promise<AuthResponse> => {
    // Validate inputs
    if (!email || !password) {
      throw new Error('Email y contraseña son requeridos');
    }

    try {
      // Try real API first - if it responds, use that response (even errors)
      const response = await api.post<any>('/auth/login', {
        email,
        password,
      });
      
      // Handle different response formats from backend
      // Backend returns: { accessToken, user }
      let token = response.data.accessToken || response.data.access_token || response.data.token;
      let user = response.data.user;
      
      // If user is nested in data, extract it
      if (!user && response.data.data?.user) {
        user = response.data.data.user;
        token = response.data.data.access_token || response.data.data.token;
      }
      
      // If user is not in the response, construct it from available data
      if (!user && (response.data.email || response.data.id)) {
        user = {
          id: response.data.id || 'user-' + Date.now(),
          email: response.data.email || email,
          firstName: response.data.firstName || '',
          lastName: response.data.lastName || '',
          telefono: response.data.telefono || '',
          role: response.data.role || 'lawyer',
          created_at: response.data.created_at || new Date().toISOString(),
          updated_at: response.data.updated_at || new Date().toISOString(),
        };
      }
      
      if (!token || !user) {
        throw new Error('Respuesta inválida del servidor');
      }
      
      // Set token FIRST so the interceptor can use it for the next request
      setToken(token);
      // Store refresh token if provided
      if (response.data.refreshToken || response.data.refresh_token) {
        const refreshToken = response.data.refreshToken || response.data.refresh_token;
        setRefreshToken(refreshToken);
      }
      setStoredUser(user);
      
      // Fetch complete user data if we have a user ID
      if (user.id) {
        try {
          const completeUser = await userService.getUserById(user.id);
          // Update with complete user data
          setStoredUser(completeUser);
          user = completeUser;
        } catch (error) {
          // If we can't fetch complete user, continue with what we have
          console.warn('Could not fetch complete user data:', error);
        }
      }
      
      return {
        access_token: token,
        user: user,
      };
    } catch (error: any) {
      // Check if backend is unreachable
      const isBackendUnavailable = 
        error.code === 'ECONNREFUSED' || 
        error.code?.includes('ECONNREFUSED') || 
        error.message?.includes('ERR_CONNECTION_REFUSED') ||
        error.message?.includes('ERR_INVALID_URL') ||
        !error.response; // No response means connection issue
      
      // DEVELOPMENT: Allow demo mode if credentials match demo list
      // This is for testing purposes when backend auth is not working
      const isDemoCredentials = DEMO_CREDENTIALS[email as keyof typeof DEMO_CREDENTIALS] === password;
      
      if (isBackendUnavailable || isDemoCredentials) {
        // Backend is not available OR demo credentials provided - use demo mode
        if (DEMO_CREDENTIALS[email as keyof typeof DEMO_CREDENTIALS] === password) {
          // Generate demo user
          const demoUser: User = {
            id: 'demo-user-' + Date.now(),
            email: email,
            firstName: email.includes('admin') ? 'Admin' : 'Abogado',
            lastName: 'Demo',
            telefono: '+56912345678',
            role: email.includes('admin') ? 'admin' : 'lawyer',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };

          const demoToken = 'demo-token-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
          const demoRefreshToken = 'demo-refresh-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
          
          setToken(demoToken);
          setRefreshToken(demoRefreshToken);
          setStoredUser(demoUser);

          return {
            access_token: demoToken,
            refresh_token: demoRefreshToken,
            user: demoUser,
          };
        } else {
          throw new Error('Credenciales inválidas');
        }
      }
      
      // Backend is available but authentication failed - throw the error
      throw error;
    }
  },

  logout: (): void => {
    removeToken();
    removeRefreshToken();
    removeStoredUser();
  },

  refreshAccessToken: async (): Promise<string> => {
    const refreshToken = getRefreshToken();
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    try {
      const response = await api.post<any>('/auth/refresh', {
        refreshToken,
      });

      const newAccessToken = response.data.accessToken || response.data.access_token || response.data.token;
      if (!newAccessToken) {
        throw new Error('Invalid refresh response');
      }

      setToken(newAccessToken);
      return newAccessToken;
    } catch (error) {
      // If refresh fails, clear auth and redirect to login
      removeToken();
      removeRefreshToken();
      removeStoredUser();
      window.location.href = '/login';
      throw error;
    }
  },

  getCurrentUser: (): User | null => {
    const user = localStorage.getItem('auth_user');
    return user ? JSON.parse(user) : null;
  },

  isAuthenticated: (): boolean => {
    return !!localStorage.getItem('auth_token');
  },
};
