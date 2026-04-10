"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { isAuthenticated, isVerified, refresh } = useAuthStore();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const init = async () => {
      await refresh();
      const store = useAuthStore.getState();
      if (!store.isAuthenticated) {
        router.replace("/login");
        return;
      }
      if (!store.isVerified) {
        router.replace("/verify-email");
        return;
      }
      setReady(true);
    };
    init();
  }, []);  // eslint-disable-line

  if (!ready) {
    return (
      <div className="min-h-screen bg-[#0f1011] flex items-center justify-center">
        <span className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  return <>{children}</>;
}
