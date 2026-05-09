// Bcrypt helperlar.

import bcrypt from "bcrypt";
import { env } from "../config/env";

export function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, env.BCRYPT_SALT_ROUNDS);
}

export function comparePassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

// OTP / 2FA kodlari uchun yengilroq saltRounds (10) — kod 5 daqiqa amal qiladi,
// kuchli hash kerak emas, lekin plain saqlamaymiz.
export function hashOtp(plain: string): Promise<string> {
  return bcrypt.hash(plain, 10);
}

export function compareOtp(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}
