import { z } from "zod";

export const loginSchema = z.object({
  username: z.string().trim().min(1, "Login majburiy").max(64),
  password: z.string().min(1, "Parol majburiy").max(200),
  remember: z.boolean().optional(),
});
export type LoginInput = z.infer<typeof loginSchema>;

export const twoFactorSchema = z.object({
  userId: z.coerce.number().int().positive(),
  code: z.string().trim().regex(/^\d{6}$/, "Kod 6 raqamdan iborat bo'lishi kerak"),
  remember: z.boolean().optional(),
});
export type TwoFactorInput = z.infer<typeof twoFactorSchema>;
