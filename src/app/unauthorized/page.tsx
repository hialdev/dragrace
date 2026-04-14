"use client";

import { useAuthStore } from "@/store/authStore";
import { ROLE_HOME } from "@/lib/pb";
import Link from "next/link";

export default function UnauthorizedPage() {
  const { role } = useAuthStore();
  
  // A fallback redirect target if role is empty
  const homeRoute = role && ROLE_HOME[role] ? ROLE_HOME[role] : "/login";

  return (
    <div className="min-h-screen bg-[#0f1011] flex flex-col items-center justify-center p-4">
      <div className="w-24 h-24 bg-[#b80014]/10 rounded-full flex items-center justify-center mb-6 ring-2 ring-[#b80014]/30 shadow-[0_0_30px_rgba(184,0,20,0.2)]">
        <span className="material-symbols-outlined text-[48px] text-[#b80014]">lock</span>
      </div>
      
      <h1 className="text-3xl font-headline font-bold text-white mb-2">Akses Ditolak</h1>
      <p className="text-white/60 text-center max-w-md mb-8">
        Anda tidak memiliki izin (Permission) yang cukup untuk mengakses halaman ini. 
        Silakan kembali ke dashboard Anda.
      </p>

      <Link
        href={homeRoute}
        className="px-6 py-3 bg-[#b80014] hover:bg-[#e21b23] text-white font-semibold text-sm rounded-xl transition-colors shadow-[0_0_15px_rgba(184,0,20,0.3)]"
      >
        Kembali ke Beranda
      </Link>
    </div>
  );
}
