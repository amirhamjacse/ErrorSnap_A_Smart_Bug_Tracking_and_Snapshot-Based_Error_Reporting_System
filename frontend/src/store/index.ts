import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./features/auth";

export const store = configureStore({
  reducer: {
    authUser: authReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
