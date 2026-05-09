// Branch scope middleware:
//  - admin: faqat o'z filialini ko'radi (req.branchFilter = { branchId: viewer.branchId })
//  - owner: ?branchId=N bo'lsa shu filialga cheklanadi, yo'q bo'lsa hammasi
//
// requireAuth dan keyin chaqirilishi kerak (req.viewer mavjud).

import type { Request, Response, NextFunction } from "express";

export function attachBranchScope(
  req: Request,
  _res: Response,
  next: NextFunction,
): void {
  const v = req.viewer;
  if (!v) {
    req.branchFilter = {};
    return next();
  }
  if (v.role === "admin" && v.branchId) {
    req.branchFilter = { branchId: v.branchId };
    return next();
  }
  // owner
  const requested = req.query.branchId ? Number(req.query.branchId) : null;
  if (v.role === "owner" && requested && Number.isFinite(requested)) {
    req.branchFilter = { branchId: requested };
    return next();
  }
  req.branchFilter = {};
  return next();
}
