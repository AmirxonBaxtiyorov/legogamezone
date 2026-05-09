// Global error handler — barcha throw qilingan xatoliklarni JSON ga aylantiradi.

import type { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import { Prisma } from "@prisma/client";
import { logger } from "../lib/logger";
import { isProduction } from "../config/env";

export class HttpError extends Error {
  status: number;
  details?: unknown;
  constructor(status: number, message: string, details?: unknown) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

export function notFoundHandler(req: Request, res: Response): void {
  res.status(404).json({ error: `Topilmadi: ${req.method} ${req.path}` });
}

// 4 argumentli signature — Express buni error middleware deb taniydi.
export function errorHandler(
  err: unknown,
  req: Request,
  res: Response,
  _next: NextFunction,
): void {
  // Zod validatsiya xatosi
  if (err instanceof ZodError) {
    res.status(400).json({
      error: "Validatsiya xatosi",
      issues: err.issues.map((i) => ({
        path: i.path.join("."),
        message: i.message,
        code: i.code,
      })),
    });
    return;
  }
  if (err instanceof HttpError) {
    res.status(err.status).json({
      error: err.message,
      ...(err.details ? { details: err.details } : {}),
    });
    return;
  }
  // Prisma
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === "P2002") {
      res.status(409).json({
        error: "Bu yozuv allaqachon mavjud",
        target: err.meta?.target,
      });
      return;
    }
    if (err.code === "P2025") {
      res.status(404).json({ error: "Yozuv topilmadi" });
      return;
    }
  }

  // Boshqa xatolar
  logger.error({ err, path: req.path, method: req.method }, "Server xatosi");
  const message = err instanceof Error ? err.message : "Ichki server xatosi";
  res.status(500).json({
    error: isProduction ? "Ichki server xatosi" : message,
  });
}
