import { z } from "zod";

export const loginSchema = z.object({
  username: z.string().trim().min(1, "Login majburiy").max(64),
  password: z.string().min(1, "Parol majburiy").max(200),
  remember: z.boolean().optional(),
});
export type LoginInput = z.infer<typeof loginSchema>;
