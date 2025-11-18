/**
 * Inference Redux Slice
 * State management for biomarker inference
 */

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { InferenceJob, InferenceStatus, ModelMetadata, InferenceConfig } from '../../types';
import { inferenceApi } from '../../services/api/inference';

interface InferenceState {
  jobs: Record<string, InferenceJob>;
  jobsList: string[];
  models: Record<string, ModelMetadata>;
  modelsList: string[];
  currentJobId: string | null;
  loading: boolean;
  error: string | null;
}

const initialState: InferenceState = {
  jobs: {},
  jobsList: [],
  models: {},
  modelsList: [],
  currentJobId: null,
  loading: false,
  error: null,
};

// Async thunks
export const fetchModels = createAsyncThunk(
  'inference/fetchModels',
  async () => {
    const response = await inferenceApi.getModels();
    return response.data;
  }
);

export const fetchInferenceJobs = createAsyncThunk(
  'inference/fetchJobs',
  async (slideId?: string) => {
    const response = await inferenceApi.getJobs(slideId);
    return response.data;
  }
);

export const createInferenceJob = createAsyncThunk(
  'inference/createJob',
  async (params: { slideId: string; config: InferenceConfig }) => {
    const response = await inferenceApi.createJob(params.slideId, params.config);
    return response.data;
  }
);

export const createBatchInference = createAsyncThunk(
  'inference/createBatch',
  async (params: { slideIds: string[]; config: InferenceConfig }) => {
    const response = await inferenceApi.createBatchJob(params.slideIds, params.config);
    return response.data;
  }
);

export const cancelInferenceJob = createAsyncThunk(
  'inference/cancelJob',
  async (jobId: string) => {
    await inferenceApi.cancelJob(jobId);
    return jobId;
  }
);

const inferenceSlice = createSlice({
  name: 'inference',
  initialState,
  reducers: {
    updateJobProgress: (state, action: PayloadAction<{
      jobId: string;
      progress: number;
      tilesProcessed: number;
      detectionCount: number;
      estimatedTimeRemaining?: number;
    }>) => {
      const { jobId, ...updates } = action.payload;
      if (state.jobs[jobId]) {
        Object.assign(state.jobs[jobId], updates);
      }
    },
    updateJobStatus: (state, action: PayloadAction<{
      jobId: string;
      status: InferenceStatus;
      error?: string;
    }>) => {
      const { jobId, status, error } = action.payload;
      if (state.jobs[jobId]) {
        state.jobs[jobId].status = status;
        if (error) {
          state.jobs[jobId].error = error;
        }
        if (status === InferenceStatus.COMPLETED) {
          state.jobs[jobId].completedAt = new Date().toISOString();
        }
      }
    },
    setCurrentJob: (state, action: PayloadAction<string | null>) => {
      state.currentJobId = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch models
      .addCase(fetchModels.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchModels.fulfilled, (state, action) => {
        state.loading = false;
        action.payload.forEach((model: ModelMetadata) => {
          state.models[model.id] = model;
        });
        state.modelsList = action.payload.map((m: ModelMetadata) => m.id);
      })
      .addCase(fetchModels.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch models';
      })
      // Fetch jobs
      .addCase(fetchInferenceJobs.fulfilled, (state, action) => {
        action.payload.forEach((job: InferenceJob) => {
          state.jobs[job.id] = job;
        });
        state.jobsList = action.payload.map((j: InferenceJob) => j.id);
      })
      // Create job
      .addCase(createInferenceJob.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createInferenceJob.fulfilled, (state, action) => {
        state.loading = false;
        state.jobs[action.payload.id] = action.payload;
        state.jobsList.unshift(action.payload.id);
        state.currentJobId = action.payload.id;
      })
      .addCase(createInferenceJob.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to create inference job';
      })
      // Cancel job
      .addCase(cancelInferenceJob.fulfilled, (state, action) => {
        if (state.jobs[action.payload]) {
          state.jobs[action.payload].status = InferenceStatus.CANCELLED;
        }
      });
  },
});

export const {
  updateJobProgress,
  updateJobStatus,
  setCurrentJob,
  clearError,
} = inferenceSlice.actions;

export default inferenceSlice.reducer;
