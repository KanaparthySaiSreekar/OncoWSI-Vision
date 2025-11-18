/**
 * Detections Redux Slice
 * State management for biomarker detections and visualization
 */

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Detection, DetectionLayer, DetectionStatistics, VisualizationSettings } from '../../types';
import { detectionsApi } from '../../services/api/detections';

interface DetectionsState {
  detections: Record<string, Detection[]>;
  statistics: Record<string, DetectionStatistics>;
  layers: Record<string, DetectionLayer[]>;
  visualizationSettings: VisualizationSettings;
  loading: boolean;
  error: string | null;
}

const initialState: DetectionsState = {
  detections: {},
  statistics: {},
  layers: {},
  visualizationSettings: {
    showBoundingBoxes: true,
    showPolygons: true,
    showConfidenceLabels: true,
    confidenceThreshold: 0.5,
    lineWidth: 2,
    opacity: 0.8,
    colorBlindSafe: false,
  },
  loading: false,
  error: null,
};

// Async thunks
export const fetchDetections = createAsyncThunk(
  'detections/fetchDetections',
  async (params: { slideId: string; jobId: string }) => {
    const response = await detectionsApi.getDetections(params.slideId, params.jobId);
    return { slideId: params.slideId, detections: response.data };
  }
);

export const fetchDetectionStatistics = createAsyncThunk(
  'detections/fetchStatistics',
  async (params: { slideId: string; jobId: string }) => {
    const response = await detectionsApi.getStatistics(params.slideId, params.jobId);
    return { slideId: params.slideId, statistics: response.data };
  }
);

const detectionsSlice = createSlice({
  name: 'detections',
  initialState,
  reducers: {
    setVisualizationSettings: (state, action: PayloadAction<Partial<VisualizationSettings>>) => {
      state.visualizationSettings = {
        ...state.visualizationSettings,
        ...action.payload,
      };
    },
    toggleLayerVisibility: (state, action: PayloadAction<{ slideId: string; classId: number }>) => {
      const { slideId, classId } = action.payload;
      const layers = state.layers[slideId];
      if (layers) {
        const layer = layers.find(l => l.classId === classId);
        if (layer) {
          layer.visible = !layer.visible;
        }
      }
    },
    updateLayerOpacity: (state, action: PayloadAction<{
      slideId: string;
      classId: number;
      opacity: number;
    }>) => {
      const { slideId, classId, opacity } = action.payload;
      const layers = state.layers[slideId];
      if (layers) {
        const layer = layers.find(l => l.classId === classId);
        if (layer) {
          layer.opacity = opacity;
        }
      }
    },
    initializeLayers: (state, action: PayloadAction<{
      slideId: string;
      layers: DetectionLayer[];
    }>) => {
      const { slideId, layers } = action.payload;
      state.layers[slideId] = layers;
    },
    clearDetections: (state, action: PayloadAction<string>) => {
      delete state.detections[action.payload];
      delete state.statistics[action.payload];
      delete state.layers[action.payload];
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch detections
      .addCase(fetchDetections.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDetections.fulfilled, (state, action) => {
        state.loading = false;
        state.detections[action.payload.slideId] = action.payload.detections;
      })
      .addCase(fetchDetections.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch detections';
      })
      // Fetch statistics
      .addCase(fetchDetectionStatistics.fulfilled, (state, action) => {
        state.statistics[action.payload.slideId] = action.payload.statistics;
      });
  },
});

export const {
  setVisualizationSettings,
  toggleLayerVisibility,
  updateLayerOpacity,
  initializeLayers,
  clearDetections,
} = detectionsSlice.actions;

export default detectionsSlice.reducer;
