"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import pb from "@/lib/pb";
import { useAuthStore } from "@/store/authStore";

export default function VerifyEmailPage() {
  const router = useRouter();
  const { user, logout, setFromPb } = useAuthStore();
  const [resending, setResending] = useState(false);
  const [resent, setResent] = useState(false);
  const [checking, setChecking] = useState(false);

  const handleResend = async () => {
    if (!user?.email) return;
    setResending(true);
    try {
      await pb.collection("users").requestVerification(user.email);
      setResent(true);
    } catch {
      // silently fail
    } finally {
      setResending(false);
    }
  };

  const handleCheck = async () => {
    setChecking(true);
    try {
      await pb.collection("users").authRefresh();
      setFromPb();
      const record = pb.authStore.record;
      if (record?.verified) {
        router.push("/dashboard");
      } else {
        alert("Email belum diverifikasi. Periksa inbox Anda.");
      }
    } catch {
      // token might be stale
    } finally {
      setChecking(false);
    }
  };

  return (
    <div className="w-full max-w-md text-center">
      {/* Icon */}
      <div className="flex justify-center mb-6">
        <div className="w-20 h-20 rounded-full bg-[#b80014]/10 border border-[#b80014]/30 flex items-center justify-center">
          <svg className="w-10 h-10 text-[#b80014]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>
      </div>

      <h1 className="text-2xl font-headline font-semibold text-white mb-2">
        Periksa Email Anda
      </h1>
      <p className="text-white/50 text-sm mb-2">
        Kami mengirim link verifikasi ke:
      </p>
      <p className="text-white font-medium text-sm mb-6">
        {user?.email ?? "email Anda"}
      </p>

      <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-3">
        {/* Check status */}
        <button
          id="btn-check-verification"
          onClick={handleCheck}
          disabled={checking}
          className="w-full py-3 bg-[#b80014] hover:bg-[#e21b23] disabled:opacity-60
            text-white font-semibold text-sm rounded-xl transition-colors flex items-center justify-center gap-2"
        >
          {checking ? (
            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : null}
          Saya Sudah Verifikasi
        </button>

        {/* Resend */}
        <button
          id="btn-resend-email"
          onClick={handleResend}
          disabled={resending || resent}
          className="w-full py-3 bg-white/5 hover:bg-white/10 disabled:opacity-50
            text-white/70 font-medium text-sm rounded-xl transition-colors border border-white/10"
        >
          {resent ? "✓ Email terkirim ulang" : resending ? "Mengirim..." : "Kirim Ulang Email"}
        </button>

        <button
          onClick={() => logout().then(() => router.push("/login"))}
          className="text-xs text-white/30 hover:text-white/50 transition-colors"
        >
          Keluar dan gunakan akun lain
        </button>
      </div>

      <p className="mt-6 text-xs text-white/30">
        Tidak menerima email? Periksa folder spam atau{" "}
        <Link href="/login" className="text-[#b80014] hover:underline">
          coba login kembali
        </Link>
        .
      </p>
    </div>
  );
}
