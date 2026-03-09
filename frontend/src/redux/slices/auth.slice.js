import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_Base = axios.create({
  baseURL: `${import.meta.env.VITE_Backend_URL}/api/auth`,
  withCredentials: true,
});

export const register = createAsyncThunk(
  "auth/register",
  async (userdata, { rejectWithValue }) => {
    try {
      const response = await API_Base.post(`/register`, userdata);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Registration failed",
      );
    }
  },
);

export const login = createAsyncThunk(
  "auth/login",
  async (userData, { rejectWithValue }) => {
    try {
      const response = await API_Base.post(`/login`, userData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Login failed");
    }
  },
);

export const logout = createAsyncThunk("auth/logout", async () => {
  await API_Base.post(`/logout`, {});
});

export const forgot = createAsyncThunk(
  "/forgot",
  async (email, { rejectWithValue }) => {
    try {
      const response = await API_Base.post(`/forgot`, { email });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Forgot password request failed!",
      );
    }
  },
);

export const verifyOtp = createAsyncThunk(
  "auth/verify-otp",
  async (data, { rejectWithValue }) => {
    try {
      const response = await API_Base.post(`/verify-otp`, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Verification failed!",
      );
    }
  },
);

export const resetPassword = createAsyncThunk(
  "auth/reset-password",
  async (data, { rejectWithValue }) => {
    try {
      const response = await API_Base.post(`/reset-password`, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Verification failed!",
      );
    }
  },
);

export const getUserHistory = createAsyncThunk(
  "auth/get_all_activity",
  async (_, { rejectWithValue }) => {
    try {
      const response = await API_Base.get(`/get_all_activity`);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetching history!",
      );
    }
  },
);

export const addToHistory = createAsyncThunk(
  "auth/add_to_activity",
  async (data, { rejectWithValue }) => {
    try {
      const response = await API_Base.post(`/add_to_activity`, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Add to activity failed",
      );
    }
  },
);

export const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: null,
    isAuth: false,
    isLoading: false,
    error: null,
    userHistory: [],
    addHistory: null
  },
  selectors: {
    user: (state) => state.user,
    isAuth: (state) => state.isAuth,
    loader: (state) => state.isLoading,
    error: (state) => state.error,
    userAllHistory: (state)=> state.userHistory,
    addToHistory: (state)=> state.addHistory
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(register.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.isAuth = false;
        state.error = null;
      })
      .addCase(verifyOtp.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.isAuth = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.isAuth = true;
        state.error = null;
      })
      .addCase(logout.fulfilled, (state) => {
        state.isLoading = false;
        state.user = null;
        state.isAuth = false;
        state.error = null;
      })
            .addCase(getUserHistory.fulfilled, (state, action) => {
        state.userHistory = action.payload;
      })
            .addCase(addToHistory.fulfilled, (state, action) => {
        state.addHistory = action.payload.data;
      })
      .addMatcher(
        (action) => action.type.endsWith("/pending"),
        (state) => {
          state.isLoading = true;
          state.error = null;
        },
      )
      .addMatcher(
        (action) => action.type.endsWith("/rejected"),
        (state, action) => {
          state.isLoading = false;
          state.error = action.payload || action.error.message;
        },
      );
  },
});

export const { user, isAuth, loader, error, userAllHistory, addHistory  } = authSlice.selectors;
export const { clearError } = authSlice.actions;
export default authSlice.reducer;
