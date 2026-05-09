// PrismaClient singleton — har joyda bitta nusxa ishlatiladi.

import { PrismaClient } from "@prisma/client";
import { env, isProduction } from "./env";

declare global {
  // eslint-disable-next-line no-var
  var __prisma__: PrismaClient | undefined;
}

export const prisma: PrismaClient =
  globalThis.__prisma__ ??
  new PrismaClient({
    log: isProduction ? ["error", "warn"] : ["warn"],
  });

if (!isProduction) {
  globalThis.__prisma__ = prisma;
}

// Graceful shutdown
async function disconnect() {
  await prisma.$disconnect().catch(() => {});
}
process.on("beforeExit", disconnect);
process.on("SIGINT", () => disconnect().finally(() => process.exit(0)));
process.on("SIGTERM", () => disconnect().finally(() => process.exit(0)));

export { env };
