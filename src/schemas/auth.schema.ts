import { z } from "zod";

// ── Register ──────────────────────────────────────────
export const registerSchema = z
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

export type RegisterForm = z.infer<typeof registerSchema>;

// ── Login ─────────────────────────────────────────────
export const loginSchema = z.object({
  email: z.string().email("Format email tidak valid"),
  password: z.string().min(1, "Password wajib diisi"),
});

export type LoginForm = z.infer<typeof loginSchema>;
