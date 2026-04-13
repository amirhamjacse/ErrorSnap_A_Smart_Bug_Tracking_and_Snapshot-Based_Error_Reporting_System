import { createSlice } from "@reduxjs/toolkit";
import { user } from "types/user";

export interface authState {
  user: user;
  isInitialized: boolean;
  isLoading: boolean;
}

const initialState: authState = {
  user: null,
  isInitialized: false,
  isLoading: false,
};

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUserLoading: (state) => {
      state.isLoading = true;
    },
    setUser: (state, action) => {
      state.user = action.payload;
      state.isInitialized = true;
      state.isLoading = false;
    },
    removeUser: (state) => {
      state.user = null;
    },
  },
});

export const { setUser, setUserLoading, removeUser } = authSlice.actions;

export default authSlice.reducer;
