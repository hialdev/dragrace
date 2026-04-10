import { z } from "zod";

export const assignmentSchema = z.object({
  racer: z.string().min(1, "Pilih racer"),
  vehicle: z.string().optional(),
  notes: z.string().optional(),
});

export type AssignmentForm = z.infer<typeof assignmentSchema>;

export const unlockRequestSchema = z.object({
  reason: z.string().min(10, "Alasan minimal 10 karakter").max(500),
});

export type UnlockRequestForm = z.infer<typeof unlockRequestSchema>;
