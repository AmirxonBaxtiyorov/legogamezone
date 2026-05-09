// RBAC middleware — owner/admin tekshiruvi.

import type { Request, Response, NextFunction } from "express";

export function requireOwner(req: Request, res: Response, next: NextFunction): void {
  if (!req.viewer) {
    res.status(401).json({ error: "Avtorizatsiya talab" });
    return;
  }
  if (req.viewer.role !== "owner") {
    res.status(403).json({ error: "Faqat tarmoq egasi kira oladi" });
    return;
  }
  next();
}

export function requireAdminOrOwner(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  if (!req.viewer) {
    res.status(401).json({ error: "Avtorizatsiya talab" });
    return;
  }
  if (req.viewer.role !== "owner" && req.viewer.role !== "admin") {
    res.status(403).json({ error: "Ruxsat yo'q" });
    return;
  }
  next();
}
