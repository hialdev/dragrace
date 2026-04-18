"use client";

import { Suspense, useState, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import pb, { ROLE_HOME } from "@/lib/pb";
import {
  loginSchema,
  type LoginForm,
  otpEmailSchema,
  type OtpEmailForm,
} from "@/schemas/auth.schema";
import { useAuthStore } from "@/store/authStore";
import OtpInput from "@/components/OtpInput";

// ── Constants ──────────────────────────────────────────────────
const RESEND_COOLDOWN = 60; // seconds

// ── Types ──────────────────────────────────────────────────────
type LoginMode = "otp" | "password";
type OtpStep = "email" | "code";

// ── Logo ───────────────────────────────────────────────────────
function Logo() {
  return (
    <div className="inline-flex items-center gap-2 mb-3">
      <div className="w-8 h-8 bg-[#b80014] rounded-sm flex items-center justify-center">
        <span className="text-white font-bold text-sm">DR</span>
      </div>
      <span className="text-white font-headline font-semibold text-lg tracking-wide">
        STAR DRAG RACE
      </span>
    </div>
  );
}

// ── Spinner ────────────────────────────────────────────────────
function Spinner() {
  return (
    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
  );
}

// ── Main Form ──────────────────────────────────────────────────
function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const { setFromPb } = useAuthStore();

  // ── Shared state ──────────────────────────────────
  const [mode, setMode] = useState<LoginMode>("otp");
  const [serverError, setServerError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // ── Show/hide password ──────────────────────────
  const [showPassword, setShowPassword] = useState(false);

  // ── OTP state ─────────────────────────────────────
  const [otpStep, setOtpStep] = useState<OtpStep>("email");
  const [otpId, setOtpId] = useState("");
  const [otpEmail, setOtpEmail] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [countdown, setCountdown] = useState(0);

  // ── OTP email form ────────────────────────────────
  const otpEmailForm = useForm<OtpEmailForm>({
    resolver: zodResolver(otpEmailSchema),
  });

  // ── Password form ─────────────────────────────────
  const passwordForm = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  // ── Countdown timer ───────────────────────────────
  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  // ── Redirect helper ───────────────────────────────
  const redirectAfterLogin = useCallback(async () => {
    const record = pb.authStore.record;
    if (!record?.verified) {
      router.push("/verify-email");
      return;
    }
    const role = record?.role as string;
    const redirect = params.get("redirect");

    // Jika ada query redirect, gunakan itu langsung
    if (redirect) {
      router.push(redirect);
      return;
    }

    // Untuk team_manager: cek apakah sudah punya tim
    if (role === "team_manager") {
      try {
        const userId = record.id;
        const PB_URL = process.env.NEXT_PUBLIC_PB_URL ?? "http://127.0.0.1:8090";
        const token = pb.authStore.token;
        const res = await fetch(
          `${PB_URL}/api/collections/teams/records?filter=user%3D"${userId}"&perPage=1`,
          { headers: { Authorization: token } }
        );
        const data = await res.json();
        if (!data?.items?.length) {
          // Belum ada tim → arahkan ke order boarding
          router.push("/dashboard/team/order-boarding");
          return;
        }
      } catch {
        // Gagal cek → fallback ke home biasa
      }
    }

    router.push(ROLE_HOME[role as keyof typeof ROLE_HOME] ?? "/dashboard");
  }, [router, params]);

  // ── OTP Step 1: Request OTP ───────────────────────
  const handleRequestOtp = async (data: OtpEmailForm) => {
    setIsLoading(true);
    setServerError("");
    try {
      // Pre-check: pastikan email terdaftar sebelum requestOTP
      const PB_URL = process.env.NEXT_PUBLIC_PB_URL ?? "http://127.0.0.1:8090";
      const checkRes = await fetch(`${PB_URL}/api/auth/check-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: data.email }),
      });
      if (!checkRes.ok) {
        // 404 = email tidak ditemukan
        setServerError("Email tidak terdaftar. Silakan daftar terlebih dahulu.");
        return;
      }

      // Email valid — lanjut request OTP
      const result = await pb.collection("users").requestOTP(data.email);
      setOtpId(result.otpId);
      setOtpEmail(data.email);
      setOtpStep("code");
      setOtpCode("");
      setCountdown(RESEND_COOLDOWN);
    } catch (err: any) {
      setServerError("Gagal mengirim kode OTP. Periksa koneksi dan coba lagi.");
    } finally {
      setIsLoading(false);
    }
  };

  // ── OTP Step 2: Verify OTP ────────────────────────
  const handleVerifyOtp = async () => {
    if (otpCode.length !== 6) {
      setServerError("Masukkan 6 digit kode OTP.");
      return;
    }
    setIsLoading(true);
    setServerError("");
    try {
      await pb.collection("users").authWithOTP(otpId, otpCode);
      setFromPb();
      redirectAfterLogin();
    } catch (err: any) {
      const msg = err?.response?.message ?? err?.message ?? "";
      if (msg.toLowerCase().includes("expired")) {
        setServerError("Kode OTP sudah kedaluwarsa. Kirim ulang kode baru.");
      } else {
        setServerError("Kode OTP tidak valid. Periksa kembali kode dari email Anda.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // ── Resend OTP ────────────────────────────────────
  const handleResendOtp = async () => {
    if (countdown > 0) return;
    setIsLoading(true);
    setServerError("");
    try {
      const result = await pb.collection("users").requestOTP(otpEmail);
      setOtpId(result.otpId);
      setOtpCode("");
      setCountdown(RESEND_COOLDOWN);
    } catch {
      setServerError("Gagal mengirim ulang kode. Coba beberapa saat lagi.");
    } finally {
      setIsLoading(false);
    }
  };

  // ── Password login ────────────────────────────────
  const handlePasswordLogin = async (data: LoginForm) => {
    setIsLoading(true);
    setServerError("");
    try {
      await pb.collection("users").authWithPassword(data.email, data.password);
      setFromPb();
      redirectAfterLogin();
    } catch (err: any) {
      const status = err?.status ?? err?.response?.code ?? 0;
      const msg = (err?.response?.message ?? err?.message ?? "").toLowerCase();

      if (status === 400 || msg.includes("invalid") || msg.includes("credentials") || msg.includes("failed to authenticate")) {
        // Cek apakah akun ini OTP-only (tidak punya custom password)
        try {
          const PB_URL = process.env.NEXT_PUBLIC_PB_URL ?? "http://127.0.0.1:8090";
          const checkRes = await fetch(`${PB_URL}/api/auth/check-is-otp-only`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: data.email }),
          });
          const checkData = await checkRes.json();
          if (checkData?.is_otp_only) {
            setServerError(
              "Akun tersebut hanya dapat login menggunakan OTP. Gunakan metode \"Login dengan OTP Email\"."
            );
          } else {
            setServerError("Email atau password salah.");
          }
        } catch {
          setServerError("Email atau password salah.");
        }
      } else {
        setServerError("Terjadi kesalahan. Silakan coba lagi.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // ── Switch mode helper ────────────────────────────
  const switchMode = (next: LoginMode) => {
    setMode(next);
    setServerError("");
    setOtpStep("email");
    setOtpCode("");
    setOtpId("");
  };

  // ── Error box ─────────────────────────────────────
  const ErrorBox = ({ msg }: { msg: string }) =>
    msg ? (
      <div className="px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/30">
        <p className="text-sm text-red-400">{msg}</p>
      </div>
    ) : null;

  // ═══════════════════════════════════════════════════════════
  // OTP Mode — Step 1: Email input
  // ═══════════════════════════════════════════════════════════
  const renderOtpEmailStep = () => (
    <form
      onSubmit={otpEmailForm.handleSubmit(handleRequestOtp)}
      className="space-y-5"
      noValidate
    >
      <div>
        <label
          htmlFor="otp-email"
          className="block text-sm font-medium text-white/70 mb-1.5"
        >
          Alamat Email
        </label>
        <input
          id="otp-email"
          type="email"
          autoComplete="email"
          placeholder="nama@email.com"
          disabled={isLoading}
          className={`w-full px-4 py-3 rounded-xl bg-white/8 border text-white placeholder-white/30 text-sm outline-none transition-all focus:ring-2 focus:ring-[#b80014]/50 focus:border-[#b80014]/70 disabled:opacity-60 ${
            otpEmailForm.formState.errors.email
              ? "border-red-500/60"
              : "border-white/10"
          }`}
          {...otpEmailForm.register("email")}
        />
        {otpEmailForm.formState.errors.email && (
          <p className="mt-1.5 text-xs text-red-400">
            {otpEmailForm.formState.errors.email.message}
          </p>
        )}
      </div>

      <ErrorBox msg={serverError} />

      {/* Primary CTA */}
      <button
        id="btn-send-otp"
        type="submit"
        disabled={isLoading}
        className="w-full py-3 px-6 bg-[#b80014] hover:bg-[#e21b23] disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold text-sm rounded-xl transition-colors duration-200 flex items-center justify-center gap-2"
      >
        {isLoading ? (
          <>
            <Spinner />
            Mengirim Kode...
          </>
        ) : (
          <>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            Kirim Kode OTP
          </>
        )}
      </button>

      {/* Secondary: switch to password */}
      <div className="text-center">
        <button
          type="button"
          id="btn-switch-to-password"
          onClick={() => switchMode("password")}
          className="text-sm text-white/40 hover:text-white/70 transition-colors underline underline-offset-2"
        >
          Login dengan Password
        </button>
      </div>
    </form>
  );

  // ═══════════════════════════════════════════════════════════
  // OTP Mode — Step 2: Code input
  // ═══════════════════════════════════════════════════════════
  const renderOtpCodeStep = () => (
    <div className="space-y-5">
      {/* Email indicator */}
      <div className="text-center">
        <p className="text-sm text-white/50">Kode dikirim ke:</p>
        <p className="text-white font-medium text-sm mt-0.5 truncate">{otpEmail}</p>
      </div>

      {/* OTP boxes */}
      <div className="space-y-2">
        <OtpInput
          value={otpCode}
          onChange={(val) => {
            setOtpCode(val);
            setServerError("");
          }}
          hasError={!!serverError}
          disabled={isLoading}
        />
        {serverError && (
          <p className="text-xs text-red-400 text-center">{serverError}</p>
        )}
      </div>

      {/* Primary CTA */}
      <button
        id="btn-verify-otp"
        type="button"
        onClick={handleVerifyOtp}
        disabled={isLoading || otpCode.length < 6}
        className="w-full py-3 px-6 bg-[#b80014] hover:bg-[#e21b23] disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold text-sm rounded-xl transition-colors duration-200 flex items-center justify-center gap-2"
      >
        {isLoading ? (
          <>
            <Spinner />
            Memverifikasi...
          </>
        ) : (
          "Verifikasi & Masuk"
        )}
      </button>

      {/* Resend + back */}
      <div className="flex items-center justify-between text-sm">
        <button
          type="button"
          id="btn-back-otp-email"
          onClick={() => {
            setOtpStep("email");
            setOtpCode("");
            setServerError("");
          }}
          className="text-white/40 hover:text-white/70 transition-colors"
        >
          ← Ganti Email
        </button>

        <button
          type="button"
          id="btn-resend-otp"
          onClick={handleResendOtp}
          disabled={countdown > 0 || isLoading}
          className="text-white/40 hover:text-white/70 disabled:cursor-not-allowed disabled:opacity-50 transition-colors"
        >
          {countdown > 0 ? `Kirim Ulang (${countdown}s)` : "Kirim Ulang Kode"}
        </button>
      </div>
    </div>
  );

  // ═══════════════════════════════════════════════════════════
  // Password Mode
  // ═══════════════════════════════════════════════════════════
  const renderPasswordStep = () => (
    <form
      onSubmit={passwordForm.handleSubmit(handlePasswordLogin)}
      className="space-y-5"
      noValidate
    >
      <div>
        <label
          htmlFor="pw-email"
          className="block text-sm font-medium text-white/70 mb-1.5"
        >
          Email
        </label>
        <input
          id="pw-email"
          type="email"
          autoComplete="email"
          placeholder="nama@email.com"
          disabled={isLoading}
          className={`w-full px-4 py-3 rounded-xl bg-white/8 border text-white placeholder-white/30 text-sm outline-none transition-all focus:ring-2 focus:ring-[#b80014]/50 focus:border-[#b80014]/70 disabled:opacity-60 ${
            passwordForm.formState.errors.email
              ? "border-red-500/60"
              : "border-white/10"
          }`}
          {...passwordForm.register("email")}
        />
        {passwordForm.formState.errors.email && (
          <p className="mt-1.5 text-xs text-red-400">
            {passwordForm.formState.errors.email.message}
          </p>
        )}
      </div>

      <div>
        <label
          htmlFor="pw-password"
          className="block text-sm font-medium text-white/70 mb-1.5"
        >
          Password
        </label>
        <div className="relative">
          <input
            id="pw-password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            placeholder="••••••••"
            disabled={isLoading}
            className={`w-full pl-4 pr-11 py-3 rounded-xl bg-white/8 border text-white placeholder-white/30 text-sm outline-none transition-all focus:ring-2 focus:ring-[#b80014]/50 focus:border-[#b80014]/70 disabled:opacity-60 ${
              passwordForm.formState.errors.password
                ? "border-red-500/60"
                : "border-white/10"
            }`}
            {...passwordForm.register("password")}
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            tabIndex={-1}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">
              {showPassword ? "visibility_off" : "visibility"}
            </span>
          </button>
        </div>
        {passwordForm.formState.errors.password && (
          <p className="mt-1.5 text-xs text-red-400">
            {passwordForm.formState.errors.password.message}
          </p>
        )}
      </div>

      <ErrorBox msg={serverError} />

      <button
        id="btn-login-password"
        type="submit"
        disabled={isLoading}
        className="w-full py-3 px-6 bg-[#b80014] hover:bg-[#e21b23] disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold text-sm rounded-xl transition-colors duration-200 flex items-center justify-center gap-2"
      >
        {isLoading ? (
          <>
            <Spinner />
            Memproses...
          </>
        ) : (
          "Masuk"
        )}
      </button>

      {/* Secondary: switch to OTP */}
      <div className="text-center">
        <button
          type="button"
          id="btn-switch-to-otp"
          onClick={() => switchMode("otp")}
          className="text-sm text-white/40 hover:text-white/70 transition-colors underline underline-offset-2"
        >
          Login dengan OTP Email
        </button>
      </div>
    </form>
  );

  // ═══════════════════════════════════════════════════════════
  // Page title per mode/step
  // ═══════════════════════════════════════════════════════════
  const pageTitle =
    mode === "password"
      ? "Masuk dengan Password"
      : otpStep === "email"
      ? "Masuk ke Akun Anda"
      : "Masukkan Kode OTP";

  const pageSubtitle =
    mode === "password"
      ? "Gunakan email dan password akun Anda"
      : otpStep === "email"
      ? "Kami akan kirimkan kode verifikasi ke email Anda"
      : "Periksa email Anda dan masukkan kode 6 digit";

  // ═══════════════════════════════════════════════════════════
  // Render
  // ═══════════════════════════════════════════════════════════
  return (
    <div className="w-full max-w-md">
      {/* Header */}
      <div className="text-center mb-8">
        <Logo />
        <h1 className="text-2xl font-headline font-semibold text-white transition-all">
          {pageTitle}
        </h1>
        <p className="text-sm text-white/50 mt-1">{pageSubtitle}</p>
      </div>

      {/* Card */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur-sm">
        {mode === "otp" && otpStep === "email" && renderOtpEmailStep()}
        {mode === "otp" && otpStep === "code" && renderOtpCodeStep()}
        {mode === "password" && renderPasswordStep()}

        {/* Register link */}
        <div className="mt-6 pt-5 border-t border-white/8 text-center">
          <p className="text-sm text-white/40">
            Belum punya akun?{" "}
            <Link
              href="/register"
              className="text-[#b80014] hover:text-[#e21b23] font-medium transition-colors"
            >
              Daftar sekarang
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

// ── Page export ─────────────────────────────────────────────────
export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="w-full max-w-md flex justify-center">
          <span className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
