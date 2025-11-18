/**
 * Auth Redux Slice
 * State management for authentication and authorization
 */

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { User, AuthState, LoginCredentials, Permission } from '../../types';
import { authApi } from '../../services/api/auth';
import { SECURITY_CONFIG } from '../../constants/config';

const initialState: AuthState = {
  isAuthenticated: false,
  user: null,
  token: localStorage.getItem(SECURITY_CONFIG.TOKEN_STORAGE_KEY),
  refreshToken: localStorage.getItem(SECURITY_CONFIG.REFRESH_TOKEN_KEY),
  expiresAt: null,
};

// Async thunks
export const login = createAsyncThunk(
  'auth/login',
  async (credentials: LoginCredentials) => {
    const response = await authApi.login(credentials);
    return response.data;
  }
);

export const logout = createAsyncThunk(
  'auth/logout',
  async () => {
    await authApi.logout();
  }
);

export const refreshToken = createAsyncThunk(
  'auth/refreshToken',
  async (refreshToken: string) => {
    const response = await authApi.refreshToken(refreshToken);
    return response.data;
  }
);

export const fetchCurrentUser = createAsyncThunk(
  'auth/fetchCurrentUser',
  async () => {
    const response = await authApi.getCurrentUser();
    return response.data;
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action: PayloadAction<{
      user: User;
      token: string;
      refreshToken: string;
      expiresAt: number;
    }>) => {
      const { user, token, refreshToken, expiresAt } = action.payload;
      state.user = user;
      state.token = token;
      state.refreshToken = refreshToken;
      state.expiresAt = expiresAt;
      state.isAuthenticated = true;

      localStorage.setItem(SECURITY_CONFIG.TOKEN_STORAGE_KEY, token);
      localStorage.setItem(SECURITY_CONFIG.REFRESH_TOKEN_KEY, refreshToken);
    },
    clearCredentials: (state) => {
      state.user = null;
      state.token = null;
      state.refreshToken = null;
      state.expiresAt = null;
      state.isAuthenticated = false;

      localStorage.removeItem(SECURITY_CONFIG.TOKEN_STORAGE_KEY);
      localStorage.removeItem(SECURITY_CONFIG.REFRESH_TOKEN_KEY);
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(login.fulfilled, (state, action) => {
        const { user, token, refreshToken, expiresIn } = action.payload;
        state.user = user;
        state.token = token;
        state.refreshToken = refreshToken;
        state.expiresAt = Date.now() + expiresIn * 1000;
        state.isAuthenticated = true;

        localStorage.setItem(SECURITY_CONFIG.TOKEN_STORAGE_KEY, token);
        localStorage.setItem(SECURITY_CONFIG.REFRESH_TOKEN_KEY, refreshToken);
      })
      // Logout
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.refreshToken = null;
        state.expiresAt = null;
        state.isAuthenticated = false;

        localStorage.removeItem(SECURITY_CONFIG.TOKEN_STORAGE_KEY);
        localStorage.removeItem(SECURITY_CONFIG.REFRESH_TOKEN_KEY);
      })
      // Refresh token
      .addCase(refreshToken.fulfilled, (state, action) => {
        const { token, refreshToken, expiresIn } = action.payload;
        state.token = token;
        state.refreshToken = refreshToken;
        state.expiresAt = Date.now() + expiresIn * 1000;

        localStorage.setItem(SECURITY_CONFIG.TOKEN_STORAGE_KEY, token);
        localStorage.setItem(SECURITY_CONFIG.REFRESH_TOKEN_KEY, refreshToken);
      })
      // Fetch current user
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        state.user = action.payload;
        state.isAuthenticated = true;
      });
  },
});

export const { setCredentials, clearCredentials } = authSlice.actions;

// Selectors
export const selectCurrentUser = (state: { auth: AuthState }) => state.auth.user;
export const selectIsAuthenticated = (state: { auth: AuthState }) => state.auth.isAuthenticated;
export const selectUserPermissions = (state: { auth: AuthState }): Permission[] =>
  state.auth.user?.permissions || [];

export const selectHasPermission = (state: { auth: AuthState }, permission: Permission): boolean =>
  state.auth.user?.permissions.includes(permission) || false;

export default authSlice.reducer;
