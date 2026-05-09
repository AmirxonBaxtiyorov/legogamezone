// Express Request augmentation — req.viewer joylash uchun.

import type { User, Branch } from "@prisma/client";

declare global {
  namespace Express {
    interface Request {
      viewer?: User & { branch: Branch | null };
      branchFilter?: { branchId?: number };
      requestId?: string;
    }
  }
}

export {};
