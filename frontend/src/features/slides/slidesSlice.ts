/**
 * Slides Redux Slice
 * State management for WSI slides
 */

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Slide, SlideStatus, SlideUploadProgress } from '../../types';
import { slidesApi } from '../../services/api/slides';

interface SlidesState {
  slides: Record<string, Slide>;
  slidesList: string[];
  currentSlideId: string | null;
  uploadProgress: Record<string, SlideUploadProgress>;
  loading: boolean;
  error: string | null;
}

const initialState: SlidesState = {
  slides: {},
  slidesList: [],
  currentSlideId: null,
  uploadProgress: {},
  loading: false,
  error: null,
};

// Async thunks
export const fetchSlides = createAsyncThunk(
  'slides/fetchSlides',
  async () => {
    const response = await slidesApi.getSlides();
    return response.data;
  }
);

export const fetchSlideById = createAsyncThunk(
  'slides/fetchSlideById',
  async (slideId: string) => {
    const response = await slidesApi.getSlideById(slideId);
    return response.data;
  }
);

export const uploadSlide = createAsyncThunk(
  'slides/uploadSlide',
  async (file: File, { dispatch }) => {
    const response = await slidesApi.uploadSlide(file, (progress) => {
      dispatch(updateUploadProgress({
        slideId: progress.slideId,
        progress: progress.progress,
        speed: progress.speed,
        remainingTime: progress.remainingTime,
      }));
    });
    return response.data;
  }
);

export const deleteSlide = createAsyncThunk(
  'slides/deleteSlide',
  async (slideId: string) => {
    await slidesApi.deleteSlide(slideId);
    return slideId;
  }
);

const slidesSlice = createSlice({
  name: 'slides',
  initialState,
  reducers: {
    setCurrentSlide: (state, action: PayloadAction<string | null>) => {
      state.currentSlideId = action.payload;
    },
    updateSlideStatus: (state, action: PayloadAction<{ slideId: string; status: SlideStatus }>) => {
      const { slideId, status } = action.payload;
      if (state.slides[slideId]) {
        state.slides[slideId].status = status;
      }
    },
    updateUploadProgress: (state, action: PayloadAction<SlideUploadProgress>) => {
      state.uploadProgress[action.payload.slideId] = action.payload;
    },
    clearUploadProgress: (state, action: PayloadAction<string>) => {
      delete state.uploadProgress[action.payload];
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch slides
      .addCase(fetchSlides.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSlides.fulfilled, (state, action) => {
        state.loading = false;
        action.payload.forEach((slide: Slide) => {
          state.slides[slide.id] = slide;
        });
        state.slidesList = action.payload.map((s: Slide) => s.id);
      })
      .addCase(fetchSlides.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch slides';
      })
      // Fetch slide by ID
      .addCase(fetchSlideById.fulfilled, (state, action) => {
        state.slides[action.payload.id] = action.payload;
        if (!state.slidesList.includes(action.payload.id)) {
          state.slidesList.push(action.payload.id);
        }
      })
      // Upload slide
      .addCase(uploadSlide.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(uploadSlide.fulfilled, (state, action) => {
        state.loading = false;
        state.slides[action.payload.id] = action.payload;
        state.slidesList.unshift(action.payload.id);
        delete state.uploadProgress[action.payload.id];
      })
      .addCase(uploadSlide.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to upload slide';
      })
      // Delete slide
      .addCase(deleteSlide.fulfilled, (state, action) => {
        delete state.slides[action.payload];
        state.slidesList = state.slidesList.filter(id => id !== action.payload);
        if (state.currentSlideId === action.payload) {
          state.currentSlideId = null;
        }
      });
  },
});

export const {
  setCurrentSlide,
  updateSlideStatus,
  updateUploadProgress,
  clearUploadProgress,
  clearError,
} = slidesSlice.actions;

export default slidesSlice.reducer;
