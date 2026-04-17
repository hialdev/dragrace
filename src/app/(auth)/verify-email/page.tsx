"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import pb from "@/lib/pb";
import { useAuthStore } from "@/store/authStore";

// Derive the auto-password from email (mirrors Go backend logic)
// #AUTO<local_alphanumeric>123
function deriveOtpPassword(email: string): string {
  const local = email.split("@")[0] ?? "";
  const clean = local.replace(/[^a-zA-Z0-9]/g, "");
  return `#AUTO${clean || "user"}123`;
}

export default function VerifyEmailPage() {
  const router = useRouter();
  const { user, logout, setFromPb } = useAuthStore();
  const [resending, setResending] = useState(false);
  const [resent, setResent] = useState(false);
  const [checking, setChecking] = useState(false);
  const [checkMsg, setCheckMsg] = useState("");

  // If user is not logged in, try to sign them in automatically using the stored email
  // (from sessionStorage set during registration)
  const [pendingEmail, setPendingEmail] = useState<string | null>(null);

  useEffect(() => {
    const stored = sessionStorage.getItem("otp_register_email");
    if (stored) setPendingEmail(stored);
  }, []);

  const handleResend = async () => {
    const email = user?.email ?? pendingEmail;
    if (!email) return;
    setResending(true);
    try {
      await pb.collection("users").requestVerification(email);
      setResent(true);
    } catch {
      // silently fail
    } finally {
      setResending(false);
    }
  };

  const handleCheck = async () => {
    setChecking(true);
    setCheckMsg("");
    try {
      // If user already has an active session, just refresh
      if (pb.authStore.isValid) {
        await pb.collection("users").authRefresh();
        setFromPb();
        const record = pb.authStore.record;
        if (record?.verified) {
          doRedirect();
          return;
        } else {
          setCheckMsg("Email belum diverifikasi. Klik link di email Anda, lalu coba lagi.");
          return;
        }
      }

      // No session — user registered via OTP (no password login yet).
      // Try to sign in with auto-generated password to create a session.
      const email = pendingEmail ?? user?.email;
      if (!email) {
        setCheckMsg("Sesi tidak ditemukan. Silakan login terlebih dahulu.");
        return;
      }

      const autoPass = deriveOtpPassword(email);
      try {
        await pb.collection("users").authWithPassword(email, autoPass);
      } catch {
        // Could not auto-login — ask user to login manually
        setCheckMsg("Gagal membuat sesi. Silakan login di halaman login menggunakan OTP.");
        return;
      }

      // Refresh token to get latest verified status
      try {
        await pb.collection("users").authRefresh();
      } catch {
        // ignore — token from authWithPassword is still valid
      }
      setFromPb();

      // After login, check verification status
      const record = pb.authStore.record;
      if (record?.verified) {
        sessionStorage.removeItem("otp_register_email");
        doRedirect();
      } else {
        setCheckMsg("Email belum diverifikasi. Klik link di email Anda, lalu coba lagi.");
      }
    } catch {
      setCheckMsg("Terjadi kesalahan. Silakan coba lagi.");
    } finally {
      setChecking(false);
    }
  };

  const doRedirect = () => {
    const redirectTo = sessionStorage.getItem("post_verify_redirect") ?? "/dashboard";
    sessionStorage.removeItem("post_verify_redirect");
    router.push(redirectTo);
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
        {user?.email ?? pendingEmail ?? "email Anda"}
      </p>

      <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-3">
        {/* Error/info message */}
        {checkMsg && (
          <div className="px-4 py-3 rounded-xl bg-amber-500/10 border border-amber-500/25 text-left mb-1">
            <p className="text-sm text-amber-300">{checkMsg}</p>
          </div>
        )}

        {/* Step guide */}
        <div className="text-left space-y-2 mb-2">
          {[
            "Buka email Anda dan cari email dari kami",
            "Klik link verifikasi di dalam email",
            "Kembali ke sini dan klik tombol di bawah",
          ].map((step, i) => (
            <div key={i} className="flex items-start gap-3">
              <div className="w-5 h-5 rounded-full bg-[#b80014]/20 border border-[#b80014]/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-[10px] font-bold text-[#b80014]">{i + 1}</span>
              </div>
              <p className="text-white/50 text-xs">{step}</p>
            </div>
          ))}
        </div>

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
          ) : (
            <span className="material-symbols-outlined text-[18px]">check_circle</span>
          )}
          {checking ? "Memeriksa..." : "Saya Sudah Verifikasi"}
        </button>

        {/* Resend */}
        <button
          id="btn-resend-email"
          onClick={handleResend}
          disabled={resending || resent}
          className="w-full py-3 bg-white/5 hover:bg-white/10 disabled:opacity-50
            text-white/70 font-medium text-sm rounded-xl transition-colors border border-white/10"
        >
          {resent ? "✓ Email terkirim ulang" : resending ? "Mengirim..." : "Kirim Ulang Email Verifikasi"}
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
