/**
 * Workspace and Session Types
 * Multi-slide studies, session management, and workspace state
 */

export interface Workspace {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  slideIds: string[];
  currentSlideId?: string;
  settings: WorkspaceSettings;
  tags?: string[];
}

export interface WorkspaceSettings {
  autoSave: boolean;
  autoSaveInterval: number; // seconds
  defaultModel?: string;
  defaultConfidenceThreshold: number;
  visualizationDefaults: {
    colorPalette: string[];
    lineWidth: number;
    opacity: number;
  };
}

export interface Session {
  id: string;
  workspaceId: string;
  slideId: string;
  viewerState: ViewerState;
  detectionFilters: DetectionFilters;
  selectedROIs: string[];
  lastSavedAt: string;
  lastActivityAt: string;
}

export interface ViewerState {
  zoom: number;
  centerX: number;
  centerY: number;
  rotation: number;
  activeOverlays: string[];
}

export interface DetectionFilters {
  classIds: number[];
  confidenceMin: number;
  confidenceMax: number;
}

export interface RecentActivity {
  id: string;
  type: 'slide_upload' | 'inference_run' | 'report_generated' | 'roi_created';
  timestamp: string;
  slideId?: string;
  slideName?: string;
  description: string;
}
