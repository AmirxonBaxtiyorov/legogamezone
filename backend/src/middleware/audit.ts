// Audit log helperi — har bir mutatsiyada chaqiriladi.
// MUHIM: kichik atomic operatsiyalarda $transaction'ning bir qismi sifatida chaqirilsin.

import type { Request } from "express";
import { prisma } from "../config/prisma";
import { logger } from "../lib/logger";

export type AuditAction =
  | "create"
  | "update"
  | "delete"
  | "soft_delete"
  | "restore"
  | "payment"
  | "login"
  | "logout"
  | "backup"
  | "settings"
  | "permissions"
  | "blacklist";

export interface AuditPayload {
  userId: number;
  action: AuditAction;
  tableName: string;
  recordId: number;
  branchId?: number | null;
  oldValue?: unknown;
  newValue?: unknown;
  req?: Request;
}

export async function writeAudit(p: AuditPayload): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        userId: p.userId,
        action: p.action,
        tableName: p.tableName,
        recordId: p.recordId,
        branchId: p.branchId ?? null,
        oldValue: p.oldValue == null ? null : JSON.stringify(p.oldValue),
        newValue: p.newValue == null ? null : JSON.stringify(p.newValue),
        ipAddress: p.req
          ? (p.req.headers["x-forwarded-for"] as string) ||
            p.req.socket?.remoteAddress ||
            null
          : null,
        userAgent: p.req?.headers["user-agent"] ?? null,
      },
    });
  } catch (err) {
    logger.warn({ err, action: p.action }, "Audit log yozish muvaffaqiyatsiz");
  }
}

// $transaction ichida chaqirilishi uchun mos versiya — tx clientni qabul qiladi.
export async function writeAuditTx(
  tx: { auditLog: { create: (args: { data: unknown }) => Promise<unknown> } },
  p: AuditPayload,
): Promise<void> {
  await tx.auditLog.create({
    data: {
      userId: p.userId,
      action: p.action,
      tableName: p.tableName,
      recordId: p.recordId,
      branchId: p.branchId ?? null,
      oldValue: p.oldValue == null ? null : JSON.stringify(p.oldValue),
      newValue: p.newValue == null ? null : JSON.stringify(p.newValue),
      ipAddress: p.req
        ? (p.req.headers["x-forwarded-for"] as string) ||
          p.req.socket?.remoteAddress ||
          null
        : null,
      userAgent: p.req?.headers["user-agent"] ?? null,
    },
  });
}
