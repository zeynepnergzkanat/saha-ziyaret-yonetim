import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "@/lib/api";
import { getErrorMessage } from "@/lib/errors";
import type { DashboardSummary } from "@/types";

interface DashboardState {
  data: DashboardSummary | null;
  status: "idle" | "loading" | "failed";
  error: string | null;
}

const initialState: DashboardState = {
  data: null,
  status: "idle",
  error: null,
};

export const fetchDashboard = createAsyncThunk<
  DashboardSummary,
  void,
  { rejectValue: string }
>("dashboard/fetch", async (_, { rejectWithValue }) => {
  try {
    const response = await api.get<DashboardSummary>("/api/dashboard/summary");
    return response.data;
  } catch (err) {
    return rejectWithValue(getErrorMessage(err));
  }
});

const dashboardSlice = createSlice({
  name: "dashboard",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboard.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchDashboard.fulfilled, (state, action) => {
        state.status = "idle";
        state.data = action.payload;
      })
      .addCase(fetchDashboard.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload ?? "Dashboard verileri yüklenemedi.";
      });
  },
});

export default dashboardSlice.reducer;