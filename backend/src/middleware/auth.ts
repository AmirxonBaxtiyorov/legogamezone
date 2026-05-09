// Authentication middleware: req.headers.Authorization: Bearer <jwt> ni
// tekshiradi va req.viewer ni to'ldiradi.
//
// MUHIM: ?asUser=N fallback olib tashlandi. Faqat JWT.

import type { Request, Response, NextFunction } from "express";
import { prisma } from "../config/prisma";
import { verifyToken } from "../lib/jwt";

export async function loadViewer(req: Request): Promise<void> {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith("Bearer ")) return;
  const token = auth.slice(7).trim();
  if (!token) return;
  const userId = verifyToken(token);
  if (!userId) return;
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { branch: true },
  });
  if (user && user.isActive) req.viewer = user;
}

export async function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  await loadViewer(req);
  if (!req.viewer) {
    res.status(401).json({ error: "Avtorizatsiya talab" });
    return;
  }
  next();
}

export async function optionalAuth(
  req: Request,
  _res: Response,
  next: NextFunction,
): Promise<void> {
  await loadViewer(req);
  next();
}
