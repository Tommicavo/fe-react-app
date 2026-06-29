import { configureStore } from "@reduxjs/toolkit";
import modelsReducer from "./slices/modelsSlice";
import categoriesReducer from "./slices/categoriesSlice";
import authReducer from "./slices/authSlice";

export const store = configureStore({
  reducer: {
    models: modelsReducer,
    categories: categoriesReducer,
    auth: authReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
