import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit";
import { apiFetch } from "@/lib/api";
import type { TeamWithRole } from "@/types";

const CURRENT_TEAM_KEY = "devflow.currentTeamId";

interface TeamState {
  teams: TeamWithRole[];
  currentTeamId: string | null;
  loading: boolean;
  creating: boolean;
  error: string | null;
}

const initialState: TeamState = {
  teams: [],
  currentTeamId: null,
  // Start truthy so dependent routes wait on a skeleton rather than flashing the
  // "no team" empty state before the first /api/teams fetch resolves.
  loading: true,
  creating: false,
  error: null,
};

export const fetchTeams = createAsyncThunk<TeamWithRole[]>("teams/fetchTeams", () =>
  apiFetch<TeamWithRole[]>("/api/teams")
);

export const createTeam = createAsyncThunk<TeamWithRole, { name: string }>(
  "teams/createTeam",
  (body) =>
    apiFetch<TeamWithRole>("/api/teams", { method: "POST", body: JSON.stringify(body) })
);

export const deleteTeam = createAsyncThunk<string, string>(
  "teams/deleteTeam",
  async (id) => {
    await apiFetch<{ id: string }>(`/api/teams/${id}`, { method: "DELETE" });
    return id;
  }
);

function persistCurrentTeam(id: string | null) {
  if (typeof window === "undefined") return;
  if (id) window.localStorage.setItem(CURRENT_TEAM_KEY, id);
  else window.localStorage.removeItem(CURRENT_TEAM_KEY);
}

function readPersistedTeam(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(CURRENT_TEAM_KEY);
}

const teamSlice = createSlice({
  name: "teams",
  initialState,
  reducers: {
    setCurrentTeam(state, action: PayloadAction<string>) {
      state.currentTeamId = action.payload;
      persistCurrentTeam(action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTeams.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTeams.fulfilled, (state, action) => {
        state.loading = false;
        state.teams = action.payload;

        const isCurrentValid =
          !!state.currentTeamId && action.payload.some((t) => t.id === state.currentTeamId);
        if (!isCurrentValid) {
          const persisted = readPersistedTeam();
          const restored =
            persisted && action.payload.some((t) => t.id === persisted) ? persisted : null;
          state.currentTeamId = restored ?? action.payload[0]?.id ?? null;
          persistCurrentTeam(state.currentTeamId);
        }
      })
      .addCase(fetchTeams.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? "Failed to load teams";
      })
      .addCase(createTeam.pending, (state) => {
        state.creating = true;
        state.error = null;
      })
      .addCase(createTeam.fulfilled, (state, action) => {
        state.creating = false;
        state.teams.push(action.payload);
        state.currentTeamId = action.payload.id;
        persistCurrentTeam(action.payload.id);
      })
      .addCase(createTeam.rejected, (state, action) => {
        state.creating = false;
        state.error = action.error.message ?? "Failed to create team";
      })
      .addCase(deleteTeam.fulfilled, (state, action) => {
        state.teams = state.teams.filter((team) => team.id !== action.payload);
        if (state.currentTeamId === action.payload) {
          state.currentTeamId = state.teams[0]?.id ?? null;
          persistCurrentTeam(state.currentTeamId);
        }
      })
      .addCase(deleteTeam.rejected, (state, action) => {
        state.error = action.error.message ?? "Failed to delete team";
      });
  },
});

export const { setCurrentTeam } = teamSlice.actions;
export default teamSlice.reducer;
