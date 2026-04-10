"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import pb, { ROLE_HOME, type Role } from "@/lib/pb";

interface AuthUser {
  id: string;
  email: string;
  full_name: string;
  phone: string;
  role: Role;
  verified: boolean;
  avatar?: string;
}

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  isLoading: boolean;

  // Computed
  isAuthenticated: boolean;
  isVerified: boolean;
  role: Role | null;
  dashboardHome: string;

  // Actions
  setFromPb: () => void;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isLoading: false,
      isAuthenticated: false,
      isVerified: false,
      role: null,
      dashboardHome: "/dashboard",

      setFromPb: () => {
        const model = pb.authStore.record;
        if (!model || !pb.authStore.isValid) {
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            isVerified: false,
            role: null,
            dashboardHome: "/dashboard",
          });
          return;
        }

        const role = (model.role as Role) ?? "team_manager";
        const user: AuthUser = {
          id: model.id,
          email: model.email as string,
          full_name: model.full_name as string ?? "",
          phone: model.phone as string ?? "",
          role,
          verified: model.verified as boolean ?? false,
          avatar: model.avatar as string ?? undefined,
        };

        set({
          user,
          token: pb.authStore.token,
          isAuthenticated: true,
          isVerified: user.verified,
          role,
          dashboardHome: ROLE_HOME[role] ?? "/dashboard",
        });
      },

      logout: async () => {
        pb.authStore.clear();
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          isVerified: false,
          role: null,
          dashboardHome: "/dashboard",
        });
      },

      refresh: async () => {
        try {
          if (!pb.authStore.isValid) return;
          await pb.collection("users").authRefresh();
          get().setFromPb();
        } catch {
          get().logout();
        }
      },
    }),
    {
      name: "dragrace-auth",
      storage: createJSONStorage(() => localStorage),
      // Only persist minimal data; re-sync from PB on mount
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
        isVerified: state.isVerified,
        role: state.role,
        dashboardHome: state.dashboardHome,
      }),
    }
  )
);

// Helper: init auth from PocketBase store on app boot
export function initAuth() {
  if (typeof window === "undefined") return;

  const store = useAuthStore.getState();

  // Restore PB token from persisted store
  const token = store.token;
  if (token && store.user?.id) {
    pb.authStore.save(token, store.user as any);
  }

  // Listen to PB auth changes and sync to Zustand
  pb.authStore.onChange(() => {
    useAuthStore.getState().setFromPb();
  });

  // Initial sync
  store.setFromPb();
}
