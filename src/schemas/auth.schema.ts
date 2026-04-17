import { z } from "zod";

// ── Register (OTP mode — tanpa password) ─────────────
export const registerOtpSchema = z.object({
  full_name: z
    .string()
    .min(3, "Nama minimal 3 karakter")
    .max(100, "Nama terlalu panjang"),
  email: z.string().email("Format email tidak valid"),
  phone: z
    .string()
    .min(9, "Nomor HP minimal 9 digit")
    .max(15, "Nomor HP terlalu panjang")
    .regex(/^[0-9+\-\s]+$/, "Nomor HP tidak valid"),
});

export type RegisterOtpForm = z.infer<typeof registerOtpSchema>;

// ── Register (Password mode — dengan password) ────────
export const registerPasswordSchema = z
  .object({
    full_name: z
      .string()
      .min(3, "Nama minimal 3 karakter")
      .max(100, "Nama terlalu panjang"),
    email: z.string().email("Format email tidak valid"),
    phone: z
      .string()
      .min(9, "Nomor HP minimal 9 digit")
      .max(15, "Nomor HP terlalu panjang")
      .regex(/^[0-9+\-\s]+$/, "Nomor HP tidak valid"),
    password: z
      .string()
      .min(8, "Password minimal 8 karakter")
      .regex(/[A-Z]/, "Harus ada huruf kapital")
      .regex(/[0-9]/, "Harus ada angka"),
    passwordConfirm: z.string(),
  })
  .refine((v) => v.password === v.passwordConfirm, {
    message: "Konfirmasi password tidak cocok",
    path: ["passwordConfirm"],
  });

export type RegisterPasswordForm = z.infer<typeof registerPasswordSchema>;

// Alias for backward-compat
export const registerSchema = registerPasswordSchema;
export type RegisterForm = RegisterPasswordForm;

// ── Login (Password mode) ─────────────────────────────
export const loginSchema = z.object({
  email: z.string().email("Format email tidak valid"),
  password: z.string().min(1, "Password wajib diisi"),
});

export type LoginForm = z.infer<typeof loginSchema>;

// ── OTP Login — Step 1: Email ─────────────────────────
export const otpEmailSchema = z.object({
  email: z.string().email("Format email tidak valid"),
});

export type OtpEmailForm = z.infer<typeof otpEmailSchema>;

// ── OTP Login — Step 2: Code ──────────────────────────
export const otpCodeSchema = z.object({
  otp: z
    .string()
    .length(6, "Kode OTP harus 6 digit")
    .regex(/^\d{6}$/, "Kode OTP hanya angka"),
});

export type OtpCodeForm = z.infer<typeof otpCodeSchema>;
