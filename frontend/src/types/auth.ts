/**
 * Authentication and Authorization Types
 * User roles, permissions, and access control
 */

export enum UserRole {
  PATHOLOGIST = 'pathologist',
  RESEARCHER = 'researcher',
  ENGINEER = 'engineer',
  ADMIN = 'admin',
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  permissions: Permission[];
  createdAt: string;
  lastLoginAt?: string;
  avatar?: string;
  organization?: string;
}

export enum Permission {
  // Slide permissions
  UPLOAD_SLIDES = 'upload_slides',
  VIEW_SLIDES = 'view_slides',
  DELETE_SLIDES = 'delete_slides',

  // Inference permissions
  RUN_INFERENCE = 'run_inference',
  VIEW_RESULTS = 'view_results',

  // Analysis permissions
  CREATE_ROIS = 'create_rois',
  EXPORT_REGIONS = 'export_regions',

  // Report permissions
  GENERATE_REPORTS = 'generate_reports',
  EXPORT_REPORTS = 'export_reports',

  // Workspace permissions
  CREATE_WORKSPACES = 'create_workspaces',
  MANAGE_WORKSPACES = 'manage_workspaces',
  SHARE_WORKSPACES = 'share_workspaces',

  // Admin permissions
  MANAGE_USERS = 'manage_users',
  MANAGE_MODELS = 'manage_models',
  VIEW_AUDIT_LOGS = 'view_audit_logs',
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  expiresAt: number | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  action: string;
  resourceType: string;
  resourceId: string;
  timestamp: string;
  ipAddress: string;
  details?: Record<string, any>;
}
