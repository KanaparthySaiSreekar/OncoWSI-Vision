/**
 * Detections API Service
 * API calls for detection retrieval and visualization
 */

import { apiClient } from './client';
import { Detection, DetectionStatistics } from '../../types';

export const detectionsApi = {
  /**
   * Get detections for a slide
   */
  getDetections: async (slideId: string, jobId: string) => {
    return apiClient.get<Detection[]>(`/slides/${slideId}/detections`, {
      params: { jobId },
    });
  },

  /**
   * Get detections in region (for tile-based loading)
   */
  getDetectionsInRegion: async (
    slideId: string,
    jobId: string,
    bounds: { x: number; y: number; width: number; height: number }
  ) => {
    return apiClient.get<Detection[]>(`/slides/${slideId}/detections/region`, {
      params: { jobId, ...bounds },
    });
  },

  /**
   * Get detection statistics
   */
  getStatistics: async (slideId: string, jobId: string) => {
    return apiClient.get<DetectionStatistics>(`/slides/${slideId}/detections/statistics`, {
      params: { jobId },
    });
  },

  /**
   * Get detection by ID
   */
  getDetectionById: async (slideId: string, detectionId: string) => {
    return apiClient.get<Detection>(`/slides/${slideId}/detections/${detectionId}`);
  },

  /**
   * Export detections
   */
  exportDetections: async (slideId: string, jobId: string, format: 'json' | 'csv') => {
    return apiClient.get(`/slides/${slideId}/detections/export`, {
      params: { jobId, format },
      responseType: 'blob',
    });
  },
};
