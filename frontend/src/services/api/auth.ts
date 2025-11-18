/**
 * Auth API Service
 * API calls for authentication and authorization
 */

import { apiClient } from './client';
import { User, LoginCredentials } from '../../types';

export const authApi = {
  /**
   * Login
   */
  login: async (credentials: LoginCredentials) => {
    return apiClient.post<{
      user: User;
      token: string;
      refreshToken: string;
      expiresIn: number;
    }>('/auth/login', credentials);
  },

  /**
   * Logout
   */
  logout: async () => {
    return apiClient.post('/auth/logout');
  },

  /**
   * Refresh token
   */
  refreshToken: async (refreshToken: string) => {
    return apiClient.post<{
      token: string;
      refreshToken: string;
      expiresIn: number;
    }>('/auth/refresh', { refreshToken });
  },

  /**
   * Get current user
   */
  getCurrentUser: async () => {
    return apiClient.get<User>('/auth/me');
  },

  /**
   * Update user profile
   */
  updateProfile: async (updates: Partial<User>) => {
    return apiClient.patch<User>('/auth/profile', updates);
  },
};
