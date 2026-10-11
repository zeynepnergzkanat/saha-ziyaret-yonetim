import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./authSlice";
import dashboardReducer from "./dashboardSlice";
import farmersReducer from "./farmersSlice";
import visitsReducer from "./visitsSlice";

export const makeStore = () =>
  configureStore({
    reducer: {
      auth: authReducer,
      dashboard: dashboardReducer,
      farmers: farmersReducer,
      visits: visitsReducer,
    },
  });

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];