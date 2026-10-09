import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import api from "@/lib/api";
import type { LoginRequest, LoginResponse } from "@/types";

interface AuthState {
  token: string | null;
  username: string | null;
  role: string | null;
  status: "idle" | "loading" | "failed";
  error: string | null;
  hydrated: boolean;
}

const initialState: AuthState = {
  token: null,
  username: null,
  role: null,
  status: "idle",
  error: null,
  hydrated: false,
};

export const login = createAsyncThunk<
  LoginResponse,
  LoginRequest,
  { rejectValue: string }
>("auth/login", async (credentials, { rejectWithValue }) => {
  try {
    const response = await api.post<LoginResponse>("/api/auth/login", credentials);
    localStorage.setItem("token", response.data.token);
    localStorage.setItem("username", response.data.username);
    localStorage.setItem("role", response.data.role);
    return response.data;
  } catch (err) {
    if (axios.isAxiosError(err)) {
      if (err.response?.status === 401) {
        return rejectWithValue("Kullanıcı adı veya şifre hatalı.");
      }
      return rejectWithValue(
        err.response?.data?.message ?? "Sunucuya ulaşılamadı. API çalışıyor mu?"
      );
    }
    return rejectWithValue("Beklenmeyen bir hata oluştu.");
  }
});

export const hydrateAuth = createAsyncThunk("auth/hydrate", async () => {
  return {
    token: localStorage.getItem("token"),
    username: localStorage.getItem("username"),
    role: localStorage.getItem("role"),
  };
});

export const logout = createAsyncThunk("auth/logout", async () => {
  localStorage.removeItem("token");
  localStorage.removeItem("username");
  localStorage.removeItem("role");
});

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.status = "idle";
        state.token = action.payload.token;
        state.username = action.payload.username;
        state.role = action.payload.role;
      })
      .addCase(login.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload ?? "Giriş başarısız.";
      })
      .addCase(hydrateAuth.fulfilled, (state, action) => {
        state.token = action.payload.token;
        state.username = action.payload.username;
        state.role = action.payload.role;
        state.hydrated = true;
      })
      .addCase(logout.fulfilled, (state) => {
        state.token = null;
        state.username = null;
        state.role = null;
      });
  },
});

export default authSlice.reducer;