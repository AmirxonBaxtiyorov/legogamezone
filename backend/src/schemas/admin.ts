import { z } from "zod";

export const createAdminSchema = z.object({
  username: z
    .string()
    .trim()
    .min(3, "Username kamida 3 belgi")
    .max(40)
    .regex(/^[a-zA-Z0-9_.-]+$/, "Faqat lotin harflari, raqam, _.-"),
  password: z.string().min(6, "Parol kamida 6 belgi").max(200),
  fullName: z.string().trim().min(1).max(120),
  role: z.enum(["owner", "admin"]).default("admin"),
  branchId: z.coerce.number().int().positive().optional().nullable(),
  isActive: z.boolean().optional(),
});

export const updateAdminSchema = z.object({
  fullName: z.string().trim().min(1).max(120).optional(),
  branchId: z.coerce.number().int().positive().optional().nullable(),
  isActive: z.boolean().optional(),
});

export const resetPasswordSchema = z.object({
  newPassword: z.string().min(6, "Parol kamida 6 belgi").max(200),
});

// JSON ruxsatlar — bo'sh object yoki kalit-qiymat (boolean) struktura.
export const permissionsSchema = z.record(z.string(), z.boolean());
