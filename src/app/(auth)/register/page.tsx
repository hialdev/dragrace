"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import Link from "next/link";
import pb from "@/lib/pb";
import {
  registerOtpSchema,
  registerPasswordSchema,
  type RegisterOtpForm,
  type RegisterPasswordForm,
} from "@/schemas/auth.schema";
import { useAuthStore } from "@/store/authStore";

export default function RegisterPage() {
  const router = useRouter();
  const { setFromPb } = useAuthStore();
  const [serverError, setServerError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // OTP toggle — aktif secara default (tidak perlu password)
  const [useOtp, setUseOtp] = useState(true);

  // Show/hide password
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);

  // OTP mode form
  const otpForm = useForm<RegisterOtpForm>({
    resolver: zodResolver(registerOtpSchema),
  });

  // Password mode form
  const passwordForm = useForm<RegisterPasswordForm>({
    resolver: zodResolver(registerPasswordSchema),
  });

  const onSubmitOtp = async (data: RegisterOtpForm) => {
    setIsLoading(true);
    setServerError("");
    try {
      const PB_URL = process.env.NEXT_PUBLIC_PB_URL ?? "http://127.0.0.1:8090";

      // Use custom backend endpoint that creates user WITHOUT password
      const res = await fetch(`${PB_URL}/api/auth/register-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: data.email,
          full_name: data.full_name,
          phone: data.phone,
        }),
      });

      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}));
        const emailErr = errBody?.data?.email?.message;
        if (emailErr?.includes("unique") || emailErr?.includes("terdaftar")) {
          setServerError("Email ini sudah terdaftar. Silakan login.");
        } else {
          setServerError(errBody?.message ?? "Pendaftaran gagal. Coba lagi.");
        }
        return;
      }

      // Verification email already sent by backend.
      // Store email so verify-email page can auto-login (OTP-registered users have no session).
      sessionStorage.setItem("otp_register_email", data.email);
      sessionStorage.setItem("post_verify_redirect", "/dashboard/team/order-boarding");

      router.push("/verify-email");
    } catch (err: any) {
      setServerError("Koneksi gagal. Periksa jaringan dan coba lagi.");
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmitPassword = async (data: RegisterPasswordForm) => {
    setIsLoading(true);
    setServerError("");
    try {
      // Create user account dengan password
      await pb.collection("users").create({
        email: data.email,
        password: data.password,
        passwordConfirm: data.passwordConfirm,
        full_name: data.full_name,
        phone: data.phone,
        role: "team_manager",
      });

      // Request email verification
      await pb.collection("users").requestVerification(data.email);

      // Auto-login via password agar user terautentikasi
      await pb.collection("users").authWithPassword(data.email, data.password);
      setFromPb();

      // Simpan flag agar verify-email redirect ke boarding setelah verifikasi
      sessionStorage.setItem("post_verify_redirect", "/dashboard/team/order-boarding");

      router.push("/verify-email");
    } catch (err: any) {
      const errData = err?.response?.data;
      if (errData?.email?.message?.includes("unique")) {
        setServerError("Email ini sudah terdaftar. Silakan login.");
      } else {
        setServerError(err?.response?.message ?? "Pendaftaran gagal. Coba lagi.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = useOtp
    ? otpForm.handleSubmit(onSubmitOtp)
    : passwordForm.handleSubmit(onSubmitPassword);

  const errors = useOtp ? otpForm.formState.errors : passwordForm.formState.errors;

  return (
    <div className="w-full max-w-md">
      {/* Brand */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 mb-3">
          <div className="w-8 h-8 bg-[#b80014] rounded-sm flex items-center justify-center">
            <span className="text-white font-bold text-sm">DR</span>
          </div>
          <span className="text-white font-headline font-semibold text-lg tracking-wide">
            STAR DRAG RACE
          </span>
        </div>
        <h1 className="text-2xl font-headline font-semibold text-white">Buat Akun</h1>
        <p className="text-sm text-white/50 mt-1">Daftarkan tim Anda ke event drag race</p>
      </div>

      {/* Card */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur-sm">
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          {/* Full Name */}
          <div>
            <label htmlFor="full_name" className="block text-sm font-medium text-white/70 mb-1.5">
              Nama Lengkap
            </label>
            <input
              id="full_name"
              type="text"
              autoComplete="name"
              placeholder="Nama lengkap Anda"
              className={`w-full px-4 py-3 rounded-xl bg-white/8 border text-white placeholder-white/30 text-sm outline-none transition-all
                focus:ring-2 focus:ring-[#b80014]/50 focus:border-[#b80014]/70
                ${errors.full_name ? "border-red-500/60" : "border-white/10"}`}
              {...(useOtp
                ? otpForm.register("full_name")
                : passwordForm.register("full_name"))}
            />
            {errors.full_name && (
              <p className="mt-1.5 text-xs text-red-400">{errors.full_name.message}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-white/70 mb-1.5">
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="nama@email.com"
              className={`w-full px-4 py-3 rounded-xl bg-white/8 border text-white placeholder-white/30 text-sm outline-none transition-all
                focus:ring-2 focus:ring-[#b80014]/50 focus:border-[#b80014]/70
                ${errors.email ? "border-red-500/60" : "border-white/10"}`}
              {...(useOtp ? otpForm.register("email") : passwordForm.register("email"))}
            />
            {errors.email && (
              <p className="mt-1.5 text-xs text-red-400">{errors.email.message}</p>
            )}
          </div>

          {/* Phone */}
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-white/70 mb-1.5">
              No. HP / WhatsApp
            </label>
            <input
              id="phone"
              type="tel"
              autoComplete="tel"
              placeholder="08xxxxxxxxxx"
              className={`w-full px-4 py-3 rounded-xl bg-white/8 border text-white placeholder-white/30 text-sm outline-none transition-all
                focus:ring-2 focus:ring-[#b80014]/50 focus:border-[#b80014]/70
                ${errors.phone ? "border-red-500/60" : "border-white/10"}`}
              {...(useOtp ? otpForm.register("phone") : passwordForm.register("phone"))}
            />
            {errors.phone && (
              <p className="mt-1.5 text-xs text-red-400">{errors.phone.message}</p>
            )}
          </div>

          {/* OTP Toggle */}
          <div
            onClick={() => setUseOtp((v) => !v)}
            className="flex items-center justify-between px-4 py-3 rounded-xl bg-white/5 border border-white/10 cursor-pointer hover:bg-white/8 transition-colors"
          >
            <div>
              <p className="text-sm font-medium text-white">Login menggunakan OTP</p>
              <p className="text-xs text-white/40 mt-0.5">
                {useOtp
                  ? "Tidak perlu password — masuk via kode email"
                  : "Gunakan password untuk masuk"}
              </p>
            </div>
            {/* Toggle switch */}
            <div
              className={`relative w-11 h-6 rounded-full transition-colors flex-shrink-0 ${
                useOtp ? "bg-[#b80014]" : "bg-white/20"
              }`}
            >
              <div
                className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                  useOtp ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </div>
          </div>

          {/* Password fields — hanya tampil jika useOtp = false */}
          {!useOtp && (
            <>
              {/* Password */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-white/70 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    placeholder="Min. 8 karakter, huruf kapital & angka"
                    className={`w-full pl-4 pr-11 py-3 rounded-xl bg-white/8 border text-white placeholder-white/30 text-sm outline-none transition-all
                      focus:ring-2 focus:ring-[#b80014]/50 focus:border-[#b80014]/70
                      ${"password" in errors && errors.password ? "border-red-500/60" : "border-white/10"}`}
                    {...passwordForm.register("password")}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/70 transition-colors"
                    tabIndex={-1}
                  >
                    <span className="material-symbols-outlined text-[20px]">
                      {showPassword ? "visibility_off" : "visibility"}
                    </span>
                  </button>
                </div>
                {"password" in errors && (errors as { password?: { message?: string } }).password?.message && (
                  <p className="mt-1.5 text-xs text-red-400">{(errors as { password?: { message?: string } }).password?.message}</p>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label htmlFor="passwordConfirm" className="block text-sm font-medium text-white/70 mb-1.5">
                  Konfirmasi Password
                </label>
                <div className="relative">
                  <input
                    id="passwordConfirm"
                    type={showPasswordConfirm ? "text" : "password"}
                    autoComplete="new-password"
                    placeholder="Ulangi password"
                    className={`w-full pl-4 pr-11 py-3 rounded-xl bg-white/8 border text-white placeholder-white/30 text-sm outline-none transition-all
                      focus:ring-2 focus:ring-[#b80014]/50 focus:border-[#b80014]/70
                      ${"passwordConfirm" in errors && errors.passwordConfirm ? "border-red-500/60" : "border-white/10"}`}
                    {...passwordForm.register("passwordConfirm")}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswordConfirm((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/70 transition-colors"
                    tabIndex={-1}
                  >
                    <span className="material-symbols-outlined text-[20px]">
                      {showPasswordConfirm ? "visibility_off" : "visibility"}
                    </span>
                  </button>
                </div>
                {"passwordConfirm" in errors && (errors as { passwordConfirm?: { message?: string } }).passwordConfirm?.message && (
                  <p className="mt-1.5 text-xs text-red-400">{(errors as { passwordConfirm?: { message?: string } }).passwordConfirm?.message}</p>
                )}
              </div>
            </>
          )}

          {/* Server error */}
          {serverError && (
            <div className="px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/30">
              <p className="text-sm text-red-400">{serverError}</p>
            </div>
          )}

          {/* Submit */}
          <button
            id="btn-register"
            type="submit"
            disabled={isLoading}
            className="w-full py-3 px-6 bg-[#b80014] hover:bg-[#e21b23] disabled:opacity-60 disabled:cursor-not-allowed
              text-white font-semibold text-sm rounded-xl transition-colors duration-200 flex items-center justify-center gap-2 mt-2"
          >
            {isLoading ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Mendaftarkan...
              </>
            ) : (
              "Buat Akun"
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-white/40">
            Sudah punya akun?{" "}
            <Link href="/login" className="text-[#b80014] hover:text-[#e21b23] font-medium transition-colors">
              Masuk di sini
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
