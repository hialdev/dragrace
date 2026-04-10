import { z } from "zod";

const MAX_FILE = 5 * 1024 * 1024; // 5 MB
const ACCEPTED = ["image/jpeg", "image/png", "image/webp", "application/pdf"];

const optionalFile = z
  .instanceof(File)
  .refine((f) => f.size <= MAX_FILE, "Ukuran file maks 5 MB")
  .refine((f) => ACCEPTED.includes(f.type), "Format tidak didukung (JPG/PNG/WebP/PDF)")
  .optional()
  .or(z.string().optional()); // existing URL string when editing

export const racerSchema = z.object({
  name: z.string().min(3, "Nama racer minimal 3 karakter"),
  phone: z.string().min(9, "No. HP tidak valid").optional().or(z.literal("")),
  birth_date: z.string().optional(),
  address: z.string().optional(),
  notes: z.string().optional(),
  photo: optionalFile,
  kta: optionalFile,
  sim: optionalFile,
  kis: optionalFile,
});

export type RacerForm = z.infer<typeof racerSchema>;
