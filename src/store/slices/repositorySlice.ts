import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { apiFetch } from "@/lib/api";
import type { Repository } from "@/types";

interface RepositoryState {
  items: Repository[];
  loading: boolean;
  connecting: boolean;
  error: string | null;
}

const initialState: RepositoryState = {
  items: [],
  // Start truthy so the route paints a skeleton (never an empty state) before the
  // first fetch resolves; the `items.length === 0` gate keeps refetches from blanking.
  loading: true,
  connecting: false,
  error: null,
};

export interface ConnectRepositoryInput {
  teamId: string;
  url: string;
  token?: string;
}

export const fetchRepositories = createAsyncThunk<Repository[], { teamId: string }>(
  "repositories/fetch",
  ({ teamId }) => apiFetch<Repository[]>(`/api/repositories?teamId=${encodeURIComponent(teamId)}`)
);

export const connectRepository = createAsyncThunk<Repository, ConnectRepositoryInput>(
  "repositories/connect",
  (input) =>
    apiFetch<Repository>("/api/repositories", {
      method: "POST",
      body: JSON.stringify(input),
    })
);

export const deleteRepository = createAsyncThunk<string, string>(
  "repositories/delete",
  async (id) => {
    await apiFetch<{ id: string }>(`/api/repositories/${id}`, { method: "DELETE" });
    return id;
  }
);

export const reindexRepository = createAsyncThunk<Repository, { id: string; token?: string }>(
  "repositories/reindex",
  ({ id, token }) =>
    apiFetch<Repository>(`/api/repositories/${id}/reindex`, {
      method: "POST",
      body: JSON.stringify({ token }),
    })
);

export const generateOnboarding = createAsyncThunk<Repository, string>(
  "repositories/generateOnboarding",
  (id) => apiFetch<Repository>(`/api/repositories/${id}/onboarding`, { method: "POST" })
);

const repositorySlice = createSlice({
  name: "repositories",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchRepositories.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRepositories.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchRepositories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? "Failed to load repositories";
      })
      .addCase(connectRepository.pending, (state) => {
        state.connecting = true;
        state.error = null;
      })
      .addCase(connectRepository.fulfilled, (state, action) => {
        state.connecting = false;
        state.items.unshift(action.payload);
      })
      .addCase(connectRepository.rejected, (state, action) => {
        state.connecting = false;
        state.error = action.error.message ?? "Failed to connect repository";
      })
      .addCase(deleteRepository.fulfilled, (state, action) => {
        state.items = state.items.filter((repo) => repo.id !== action.payload);
      })
      .addCase(deleteRepository.rejected, (state, action) => {
        state.error = action.error.message ?? "Failed to delete repository";
      })
      .addCase(reindexRepository.fulfilled, (state, action) => {
        const index = state.items.findIndex((repo) => repo.id === action.payload.id);
        if (index !== -1) state.items[index] = action.payload;
      })
      .addCase(reindexRepository.rejected, (state, action) => {
        state.error = action.error.message ?? "Failed to start re-index";
      })
      .addCase(generateOnboarding.fulfilled, (state, action) => {
        const index = state.items.findIndex((repo) => repo.id === action.payload.id);
        if (index !== -1) state.items[index] = action.payload;
      })
      .addCase(generateOnboarding.rejected, (state, action) => {
        state.error = action.error.message ?? "Failed to generate onboarding doc";
      });
  },
});

export default repositorySlice.reducer;
