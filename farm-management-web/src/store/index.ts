import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./authSlice";
import farmersReducer from "./farmersSlice";

export const makeStore = () =>
  configureStore({
    reducer: {
      auth: authReducer,
      farmers: farmersReducer,
    },
  });

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];