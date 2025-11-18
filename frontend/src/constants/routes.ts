/**
 * Application Routes
 * Centralized route definitions
 */

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',

  // Slide management
  SLIDES: '/slides',
  SLIDE_UPLOAD: '/slides/upload',
  SLIDE_VIEWER: '/slides/:slideId',

  // Inference
  INFERENCE: '/inference',
  INFERENCE_NEW: '/inference/new',
  INFERENCE_BATCH: '/inference/batch',
  INFERENCE_HISTORY: '/inference/history',
  INFERENCE_JOB: '/inference/:jobId',

  // Analysis
  ANALYSIS: '/analysis/:slideId',

  // Reports
  REPORTS: '/reports',
  REPORT_VIEW: '/reports/:reportId',
  REPORT_GENERATE: '/reports/generate/:slideId',

  // Workspaces
  WORKSPACES: '/workspaces',
  WORKSPACE_VIEW: '/workspaces/:workspaceId',

  // Settings
  SETTINGS: '/settings',
  PROFILE: '/settings/profile',

  // Admin
  ADMIN: '/admin',
  ADMIN_USERS: '/admin/users',
  ADMIN_MODELS: '/admin/models',
  ADMIN_AUDIT: '/admin/audit',
} as const;

export const getSlideViewerRoute = (slideId: string) =>
  ROUTES.SLIDE_VIEWER.replace(':slideId', slideId);

export const getInferenceJobRoute = (jobId: string) =>
  ROUTES.INFERENCE_JOB.replace(':jobId', jobId);

export const getAnalysisRoute = (slideId: string) =>
  ROUTES.ANALYSIS.replace(':slideId', slideId);

export const getReportViewRoute = (reportId: string) =>
  ROUTES.REPORT_VIEW.replace(':reportId', reportId);

export const getReportGenerateRoute = (slideId: string) =>
  ROUTES.REPORT_GENERATE.replace(':slideId', slideId);

export const getWorkspaceRoute = (workspaceId: string) =>
  ROUTES.WORKSPACE_VIEW.replace(':workspaceId', workspaceId);
