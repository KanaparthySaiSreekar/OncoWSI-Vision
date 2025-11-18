/**
 * Inference API Service
 * API calls for model inference
 */

import { apiClient } from './client';
import { InferenceJob, InferenceBatch, ModelMetadata, InferenceConfig } from '../../types';

export const inferenceApi = {
  /**
   * Get available models
   */
  getModels: async () => {
    return apiClient.get<ModelMetadata[]>('/models');
  },

  /**
   * Get model by ID
   */
  getModelById: async (modelId: string) => {
    return apiClient.get<ModelMetadata>(`/models/${modelId}`);
  },

  /**
   * Get all inference jobs
   */
  getJobs: async (slideId?: string) => {
    const params = slideId ? { slideId } : {};
    return apiClient.get<InferenceJob[]>('/inference/jobs', { params });
  },

  /**
   * Get job by ID
   */
  getJobById: async (jobId: string) => {
    return apiClient.get<InferenceJob>(`/inference/jobs/${jobId}`);
  },

  /**
   * Create new inference job
   */
  createJob: async (slideId: string, config: InferenceConfig) => {
    return apiClient.post<InferenceJob>('/inference/jobs', {
      slideId,
      ...config,
    });
  },

  /**
   * Create batch inference job
   */
  createBatchJob: async (slideIds: string[], config: InferenceConfig) => {
    return apiClient.post<InferenceBatch>('/inference/batch', {
      slideIds,
      ...config,
    });
  },

  /**
   * Cancel inference job
   */
  cancelJob: async (jobId: string) => {
    return apiClient.post(`/inference/jobs/${jobId}/cancel`);
  },

  /**
   * Get job progress
   */
  getJobProgress: async (jobId: string) => {
    return apiClient.get(`/inference/jobs/${jobId}/progress`);
  },
};
