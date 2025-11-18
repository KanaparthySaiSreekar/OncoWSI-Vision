/**
 * Redux Store Configuration
 * Central store setup with all slices
 */

import { configureStore } from '@reduxjs/toolkit';
import slidesReducer from '../features/slides/slidesSlice';
import inferenceReducer from '../features/inference/inferenceSlice';
import detectionsReducer from '../features/detections/detectionsSlice';
import workspaceReducer from '../features/workspace/workspaceSlice';
import authReducer from '../features/auth/authSlice';

export const store = configureStore({
  reducer: {
    slides: slidesReducer,
    inference: inferenceReducer,
    detections: detectionsReducer,
    workspace: workspaceReducer,
    auth: authReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types
        ignoredActions: ['slides/uploadSlide/fulfilled'],
        // Ignore these field paths in all actions
        ignoredActionPaths: ['payload.file'],
        // Ignore these paths in the state
        ignoredPaths: ['slides.uploadProgress'],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
