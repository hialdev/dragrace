"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import Link from "next/link";
import pb from "@/lib/pb";
import { registerSchema, type RegisterForm } from "@/schemas/auth.schema";
import { useAuthStore } from "@/store/authStore";

export default function RegisterPage() {
  const router = useRouter();
  const { setFromPb } = useAuthStore();
  const [serverError, setServerError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterForm>({ resolver: zodResolver(registerSchema) });

  const onSubmit = async (data: RegisterForm) => {
    setIsLoading(true);
    setServerError("");
    try {
      // Create user account
      await pb.collection("users").create({
        email: data.email,
        password: data.password,
        passwordConfirm: data.passwordConfirm,
        full_name: data.full_name,
        phone: data.phone,
        role: "team_manager", // default role for public registration
      });

      // Request email verification
      await pb.collection("users").requestVerification(data.email);

      // Auto-login so user is authenticated
      await pb.collection("users").authWithPassword(data.email, data.password);
      setFromPb();

      // Redirect to verify-email notice
      router.push("/verify-email");
    } catch (err: any) {
      const data = err?.response?.data;
      if (data?.email?.message?.includes("unique")) {
        setServerError("Email ini sudah terdaftar. Silakan login.");
      } else {
        setServerError(err?.response?.message ?? "Pendaftaran gagal. Coba lagi.");
      }
    } finally {
      setIsLoading(false);
    }
  };

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
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
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
              {...register("full_name")}
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
              {...register("email")}
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
              {...register("phone")}
            />
            {errors.phone && (
              <p className="mt-1.5 text-xs text-red-400">{errors.phone.message}</p>
            )}
          </div>

          {/* Password */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-white/70 mb-1.5">
              Password
            </label>
            <input
              id="password"
              type="password"
              autoComplete="new-password"
              placeholder="Min. 8 karakter, huruf kapital & angka"
              className={`w-full px-4 py-3 rounded-xl bg-white/8 border text-white placeholder-white/30 text-sm outline-none transition-all
                focus:ring-2 focus:ring-[#b80014]/50 focus:border-[#b80014]/70
                ${errors.password ? "border-red-500/60" : "border-white/10"}`}
              {...register("password")}
            />
            {errors.password && (
              <p className="mt-1.5 text-xs text-red-400">{errors.password.message}</p>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <label htmlFor="passwordConfirm" className="block text-sm font-medium text-white/70 mb-1.5">
              Konfirmasi Password
            </label>
            <input
              id="passwordConfirm"
              type="password"
              autoComplete="new-password"
              placeholder="Ulangi password"
              className={`w-full px-4 py-3 rounded-xl bg-white/8 border text-white placeholder-white/30 text-sm outline-none transition-all
                focus:ring-2 focus:ring-[#b80014]/50 focus:border-[#b80014]/70
                ${errors.passwordConfirm ? "border-red-500/60" : "border-white/10"}`}
              {...register("passwordConfirm")}
            />
            {errors.passwordConfirm && (
              <p className="mt-1.5 text-xs text-red-400">{errors.passwordConfirm.message}</p>
            )}
          </div>

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
