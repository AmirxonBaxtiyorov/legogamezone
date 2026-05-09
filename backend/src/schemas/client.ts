import { z } from "zod";
import { nameSchema, phoneSchema } from "./common";

export const createClientSchema = z.object({
  name: nameSchema,
  phone: phoneSchema,
  branchId: z.coerce.number().int().positive().optional(),
  notes: z.string().trim().max(2000).optional().nullable(),
});

export const updateClientSchema = z.object({
  name: nameSchema.optional(),
  phone: phoneSchema.optional(),
  notes: z.string().trim().max(2000).optional().nullable(),
});

export const blacklistClientSchema = z.object({
  isBlacklisted: z.boolean(),
  reason: z.string().trim().max(1000).optional().nullable(),
});

export const searchClientsSchema = z.object({
  q: z.string().trim().min(1).max(100),
  branchId: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});
