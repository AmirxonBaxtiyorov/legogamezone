import { z } from "zod";
import {
  debtStatusSchema,
  itemTypeSchema,
  moneyAmount,
} from "./common";

const isoDate = z.union([z.string(), z.date()]).transform((v) => {
  const d = typeof v === "string" ? new Date(v) : v;
  if (isNaN(d.getTime())) throw new Error("Sana noto'g'ri");
  return d;
});

export const createDebtSchema = z.object({
  clientId: z.coerce.number().int().positive(),
  branchId: z.coerce.number().int().positive().optional(),
  itemType: itemTypeSchema,
  itemDetails: z.string().trim().max(500).optional().nullable(),
  amount: moneyAmount,
  borrowedDate: isoDate.optional(),
  dueDate: isoDate.nullable().optional(),
  notes: z.string().trim().max(2000).optional().nullable(),
});

export const updateDebtSchema = z.object({
  itemType: itemTypeSchema.optional(),
  itemDetails: z.string().trim().max(500).optional().nullable(),
  amount: moneyAmount.optional(),
  borrowedDate: isoDate.optional(),
  dueDate: isoDate.nullable().optional(),
  notes: z.string().trim().max(2000).optional().nullable(),
  status: debtStatusSchema.optional(),
});

export const recordPaymentSchema = z.object({
  amount: moneyAmount,
  method: z.enum(["cash", "card", "transfer"]),
  paidDate: isoDate.optional(),
  notes: z.string().trim().max(2000).optional().nullable(),
});

export const softDeleteSchema = z.object({
  reason: z.string().trim().max(500).optional().nullable(),
});
