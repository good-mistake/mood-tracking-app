import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { UserState } from "../utils/types";

const initialState: UserState = {
  user: null,
  loading: false,
  error: null,
};
export const login = createAsyncThunk(
  `auth/login`,
  async (credentials: { email: string; password: string }, thunkAPI) => {
    try {
      const res = await axios.post(`/api/login`, credentials);
      return res.data;
    } catch (err) {
      if (axios.isAxiosError(err)) {
        return thunkAPI.rejectWithValue(err.response?.data || "Unknown error");
      }
      return thunkAPI.rejectWithValue("Unknown error");
    }
  }
);
export const signup = createAsyncThunk(
  "auth/signup",
  async (data: { email: string; password: string }, thunkAPI) => {
    try {
      const res = await axios.post("/api/signup", data);
      return res.data;
    } catch (err) {
      if (axios.isAxiosError(err)) {
        return thunkAPI.rejectWithValue(err.response?.data || "Signup failed");
      }
      return thunkAPI.rejectWithValue("Signup failed");
    }
  }
);
export const fetchUserFromToken = createAsyncThunk(
  "user/fetchUserFromToken",
  async (token: string, thunkAPI) => {
    try {
      const response = await fetch("/api/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error("Failed to fetch user");
      const data = await response.json();
      return data.user;
    } catch (err) {
      if (axios.isAxiosError(err)) {
        return thunkAPI.rejectWithValue(err.response?.data || "Unknown error");
      }
      return thunkAPI.rejectWithValue("Failed to fetch user");
    }
  }
);
const user = createSlice({
  name: "user",
  initialState,
  reducers: {
    logout(state, action) {
      state.user = null;
      state.loading = false;
      state.error = null;
      if (action.payload.token) {
        localStorage.removeItem("token");
      }
    },
    updateUserProfile(state, action) {
      state.user = {
        ...state.user,
        ...action.payload,
      };
    },
    setGuestProfile(state, action) {
      state.user = {
        ...state.user,
        ...action.payload,
        moodEntries: action.payload.moodEntries || [],
      };
    },
    updateUserMoodEntries(state, action) {
      if (state.user) {
        state.user.moodEntries = action.payload;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        state.user = action.payload.user;
        if (action.payload.token) {
          localStorage.setItem("token", action.payload.token);
        }
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      .addCase(fetchUserFromToken.fulfilled, (state, action) => {
        if (action.payload) {
          state.user = action.payload;
        }
      });
  },
});

export const {
  logout,
  updateUserProfile,
  setGuestProfile,
  updateUserMoodEntries,
} = user.actions;

export default user.reducer;
