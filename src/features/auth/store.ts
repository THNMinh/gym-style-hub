import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User } from "@/entities/identity/types";
import { useWishlistStore } from "@/features/wishlist/store";

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  setUser: (user: User | null) => void;
  setSession: (session: { user: User; accessToken?: string | null; refreshToken?: string | null }) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      setUser: (user) => set({ user }),
      setSession: (session) =>
        set({
          user: session.user,
          accessToken: session.accessToken ?? null,
          refreshToken: session.refreshToken ?? null,
        }),
      logout: () => {
        useWishlistStore.getState().clear();
        set({ user: null, accessToken: null, refreshToken: null });
      },
    }),
    { name: "gymkitten-auth" },
  ),
);
