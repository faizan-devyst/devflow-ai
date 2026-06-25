import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { apiFetch } from "@/lib/api";
import type { AuthUser } from "@/types";

interface ProfileState {
  updatingProfile: boolean;
  updatingPassword: boolean;
  error: string | null;
}

const initialState: ProfileState = {
  updatingProfile: false,
  updatingPassword: false,
  error: null,
};

export const updateProfile = createAsyncThunk<AuthUser, { name: string }>(
  "profile/updateProfile",
  ({ name }) =>
    apiFetch<AuthUser>("/api/user/update-profile", {
      method: "PATCH",
      body: JSON.stringify({ name }),
    })
);

export const updatePassword = createAsyncThunk<
  void,
  { currentPassword: string; newPassword: string }
>("profile/updatePassword", async (body) => {
  await apiFetch("/api/user/update-password", {
    method: "PATCH",
    body: JSON.stringify(body),
  });
});

const profileSlice = createSlice({
  name: "profile",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(updateProfile.pending, (state) => {
        state.updatingProfile = true;
        state.error = null;
      })
      .addCase(updateProfile.fulfilled, (state) => {
        state.updatingProfile = false;
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.updatingProfile = false;
        state.error = action.error.message ?? "Failed to update profile";
      })
      .addCase(updatePassword.pending, (state) => {
        state.updatingPassword = true;
        state.error = null;
      })
      .addCase(updatePassword.fulfilled, (state) => {
        state.updatingPassword = false;
      })
      .addCase(updatePassword.rejected, (state, action) => {
        state.updatingPassword = false;
        state.error = action.error.message ?? "Failed to update password";
      });
  },
});

export default profileSlice.reducer;
