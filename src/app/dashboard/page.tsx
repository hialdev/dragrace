"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";

export default function DashboardPage() {
  const router = useRouter();
  const { dashboardHome, isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated) {
      router.replace(dashboardHome);
    } else {
      router.replace("/login");
    }
  }, [isAuthenticated, dashboardHome, router]);

  return (
    <div className="min-h-screen bg-[#0f1011] flex items-center justify-center">
      <span className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" />
    </div>
  );
}
