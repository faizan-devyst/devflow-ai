import { configureStore } from "@reduxjs/toolkit";
import profileReducer from "@/store/slices/profileSlice";
import teamReducer from "@/store/slices/teamSlice";
import standupReducer from "@/store/slices/standupSlice";
import repositoryReducer from "@/store/slices/repositorySlice";
import membersReducer from "@/store/slices/membersSlice";
import invitationsReducer from "@/store/slices/invitationsSlice";

export const store = configureStore({
  reducer: {
    profile: profileReducer,
    teams: teamReducer,
    standups: standupReducer,
    repositories: repositoryReducer,
    members: membersReducer,
    invitations: invitationsReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
