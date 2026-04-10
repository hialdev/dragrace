"use client";

import { useEffect } from "react";
import { initAuth } from "@/store/authStore";

/**
 * AuthProvider — mounts once at root, initializes PocketBase auth sync.
 * Does NOT render anything visible.
 */
export default function AuthProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    initAuth();
  }, []);

  return <>{children}</>;
}
