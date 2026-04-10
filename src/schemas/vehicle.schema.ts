import { z } from "zod";

const MAX_FILE = 5 * 1024 * 1024;
const IMG_TYPES = ["image/jpeg", "image/png", "image/webp"];

const optionalImage = z
  .instanceof(File)
  .refine((f) => f.size <= MAX_FILE, "Ukuran file maks 5 MB")
  .refine((f) => IMG_TYPES.includes(f.type), "Format tidak didukung (JPG/PNG/WebP)")
  .optional()
  .or(z.string().optional());

export const vehicleSchema = z.object({
  brand: z.string().min(1, "Brand kendaraan wajib diisi"),
  model: z.string().min(1, "Model kendaraan wajib diisi"),
  cc: z.string().optional(),
  year: z.string().optional(),
  color: z.string().optional(),
  plate_number: z.string().optional(),
  notes: z.string().optional(),
  image: optionalImage,
});

export type VehicleForm = z.infer<typeof vehicleSchema>;
