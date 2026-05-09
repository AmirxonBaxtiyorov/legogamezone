// Rate limiting — login (qattiq) va umumiy API (yumshoq).

import rateLimit from "express-rate-limit";
import { env } from "../config/env";

export const loginLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 daqiqa
  max: env.RATE_LIMIT_LOGIN_PER_MINUTE,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Juda ko'p urinish. Bir daqiqadan so'ng qayta urinib ko'ring." },
});

export const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: env.RATE_LIMIT_API_PER_MINUTE,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "API rate limitidan oshib ketdi. Birozdan so'ng urinib ko'ring." },
  // /api/health uchun limit qo'llanmaydi
  skip: (req) => req.path === "/api/health",
});
