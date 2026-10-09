import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "@/lib/api";
import { getErrorMessage } from "@/lib/errors";
import type { Farmer, FarmerInput, PagedResult } from "@/types";

interface FarmersState {
  items: Farmer[];
  totalCount: number;
  status: "idle" | "loading" | "failed";
  error: string | null;
}

const initialState: FarmersState = {
  items: [],
  totalCount: 0,
  status: "idle",
  error: null,
};

type ThunkConfig = { rejectValue: string };

export const fetchFarmers = createAsyncThunk<
  PagedResult<Farmer>,
  { page: number; pageSize: number; search: string },
  ThunkConfig
>("farmers/fetch", async (params, { rejectWithValue }) => {
  try {
    const response = await api.get<PagedResult<Farmer>>("/api/farmers", {
      params: {
        page: params.page,
        pageSize: params.pageSize,
        search: params.search || undefined,
      },
    });
    return response.data;
  } catch (err) {
    return rejectWithValue(getErrorMessage(err));
  }
});

export const createFarmer = createAsyncThunk<Farmer, FarmerInput, ThunkConfig>(
  "farmers/create",
  async (input, { rejectWithValue }) => {
    try {
      const response = await api.post<Farmer>("/api/farmers", input);
      return response.data;
    } catch (err) {
      return rejectWithValue(getErrorMessage(err));
    }
  }
);

export const updateFarmer = createAsyncThunk<
  void,
  { id: number; input: FarmerInput },
  ThunkConfig
>("farmers/update", async ({ id, input }, { rejectWithValue }) => {
  try {
    await api.put(`/api/farmers/${id}`, input);
  } catch (err) {
    return rejectWithValue(getErrorMessage(err));
  }
});

export const deleteFarmer = createAsyncThunk<number, number, ThunkConfig>(
  "farmers/delete",
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/api/farmers/${id}`);
      return id;
    } catch (err) {
      return rejectWithValue(getErrorMessage(err));
    }
  }
);

const farmersSlice = createSlice({
  name: "farmers",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchFarmers.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchFarmers.fulfilled, (state, action) => {
        state.status = "idle";
        state.items = action.payload.items;
        state.totalCount = action.payload.totalCount;
      })
      .addCase(fetchFarmers.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload ?? "Çiftçiler yüklenemedi.";
      });
  },
});

export default farmersSlice.reducer;