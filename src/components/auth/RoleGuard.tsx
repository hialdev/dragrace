"use client";

import { useAuthStore } from "@/store/authStore";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Role } from "@/lib/pb";

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles: Role[];
}

export default function RoleGuard({ children, allowedRoles }: RoleGuardProps) {
  const { role, isAuthenticated, isLoading } = useAuthStore();
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [hasChecked, setHasChecked] = useState(false);

  useEffect(() => {
    // Wait for the auth store to finish any initial loads
    if (isLoading) return;

    if (isAuthenticated) {
      if (role && (allowedRoles.includes(role) || role === "superadmin")) {
        setIsAuthorized(true);
      } else {
        setIsAuthorized(false);
        router.replace("/unauthorized");
      }
    }
    
    setHasChecked(true);
  }, [role, isAuthenticated, isLoading, router, allowedRoles]);

  // Don't render children until we've checked and confirmed authorization
  if (!hasChecked || !isAuthorized) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center bg-[#0f1011]">
        <span className="w-6 h-6 border-2 border-[#b80014]/20 border-t-[#b80014] rounded-full animate-spin" />
      </div>
    );
  }

  return <>{children}</>;
}
