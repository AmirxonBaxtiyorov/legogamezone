// Umumiy Zod yordamchilari.

import { z } from "zod";

export const idParam = z.object({
  id: z.coerce.number().int().positive(),
});

export const optionalIdQuery = z.object({
  branchId: z.coerce.number().int().positive().optional(),
});

export const paginationQuery = z.object({
  limit: z.coerce.number().int().min(1).max(200).default(50),
  offset: z.coerce.number().int().min(0).default(0),
  branchId: z.coerce.number().int().positive().optional(),
});

// Pul summasi: musbat (yoki nol) son. Frontend string yuborishi mumkin (Decimal aniqligi).
export const moneyAmount = z
  .union([z.number(), z.string()])
  .transform((v, ctx) => {
    const n = typeof v === "number" ? v : Number(String(v).replace(/\s/g, ""));
    if (!Number.isFinite(n) || n < 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Summa noto'g'ri",
      });
      return z.NEVER;
    }
    return n;
  });

export const phoneSchema = z
  .string()
  .trim()
  .min(4, "Telefon juda qisqa")
  .max(32, "Telefon juda uzun");

export const nameSchema = z
  .string()
  .trim()
  .min(1, "Ism kiritilishi shart")
  .max(120, "Ism juda uzun");

export const itemTypeSchema = z.enum(["playstation", "computer", "billiard", "other"]);

export const debtStatusSchema = z.enum([
  "active",
  "partial",
  "paid",
  "overdue",
  "cancelled",
]);

export const paymentMethodSchema = z.enum(["cash", "card", "transfer"]);
