/**
 * Workspace API Service
 * API calls for workspace and session management
 */

import { apiClient } from './client';
import { Workspace, Session } from '../../types';

export const workspaceApi = {
  /**
   * Get all workspaces
   */
  getWorkspaces: async () => {
    return apiClient.get<Workspace[]>('/workspaces');
  },

  /**
   * Get workspace by ID
   */
  getWorkspaceById: async (workspaceId: string) => {
    return apiClient.get<Workspace>(`/workspaces/${workspaceId}`);
  },

  /**
   * Create new workspace
   */
  createWorkspace: async (data: { name: string; description?: string }) => {
    return apiClient.post<Workspace>('/workspaces', data);
  },

  /**
   * Update workspace
   */
  updateWorkspace: async (workspaceId: string, updates: Partial<Workspace>) => {
    return apiClient.patch<Workspace>(`/workspaces/${workspaceId}`, updates);
  },

  /**
   * Delete workspace
   */
  deleteWorkspace: async (workspaceId: string) => {
    return apiClient.delete(`/workspaces/${workspaceId}`);
  },

  /**
   * Save session state
   */
  saveSession: async (session: Session) => {
    return apiClient.post<Session>('/sessions', session);
  },

  /**
   * Get session
   */
  getSession: async (workspaceId: string, slideId: string) => {
    return apiClient.get<Session>(`/sessions/${workspaceId}/${slideId}`);
  },
};
