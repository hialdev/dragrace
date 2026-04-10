"use client";

import { Suspense, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import pb, { ROLE_HOME } from "@/lib/pb";
import { loginSchema, type LoginForm } from "@/schemas/auth.schema";
import { useAuthStore } from "@/store/authStore";

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const { setFromPb } = useAuthStore();
  const [serverError, setServerError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({ resolver: zodResolver(loginSchema) });

  const onSubmit = async (data: LoginForm) => {
    setIsLoading(true);
    setServerError("");
    try {
      await pb.collection("users").authWithPassword(data.email, data.password);
      setFromPb();

      const record = pb.authStore.record;
      if (!record?.verified) {
        router.push("/verify-email");
        return;
      }

      const role = record?.role as string;
      const redirect = params.get("redirect");
      router.push(redirect ?? ROLE_HOME[role as keyof typeof ROLE_HOME] ?? "/dashboard");
    } catch (err: any) {
      const msg = err?.response?.message ?? err?.message ?? "";
      if (msg.toLowerCase().includes("invalid") || msg.toLowerCase().includes("credentials")) {
        setServerError("Email atau password salah.");
      } else {
        setServerError("Terjadi kesalahan. Silakan coba lagi.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 mb-3">
          <div className="w-8 h-8 bg-[#b80014] rounded-sm flex items-center justify-center">
            <span className="text-white font-bold text-sm">DR</span>
          </div>
          <span className="text-white font-headline font-semibold text-lg tracking-wide">
            STAR DRAG RACE
          </span>
        </div>
        <h1 className="text-2xl font-headline font-semibold text-white">Selamat Datang</h1>
        <p className="text-sm text-white/50 mt-1">Masuk untuk melanjutkan pendaftaran</p>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur-sm">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-white/70 mb-1.5">
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="nama@email.com"
              className={`w-full px-4 py-3 rounded-xl bg-white/8 border text-white placeholder-white/30 text-sm outline-none transition-all focus:ring-2 focus:ring-[#b80014]/50 focus:border-[#b80014]/70 ${errors.email ? "border-red-500/60" : "border-white/10"}`}
              {...register("email")}
            />
            {errors.email && <p className="mt-1.5 text-xs text-red-400">{errors.email.message}</p>}
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-white/70 mb-1.5">
              Password
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              placeholder="••••••••"
              className={`w-full px-4 py-3 rounded-xl bg-white/8 border text-white placeholder-white/30 text-sm outline-none transition-all focus:ring-2 focus:ring-[#b80014]/50 focus:border-[#b80014]/70 ${errors.password ? "border-red-500/60" : "border-white/10"}`}
              {...register("password")}
            />
            {errors.password && <p className="mt-1.5 text-xs text-red-400">{errors.password.message}</p>}
          </div>

          {serverError && (
            <div className="px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/30">
              <p className="text-sm text-red-400">{serverError}</p>
            </div>
          )}

          <button
            id="btn-login"
            type="submit"
            disabled={isLoading}
            className="w-full py-3 px-6 bg-[#b80014] hover:bg-[#e21b23] disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold text-sm rounded-xl transition-colors duration-200 flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Memproses...
              </>
            ) : "Masuk"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-white/40">
            Belum punya akun?{" "}
            <Link href="/register" className="text-[#b80014] hover:text-[#e21b23] font-medium transition-colors">
              Daftar sekarang
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="w-full max-w-md flex justify-center">
        <span className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" />
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
