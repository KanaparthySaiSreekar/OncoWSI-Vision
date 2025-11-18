/**
 * Application Configuration
 * Central configuration for API endpoints, limits, and defaults
 */

export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000',
  WS_URL: import.meta.env.VITE_WS_URL || 'ws://localhost:8000',
  TIMEOUT: 30000,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000,
};

export const STORAGE_CONFIG = {
  S3_BUCKET: import.meta.env.VITE_S3_BUCKET || 'oncowsi-slides',
  MINIO_ENDPOINT: import.meta.env.VITE_MINIO_ENDPOINT,
  MAX_UPLOAD_SIZE: 10 * 1024 * 1024 * 1024, // 10GB
  ALLOWED_FORMATS: ['.tiff', '.tif', '.ndpi', '.svs', '.mrxs'],
  CHUNK_SIZE: 5 * 1024 * 1024, // 5MB chunks for multipart upload
};

export const VIEWER_CONFIG = {
  TILE_SIZE: 256,
  MIN_ZOOM_LEVEL: 0,
  MAX_ZOOM_LEVEL: 20,
  DEFAULT_ZOOM: 1,
  PREFETCH_LEVEL: 0,
  IMMEDIATE_RENDER: true,
  ANIMATION_TIME: 0.5,
  SPRING_STIFFNESS: 10,
  TARGET_FPS: 60,
  PIXEL_DENSITY_RATIO: window.devicePixelRatio || 1,
};

export const PERFORMANCE_CONFIG = {
  MAX_TILE_LOAD_TIME: 150, // milliseconds
  AUTOSAVE_INTERVAL: 10000, // 10 seconds
  DEBOUNCE_DELAY: 300,
  THROTTLE_DELAY: 100,
  CACHE_SIZE: 1000, // number of tiles to cache
};

export const VISUALIZATION_CONFIG = {
  DEFAULT_COLORS: [
    '#FF6B6B', // Red
    '#4ECDC4', // Teal
    '#45B7D1', // Blue
    '#FFA07A', // Orange
    '#98D8C8', // Mint
    '#F7DC6F', // Yellow
    '#BB8FCE', // Purple
    '#85C1E2', // Sky blue
  ],
  COLORBLIND_SAFE_PALETTE: [
    '#0173B2', // Blue
    '#DE8F05', // Orange
    '#029E73', // Green
    '#CC78BC', // Purple
    '#CA9161', // Brown
    '#FBAFE4', // Pink
    '#949494', // Gray
    '#ECE133', // Yellow
  ],
  DEFAULT_LINE_WIDTH: 2,
  DEFAULT_OPACITY: 0.8,
  MIN_CONFIDENCE: 0.0,
  MAX_CONFIDENCE: 1.0,
  DEFAULT_CONFIDENCE_THRESHOLD: 0.5,
};

export const INFERENCE_CONFIG = {
  DEFAULT_BATCH_SIZE: 16,
  DEFAULT_TILE_OVERLAP: 0.1,
  DEFAULT_IOU_THRESHOLD: 0.45,
  MIN_CONFIDENCE_THRESHOLD: 0.1,
  MAX_CONFIDENCE_THRESHOLD: 0.99,
  POLLING_INTERVAL: 2000, // 2 seconds
};

export const SECURITY_CONFIG = {
  TOKEN_STORAGE_KEY: 'oncowsi_auth_token',
  REFRESH_TOKEN_KEY: 'oncowsi_refresh_token',
  TOKEN_EXPIRY_BUFFER: 300000, // 5 minutes
  ENABLE_HIPAA_MODE: true,
  ENCRYPTION_REQUIRED: true,
  SESSION_TIMEOUT: 3600000, // 1 hour
};

export const ROLE_PERMISSIONS = {
  pathologist: [
    'upload_slides',
    'view_slides',
    'run_inference',
    'view_results',
    'create_rois',
    'generate_reports',
    'export_reports',
    'create_workspaces',
    'manage_workspaces',
  ],
  researcher: [
    'upload_slides',
    'view_slides',
    'run_inference',
    'view_results',
    'create_rois',
    'export_regions',
    'generate_reports',
    'export_reports',
    'create_workspaces',
    'manage_workspaces',
    'share_workspaces',
  ],
  engineer: [
    'upload_slides',
    'view_slides',
    'run_inference',
    'view_results',
    'create_rois',
    'export_regions',
    'generate_reports',
    'manage_models',
    'view_audit_logs',
  ],
  admin: [
    'upload_slides',
    'view_slides',
    'delete_slides',
    'run_inference',
    'view_results',
    'create_rois',
    'export_regions',
    'generate_reports',
    'export_reports',
    'create_workspaces',
    'manage_workspaces',
    'share_workspaces',
    'manage_users',
    'manage_models',
    'view_audit_logs',
  ],
};

export const REPORT_CONFIG = {
  DEFAULT_SECTIONS: [
    'summary',
    'frequency_table',
    'heatmap',
    'roi_analysis',
    'model_metadata',
  ],
  MAX_HEATMAP_RESOLUTION: 1000,
  PDF_PAGE_SIZE: 'a4',
  PDF_ORIENTATION: 'portrait',
};
