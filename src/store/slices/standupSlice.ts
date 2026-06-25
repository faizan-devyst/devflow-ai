import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { apiFetch } from "@/lib/api";
import type { StandupWithAuthor } from "@/types";

interface StandupState {
  items: StandupWithAuthor[];
  loading: boolean;
  saving: boolean;
  error: string | null;
}

const initialState: StandupState = {
  items: [],
  // Start truthy so the route paints a skeleton (never an empty state) before the
  // first fetch resolves; the `items.length === 0` gate keeps refetches from blanking.
  loading: true,
  saving: false,
  error: null,
};

export interface CreateStandupInput {
  teamId: string;
  date: string;
  yesterday: string;
  today: string;
  blockers?: string;
}

export interface UpdateStandupInput {
  id: string;
  yesterday?: string;
  today?: string;
  blockers?: string | null;
}

export const fetchStandups = createAsyncThunk<
  StandupWithAuthor[],
  { teamId: string; date?: string }
>("standups/fetch", ({ teamId, date }) => {
  const params = new URLSearchParams({ teamId });
  if (date) params.set("date", date);
  return apiFetch<StandupWithAuthor[]>(`/api/standups?${params.toString()}`);
});

export const createStandup = createAsyncThunk<StandupWithAuthor, CreateStandupInput>(
  "standups/create",
  (input) =>
    apiFetch<StandupWithAuthor>("/api/standups", {
      method: "POST",
      body: JSON.stringify(input),
    })
);

export const updateStandup = createAsyncThunk<StandupWithAuthor, UpdateStandupInput>(
  "standups/update",
  ({ id, ...fields }) =>
    apiFetch<StandupWithAuthor>(`/api/standups/${id}`, {
      method: "PATCH",
      body: JSON.stringify(fields),
    })
);

export const deleteStandup = createAsyncThunk<string, string>(
  "standups/delete",
  async (id) => {
    await apiFetch<{ id: string }>(`/api/standups/${id}`, { method: "DELETE" });
    return id;
  }
);

const standupSlice = createSlice({
  name: "standups",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchStandups.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchStandups.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchStandups.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? "Failed to load standups";
      })
      .addCase(createStandup.pending, (state) => {
        state.saving = true;
        state.error = null;
      })
      .addCase(createStandup.fulfilled, (state, action) => {
        state.saving = false;
        state.items.unshift(action.payload);
      })
      .addCase(createStandup.rejected, (state, action) => {
        state.saving = false;
        state.error = action.error.message ?? "Failed to create standup";
      })
      .addCase(updateStandup.pending, (state) => {
        state.saving = true;
        state.error = null;
      })
      .addCase(updateStandup.fulfilled, (state, action) => {
        state.saving = false;
        const index = state.items.findIndex((item) => item.id === action.payload.id);
        if (index !== -1) state.items[index] = action.payload;
      })
      .addCase(updateStandup.rejected, (state, action) => {
        state.saving = false;
        state.error = action.error.message ?? "Failed to update standup";
      })
      .addCase(deleteStandup.fulfilled, (state, action) => {
        state.items = state.items.filter((item) => item.id !== action.payload);
      })
      .addCase(deleteStandup.rejected, (state, action) => {
        state.error = action.error.message ?? "Failed to delete standup";
      });
  },
});

export default standupSlice.reducer;
