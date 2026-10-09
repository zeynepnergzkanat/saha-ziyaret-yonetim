import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "@/lib/api";
import { getErrorMessage } from "@/lib/errors";
import type {
  FarmVisit,
  FarmVisitInput,
  PagedResult,
  VisitStatus,
} from "@/types";

export type VisitUpdateInput = Omit<FarmVisitInput, "farmerId">;

export interface VisitFilters {
  status: VisitStatus | "";
  farmerId: string;
  startDate: string;
  endDate: string;
}

interface VisitsState {
  items: FarmVisit[];
  totalCount: number;
  status: "idle" | "loading" | "failed";
  error: string | null;
}

const initialState: VisitsState = {
  items: [],
  totalCount: 0,
  status: "idle",
  error: null,
};

type ThunkConfig = { rejectValue: string };

export const fetchVisits = createAsyncThunk<
  PagedResult<FarmVisit>,
  { page: number; pageSize: number; filters: VisitFilters },
  ThunkConfig
>("visits/fetch", async ({ page, pageSize, filters }, { rejectWithValue }) => {
  try {
    const response = await api.get<PagedResult<FarmVisit>>("/api/farm-visits", {
      params: {
        page,
        pageSize,
        status: filters.status || undefined,
        farmerId: filters.farmerId || undefined,
        startDate: filters.startDate || undefined,
        endDate: filters.endDate || undefined,
      },
    });
    return response.data;
  } catch (err) {
    return rejectWithValue(getErrorMessage(err));
  }
});

export const createVisit = createAsyncThunk<FarmVisit, FarmVisitInput, ThunkConfig>(
  "visits/create",
  async (input, { rejectWithValue }) => {
    try {
      const response = await api.post<FarmVisit>("/api/farm-visits", input);
      return response.data;
    } catch (err) {
      return rejectWithValue(getErrorMessage(err));
    }
  }
);

export const updateVisit = createAsyncThunk<
  void,
  { id: number; input: VisitUpdateInput },
  ThunkConfig
>("visits/update", async ({ id, input }, { rejectWithValue }) => {
  try {
    await api.put(`/api/farm-visits/${id}`, input);
  } catch (err) {
    return rejectWithValue(getErrorMessage(err));
  }
});

export const deleteVisit = createAsyncThunk<number, number, ThunkConfig>(
  "visits/delete",
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/api/farm-visits/${id}`);
      return id;
    } catch (err) {
      return rejectWithValue(getErrorMessage(err));
    }
  }
);

const visitsSlice = createSlice({
  name: "visits",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchVisits.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchVisits.fulfilled, (state, action) => {
        state.status = "idle";
        state.items = action.payload.items;
        state.totalCount = action.payload.totalCount;
      })
      .addCase(fetchVisits.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload ?? "Ziyaretler yüklenemedi.";
      });
  },
});

export default visitsSlice.reducer;