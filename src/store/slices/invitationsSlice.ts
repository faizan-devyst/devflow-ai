import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { apiFetch } from "@/lib/api";
import type { InvitationWithInviter, Role } from "@/types";

interface InvitationsState {
  items: InvitationWithInviter[];
  loading: boolean;
  sending: boolean;
  error: string | null;
}

const initialState: InvitationsState = {
  items: [],
  // Truthy so the page paints a skeleton on entry, never an empty list.
  loading: true,
  sending: false,
  error: null,
};

export const fetchInvitations = createAsyncThunk<InvitationWithInviter[], string>(
  "invitations/fetch",
  (teamId) => apiFetch<InvitationWithInviter[]>(`/api/invitations?teamId=${teamId}`)
);

export const createInvitation = createAsyncThunk<
  InvitationWithInviter,
  { email: string; teamId: string; role: Role }
>("invitations/create", (body) =>
  apiFetch<InvitationWithInviter>("/api/invitations", {
    method: "POST",
    body: JSON.stringify(body),
  })
);

export const resendInvitation = createAsyncThunk<InvitationWithInviter, string>(
  "invitations/resend",
  (id) => apiFetch<InvitationWithInviter>(`/api/invitations/${id}/resend`, { method: "POST" })
);

export const revokeInvitation = createAsyncThunk<string, string>(
  "invitations/revoke",
  async (id) => {
    await apiFetch(`/api/invitations/${id}`, { method: "DELETE" });
    return id;
  }
);

const invitationsSlice = createSlice({
  name: "invitations",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchInvitations.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchInvitations.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchInvitations.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? "Failed to load invitations";
      })
      .addCase(createInvitation.pending, (state) => {
        state.sending = true;
      })
      .addCase(createInvitation.fulfilled, (state, action) => {
        state.sending = false;
        state.items.unshift(action.payload);
      })
      .addCase(createInvitation.rejected, (state) => {
        state.sending = false;
      })
      .addCase(resendInvitation.fulfilled, (state, action) => {
        const index = state.items.findIndex((i) => i.id === action.payload.id);
        if (index !== -1) state.items[index] = action.payload;
      })
      .addCase(revokeInvitation.fulfilled, (state, action) => {
        const target = state.items.find((i) => i.id === action.payload);
        if (target) target.status = "REVOKED";
      });
  },
});

export default invitationsSlice.reducer;
