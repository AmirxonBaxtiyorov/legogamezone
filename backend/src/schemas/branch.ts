import { z } from "zod";

export const createBranchSchema = z.object({
  name: z.string().trim().min(1, "Filial nomi majburiy").max(120),
  address: z.string().trim().max(300).optional().nullable(),
  phone: z.string().trim().max(32).optional().nullable(),
  isActive: z.boolean().optional(),
});

export const updateBranchSchema = z.object({
  name: z.string().trim().min(1).max(120).optional(),
  address: z.string().trim().max(300).optional().nullable(),
  phone: z.string().trim().max(32).optional().nullable(),
  isActive: z.boolean().optional(),
});

export const deleteBranchQuery = z.object({
  force: z.coerce.boolean().optional(),
});
