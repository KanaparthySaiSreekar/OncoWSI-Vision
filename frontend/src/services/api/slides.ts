/**
 * Slides API Service
 * API calls for slide management
 */

import { apiClient } from './client';
import { Slide, SlideValidation } from '../../types';

export interface UploadProgressCallback {
  (progress: {
    slideId: string;
    progress: number;
    speed: number;
    remainingTime: number;
  }): void;
}

export const slidesApi = {
  /**
   * Get all slides
   */
  getSlides: async () => {
    return apiClient.get<Slide[]>('/slides');
  },

  /**
   * Get slide by ID
   */
  getSlideById: async (slideId: string) => {
    return apiClient.get<Slide>(`/slides/${slideId}`);
  },

  /**
   * Upload a new slide
   */
  uploadSlide: async (file: File, onProgress?: UploadProgressCallback) => {
    const formData = new FormData();
    formData.append('file', file);

    const slideId = crypto.randomUUID();

    return apiClient.post<Slide>('/slides/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const progress = (progressEvent.loaded / progressEvent.total) * 100;
          const speed = progressEvent.rate || 0;
          const remainingTime = progressEvent.estimated || 0;

          onProgress({
            slideId,
            progress,
            speed,
            remainingTime,
          });
        }
      },
    });
  },

  /**
   * Validate slide file
   */
  validateSlide: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);

    return apiClient.post<SlideValidation>('/slides/validate', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  /**
   * Delete a slide
   */
  deleteSlide: async (slideId: string) => {
    return apiClient.delete(`/slides/${slideId}`);
  },

  /**
   * Get slide metadata
   */
  getSlideMetadata: async (slideId: string) => {
    return apiClient.get(`/slides/${slideId}/metadata`);
  },

  /**
   * Get slide thumbnail
   */
  getSlideThumbnail: async (slideId: string) => {
    return apiClient.get(`/slides/${slideId}/thumbnail`, {
      responseType: 'blob',
    });
  },

  /**
   * Get tile URL for viewer
   */
  getTileUrl: (slideId: string, level: number, x: number, y: number) => {
    return `${apiClient.defaults.baseURL}/slides/${slideId}/tiles/${level}/${x}/${y}`;
  },
};
