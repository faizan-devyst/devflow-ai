import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { apiFetch } from "@/lib/api";
import type { TeamMemberWithUser, Role } from "@/types";

interface MembersState {
  items: TeamMemberWithUser[];
  loading: boolean;
  updating: boolean;
  error: string | null;
}

const initialState: MembersState = {
  items: [],
  // Truthy so the page paints a skeleton on entry, never an empty roster.
  loading: true,
  updating: false,
  error: null,
};

export const fetchMembers = createAsyncThunk<TeamMemberWithUser[], string>(
  "members/fetch",
  (teamId) => apiFetch<TeamMemberWithUser[]>(`/api/teams/${teamId}/members`)
);

export const updateMemberRole = createAsyncThunk<
  TeamMemberWithUser,
  { teamId: string; userId: string; role: Role }
>("members/updateRole", ({ teamId, userId, role }) =>
  apiFetch<TeamMemberWithUser>(`/api/teams/${teamId}/members/${userId}`, {
    method: "PATCH",
    body: JSON.stringify({ role }),
  })
);

export const removeMember = createAsyncThunk<string, { teamId: string; userId: string }>(
  "members/remove",
  async ({ teamId, userId }) => {
    await apiFetch(`/api/teams/${teamId}/members/${userId}`, { method: "DELETE" });
    return userId;
  }
);

const membersSlice = createSlice({
  name: "members",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchMembers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMembers.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchMembers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? "Failed to load members";
      })
      .addCase(updateMemberRole.pending, (state) => {
        state.updating = true;
      })
      .addCase(updateMemberRole.fulfilled, (state, action) => {
        state.updating = false;
        const index = state.items.findIndex((m) => m.userId === action.payload.userId);
        if (index !== -1) state.items[index] = action.payload;
      })
      .addCase(updateMemberRole.rejected, (state, action) => {
        state.updating = false;
        state.error = action.error.message ?? "Failed to update role";
      })
      .addCase(removeMember.fulfilled, (state, action) => {
        state.items = state.items.filter((m) => m.userId !== action.payload);
      })
      .addCase(removeMember.rejected, (state, action) => {
        state.error = action.error.message ?? "Failed to remove member";
      });
  },
});

export default membersSlice.reducer;
