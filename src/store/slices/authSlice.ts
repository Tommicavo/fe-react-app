import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { User } from "@/models/user.model";

const STORAGE_KEY = "auth_user";

interface AuthState {
  user: User | null;
  isLoggedIn: boolean;
}

function loadFromStorage(): AuthState {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const user = JSON.parse(stored) as User;
      return { user, isLoggedIn: true };
    }
  } catch {
    // corrupted storage
  }
  return { user: null, isLoggedIn: false };
}

const authSlice = createSlice({
  name: "auth",
  initialState: loadFromStorage(),
  reducers: {
    loginSuccess(state, action: PayloadAction<User>) {
      state.user = action.payload;
      state.isLoggedIn = true;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(action.payload));
    },
    logoutUser(state) {
      state.user = null;
      state.isLoggedIn = false;
      localStorage.removeItem(STORAGE_KEY);
    },
  },
});

export const { loginSuccess, logoutUser } = authSlice.actions;
export default authSlice.reducer;
