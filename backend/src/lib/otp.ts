// 2FA / OTP kodlari uchun servis. RAM Map o'rniga DB jadvali (OtpCode).

import { prisma } from "../config/prisma";
import { hashOtp, compareOtp } from "./bcrypt";

const OTP_TTL_MS = 5 * 60 * 1000; // 5 daqiqa
const OTP_MAX_ATTEMPTS = 5;

export type OtpPurpose = "login_2fa" | "telegram_link";

export function generateOtpCode(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}

export async function issueOtp(
  userId: number,
  purpose: OtpPurpose,
): Promise<string> {
  // Eski faol kodlarni bekor qilamiz (consumed sifatida belgilab)
  await prisma.otpCode.updateMany({
    where: { userId, purpose, consumedAt: null },
    data: { consumedAt: new Date() },
  });

  const code = generateOtpCode();
  const codeHash = await hashOtp(code);
  const expiresAt = new Date(Date.now() + OTP_TTL_MS);

  await prisma.otpCode.create({
    data: { userId, purpose, codeHash, expiresAt },
  });

  return code; // chaqiruvchi yuboradi (Telegram orqali); DB'ga faqat hash yoziladi
}

export type ConsumeResult =
  | { ok: true }
  | { ok: false; reason: "expired" | "wrong" | "exhausted" | "missing" };

export async function consumeOtp(
  userId: number,
  purpose: OtpPurpose,
  code: string,
): Promise<ConsumeResult> {
  const record = await prisma.otpCode.findFirst({
    where: { userId, purpose, consumedAt: null },
    orderBy: { createdAt: "desc" },
  });
  if (!record) return { ok: false, reason: "missing" };
  if (record.expiresAt.getTime() < Date.now()) {
    return { ok: false, reason: "expired" };
  }
  if (record.attempts >= OTP_MAX_ATTEMPTS) {
    return { ok: false, reason: "exhausted" };
  }
  const ok = await compareOtp(String(code).trim(), record.codeHash);
  if (!ok) {
    await prisma.otpCode.update({
      where: { id: record.id },
      data: { attempts: { increment: 1 } },
    });
    return { ok: false, reason: "wrong" };
  }
  await prisma.otpCode.update({
    where: { id: record.id },
    data: { consumedAt: new Date() },
  });
  return { ok: true };
}

// Davriy tozalash — eski/foydalanilgan kodlarni o'chiradi.
export async function purgeExpiredOtps(): Promise<number> {
  const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000); // bir kun
  const r = await prisma.otpCode.deleteMany({
    where: {
      OR: [
        { expiresAt: { lt: new Date() }, consumedAt: null },
        { consumedAt: { lt: cutoff } },
      ],
    },
  });
  return r.count;
}

// Telegram link kodlari uchun ham shu jadvaldan foydalanamiz (purpose = telegram_link).
// Ularda userId — kim ulashmoqchi bo'lgan admin.
export async function issueTelegramLinkCode(userId: number): Promise<string> {
  return issueOtp(userId, "telegram_link");
}

// Bot tarafidan: code -> userId (consumed deb belgilab qaytaradi).
export async function consumeTelegramLinkCode(code: string): Promise<number | null> {
  const records = await prisma.otpCode.findMany({
    where: { purpose: "telegram_link", consumedAt: null, expiresAt: { gt: new Date() } },
    orderBy: { createdAt: "desc" },
    take: 50, // ko'p bo'lmasligi kerak
  });
  for (const rec of records) {
    if (await compareOtp(String(code).trim(), rec.codeHash)) {
      await prisma.otpCode.update({
        where: { id: rec.id },
        data: { consumedAt: new Date() },
      });
      return rec.userId;
    }
  }
  return null;
}
