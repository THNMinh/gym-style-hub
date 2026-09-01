import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User } from "@/entities/identity/types";
import { parseUserFromToken } from "@/entities/identity/jwt";
import { useWishlistStore } from "@/features/wishlist/store";
import { useCartStore } from "@/features/cart/store";

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  setUser: (user: User | null) => void;
  setSession: (session: { user: User; accessToken?: string | null; refreshToken?: string | null }) => void;
  updateTokens: (accessToken: string, refreshToken: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      setUser: (user) => set({ user }),
      setSession: (session) => {
        const token = session.accessToken ?? null;
        let user = session.user;
        if (token) {
          user = parseUserFromToken(token, user?.email, user?.fullName);
        }
        set({
          user,
          accessToken: token,
          refreshToken: session.refreshToken ?? null,
        });
      },
      updateTokens: (accessToken, refreshToken) => {
        const currentUser = get().user;
        const updatedUser = accessToken
          ? parseUserFromToken(accessToken, currentUser?.email, currentUser?.fullName)
          : currentUser;
        set({
          user: updatedUser,
          accessToken,
          refreshToken,
        });
      },
      logout: () => {
        useWishlistStore.getState().clear();
        useCartStore.getState().clear();
        set({ user: null, accessToken: null, refreshToken: null });
      },
    }),
    { name: "gymkitten-auth" },
  ),
);
