import { create } from "zustand";
import { authService } from "../services/authService";
import { userService } from "../services/userService";
import type { LoginInput, RegisterInput, User } from "../types";

type AuthState = {
  user?: User;
  isAuthenticated: boolean;
  isLoading: boolean;
  hydrate: () => void;
  login: (input: LoginInput) => ReturnType<typeof authService.login>;
  loginWithGoogle: () => ReturnType<typeof authService.loginWithGoogle>;
  register: (input: RegisterInput) => ReturnType<typeof authService.register>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => ReturnType<typeof authService.resetPassword>;
  updateProfile: (profile: Partial<Pick<User, "name" | "avatarUrl">>) => User | undefined;
};

export const useAuthStore = create<AuthState>()((set, get) => ({
  user: undefined,
  isAuthenticated: false,
  isLoading: true,
  hydrate: () => {
    authService.currentUser().then((user) => {
      set({ user, isAuthenticated: Boolean(user), isLoading: false });
    });
  },
  login: async (input) => {
    set({ isLoading: true });
    const result = await authService.login(input);
    set({
      user: result.user,
      isAuthenticated: Boolean(result.user),
      isLoading: false,
    });
    return result;
  },
  loginWithGoogle: async () => {
    set({ isLoading: true });
    const result = await authService.loginWithGoogle();
    if (!result.ok) set({ isLoading: false });
    return result;
  },
  register: async (input) => {
    set({ isLoading: true });
    const result = await authService.register(input);
    set({
      user: result.user,
      isAuthenticated: Boolean(result.user),
      isLoading: false,
    });
    return result;
  },
  logout: async () => {
    await authService.logout();
    set({ user: undefined, isAuthenticated: false, isLoading: false });
  },
  resetPassword: (email) => authService.resetPassword(email),
  updateProfile: (profile) => {
    const user = get().user;
    if (!user) return undefined;
    const updated = userService.updateProfile(user.id, profile);
    if (updated instanceof Promise) {
      updated.then((next) => {
        if (next) set({ user: next });
      });
      return undefined;
    }
    if (updated) set({ user: updated });
    return updated;
  },
}));
