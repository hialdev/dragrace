import { z } from "zod";

export const teamSchema = z.object({
  name: z.string().min(3, "Nama tim minimal 3 karakter").max(100),
  description: z.string().optional(),
  entrant_number: z.string().optional(),
  entrant_pic: z.string().optional(),
  entrant_pic_phone: z.string().optional(),
  entrant_pic_kta: z.string().optional(),
  manager_name: z.string().min(3, "Nama manager wajib diisi"),
  manager_phone: z.string().min(9, "No. HP manager wajib diisi"),
  manager_license: z.string().optional(),
  manager_kta: z.string().optional(),
});

export type TeamForm = z.infer<typeof teamSchema>;
