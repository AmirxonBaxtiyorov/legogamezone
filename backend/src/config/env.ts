// Markazlashgan env validatsiyasi (Zod orqali).
// Production muhitida JWT_SECRET zaif bo'lsa serverni ishga tushirmaydi.

import "dotenv/config";
import { z } from "zod";

const isProd = process.env.NODE_ENV === "production";

const EnvSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(4000),
  TZ: z.string().default("Asia/Tashkent"),

  DATABASE_URL: z.string().min(1, "DATABASE_URL majburiy"),

  JWT_SECRET: z
    .string()
    .min(1, "JWT_SECRET majburiy")
    .refine(
      (v) => !isProd || v.length >= 64,
      "Production muhitida JWT_SECRET kamida 64 belgidan iborat bo'lishi kerak",
    )
    .refine(
      (v) =>
        !isProd ||
        !/(change-?me|dev-only|please-change|secret123|test|example)/i.test(v),
      "Production muhitida default/zaif JWT_SECRET ishlatilmasin",
    ),
  JWT_EXPIRES_IN: z.string().default("1d"),
  JWT_EXPIRES_IN_REMEMBER: z.string().default("30d"),

  BCRYPT_SALT_ROUNDS: z.coerce.number().int().min(8).max(15).default(12),

  CORS_ORIGIN: z
    .string()
    .default("http://localhost:5173,http://localhost:4000"),

  BACKUP_DIR: z.string().default("./backups"),
  BACKUP_RETENTION_DAYS: z.coerce.number().int().positive().default(30),

  RATE_LIMIT_LOGIN_PER_MINUTE: z.coerce.number().int().positive().default(5),
  RATE_LIMIT_API_PER_MINUTE: z.coerce.number().int().positive().default(100),

  LOG_LEVEL: z
    .enum(["fatal", "error", "warn", "info", "debug", "trace", "silent"])
    .default(isProd ? "info" : "debug"),
});

export type AppEnv = z.infer<typeof EnvSchema>;

const parsed = EnvSchema.safeParse(process.env);
if (!parsed.success) {
  // Zod xatolarini chiroyli chiqarib, jarayonni to'xtatamiz
  const issues = parsed.error.issues
    .map((i) => `  - ${i.path.join(".") || "(env)"}: ${i.message}`)
    .join("\n");
  // eslint-disable-next-line no-console
  console.error(`\n[env] Konfiguratsiya xatosi:\n${issues}\n`);
  process.exit(1);
}

export const env: AppEnv = parsed.data;

// CORS_ORIGIN vergul bilan ajratilgan ro'yxat sifatida o'qiladi
export const corsOrigins: string[] = env.CORS_ORIGIN.split(",")
  .map((o) => o.trim())
  .filter(Boolean);

export const isProduction = env.NODE_ENV === "production";
export const isTest = env.NODE_ENV === "test";
