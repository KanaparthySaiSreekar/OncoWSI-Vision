/**
 * Workspace Redux Slice
 * State management for workspaces and sessions
 */

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Workspace, Session, ViewerState } from '../../types';
import { workspaceApi } from '../../services/api/workspace';

interface WorkspaceState {
  workspaces: Record<string, Workspace>;
  workspacesList: string[];
  currentWorkspaceId: string | null;
  currentSession: Session | null;
  autoSaveEnabled: boolean;
  lastSavedAt: string | null;
  loading: boolean;
  error: string | null;
}

const initialState: WorkspaceState = {
  workspaces: {},
  workspacesList: [],
  currentWorkspaceId: null,
  currentSession: null,
  autoSaveEnabled: true,
  lastSavedAt: null,
  loading: false,
  error: null,
};

// Async thunks
export const fetchWorkspaces = createAsyncThunk(
  'workspace/fetchWorkspaces',
  async () => {
    const response = await workspaceApi.getWorkspaces();
    return response.data;
  }
);

export const createWorkspace = createAsyncThunk(
  'workspace/createWorkspace',
  async (params: { name: string; description?: string }) => {
    const response = await workspaceApi.createWorkspace(params);
    return response.data;
  }
);

export const updateWorkspace = createAsyncThunk(
  'workspace/updateWorkspace',
  async (params: { id: string; updates: Partial<Workspace> }) => {
    const response = await workspaceApi.updateWorkspace(params.id, params.updates);
    return response.data;
  }
);

export const deleteWorkspace = createAsyncThunk(
  'workspace/deleteWorkspace',
  async (workspaceId: string) => {
    await workspaceApi.deleteWorkspace(workspaceId);
    return workspaceId;
  }
);

export const saveSession = createAsyncThunk(
  'workspace/saveSession',
  async (session: Session) => {
    const response = await workspaceApi.saveSession(session);
    return response.data;
  }
);

const workspaceSlice = createSlice({
  name: 'workspace',
  initialState,
  reducers: {
    setCurrentWorkspace: (state, action: PayloadAction<string | null>) => {
      state.currentWorkspaceId = action.payload;
    },
    updateViewerState: (state, action: PayloadAction<Partial<ViewerState>>) => {
      if (state.currentSession) {
        state.currentSession.viewerState = {
          ...state.currentSession.viewerState,
          ...action.payload,
        };
        state.currentSession.lastActivityAt = new Date().toISOString();
      }
    },
    toggleAutoSave: (state) => {
      state.autoSaveEnabled = !state.autoSaveEnabled;
    },
    addSlideToWorkspace: (state, action: PayloadAction<{ workspaceId: string; slideId: string }>) => {
      const { workspaceId, slideId } = action.payload;
      const workspace = state.workspaces[workspaceId];
      if (workspace && !workspace.slideIds.includes(slideId)) {
        workspace.slideIds.push(slideId);
        workspace.updatedAt = new Date().toISOString();
      }
    },
    removeSlideFromWorkspace: (state, action: PayloadAction<{
      workspaceId: string;
      slideId: string;
    }>) => {
      const { workspaceId, slideId } = action.payload;
      const workspace = state.workspaces[workspaceId];
      if (workspace) {
        workspace.slideIds = workspace.slideIds.filter(id => id !== slideId);
        workspace.updatedAt = new Date().toISOString();
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch workspaces
      .addCase(fetchWorkspaces.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchWorkspaces.fulfilled, (state, action) => {
        state.loading = false;
        action.payload.forEach((workspace: Workspace) => {
          state.workspaces[workspace.id] = workspace;
        });
        state.workspacesList = action.payload.map((w: Workspace) => w.id);
      })
      .addCase(fetchWorkspaces.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch workspaces';
      })
      // Create workspace
      .addCase(createWorkspace.fulfilled, (state, action) => {
        state.workspaces[action.payload.id] = action.payload;
        state.workspacesList.unshift(action.payload.id);
      })
      // Update workspace
      .addCase(updateWorkspace.fulfilled, (state, action) => {
        state.workspaces[action.payload.id] = action.payload;
      })
      // Delete workspace
      .addCase(deleteWorkspace.fulfilled, (state, action) => {
        delete state.workspaces[action.payload];
        state.workspacesList = state.workspacesList.filter(id => id !== action.payload);
        if (state.currentWorkspaceId === action.payload) {
          state.currentWorkspaceId = null;
        }
      })
      // Save session
      .addCase(saveSession.fulfilled, (state, action) => {
        state.currentSession = action.payload;
        state.lastSavedAt = new Date().toISOString();
      });
  },
});

export const {
  setCurrentWorkspace,
  updateViewerState,
  toggleAutoSave,
  addSlideToWorkspace,
  removeSlideFromWorkspace,
} = workspaceSlice.actions;

export default workspaceSlice.reducer;
