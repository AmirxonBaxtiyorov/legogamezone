// Game Zone Qarz — backend server
// Hardened: helmet, CORS, rate-limit, Zod validation, $transaction.

import express, { Request, Response, NextFunction } from "express";
import path from "path";
import fs from "fs";
import { Prisma } from "@prisma/client";
import helmet from "helmet";
import cors from "cors";

// Modulli foundation
import { env, corsOrigins, isProduction } from "./config/env";
import { prisma } from "./config/prisma";
import { logger } from "./lib/logger";
import { signToken, verifyToken } from "./lib/jwt";
import { loginLimiter, apiLimiter } from "./middleware/rateLimit";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler";
import { loginSchema } from "./schemas/auth";

// types/express.d.ts global declaration — tsconfig orqali avtomatik o'qiladi.

import bcrypt from "bcrypt";

const app = express();
const PORT = env.PORT;
const PUBLIC_DIR = path.resolve(process.cwd(), "public");
const BUILD_VERSION = String(Date.now());

// trust proxy: rate-limit va IP detection uchun (deploymentda nginx orqasida)
app.set("trust proxy", 1);

// ----- Security middleware (eng oldin) -----
app.use(
  helmet({
    contentSecurityPolicy: false, // SPA inline JS uchun keyin sozlanadi
    crossOriginEmbedderPolicy: false,
  }),
);

app.use(
  cors({
    origin: (origin, cb) => {
      // Same-origin (browser SPA) yoki bo'sh origin ruxsat
      if (!origin) return cb(null, true);
      if (corsOrigins.includes(origin) || corsOrigins.includes("*")) return cb(null, true);
      logger.warn({ origin }, "CORS rad etildi");
      return cb(new Error("CORS: ushbu origin ruxsat etilmagan"));
    },
    credentials: true,
  }),
);

// Rate limit — barcha /api/* uchun (login uchun qattiqroq alohida)
app.use("/api", apiLimiter);

// JSON body limitini oshiramiz (logo base64 uchun)
app.use(express.json({ limit: "10mb" }));

// Brauzer keshini o'chirish (development uchun)
app.use((_req, res, next) => {
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");
  res.setHeader("Surrogate-Control", "no-store");
  next();
});

// HTML uchun: __BUILD__ ni current version'ga almashtirib, har safar yangi javob qaytaradi
app.get(["/", "/index.html"], (_req, res) => {
  const htmlPath = path.join(PUBLIC_DIR, "index.html");
  fs.readFile(htmlPath, "utf-8", (err, html) => {
    if (err) {
      res.status(500).send("Index yuklashda xatolik");
      return;
    }
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.send(html.replace(/\{\{BUILD\}\}/g, BUILD_VERSION));
  });
});

app.use(express.static(PUBLIC_DIR, { etag: false, lastModified: false, maxAge: 0 }));

// Decimal -> Number
const dec = (v: Prisma.Decimal | null | undefined): number =>
  v == null ? 0 : Number(v.toString());
const sum = (arr: number[]) => arr.reduce((a, b) => a + b, 0);

// =====================================================================
// Profillar ro'yxati (profil tanlovi uchun)
// =====================================================================
app.get("/api/profiles", async (_req, res) => {
  const users = await prisma.user.findMany({
    where: { isActive: true },
    include: { branch: true },
    orderBy: [{ role: "asc" }, { id: "asc" }],
  });
  res.json(
    users.map((u) => ({
      id: u.id,
      username: u.username,
      fullName: u.fullName,
      role: u.role,
      branchId: u.branchId,
      branchName: u.branch?.name ?? null,
    })),
  );
});

// =====================================================================
// Joriy profilni belgilash — faqat Authorization: Bearer <jwt> orqali.
// (?asUser=N fallback xavfsizlik sababli olib tashlandi.)
// =====================================================================
async function getViewer(req: Request) {
  // Agar middleware'da loadViewer ishlagan bo'lsa, undan foydalanamiz
  if (req.viewer) return req.viewer;

  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith("Bearer ")) return null;
  const token = auth.slice(7).trim();
  if (!token) return null;
  const userId = verifyToken(token);
  if (!userId) return null;
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { branch: true },
  });
  if (!user || !user.isActive) return null;
  req.viewer = user;
  return user;
}

// =====================================================================
// LOGIN — username + parol → JWT (Zod + rate-limit)
// =====================================================================
app.post(
  "/api/login",
  loginLimiter,
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const parsed = loginSchema.safeParse(req.body);
      if (!parsed.success) return next(parsed.error);
      const { username, password, remember } = parsed.data;

      const user = await prisma.user.findUnique({
        where: { username },
        include: { branch: true },
      });
      if (!user || !user.isActive) {
        res.status(401).json({ error: "Login yoki parol noto'g'ri" });
        return;
      }
      const ok = await bcrypt.compare(password, user.passwordHash);
      if (!ok) {
        await prisma.auditLog
          .create({
            data: {
              userId: user.id,
              action: "login",
              tableName: "User",
              recordId: user.id,
              newValue: JSON.stringify({ success: false, reason: "wrong_password" }),
              ipAddress:
                (req.headers["x-forwarded-for"] as string) ||
                req.socket.remoteAddress ||
                null,
              userAgent: req.headers["user-agent"] || null,
            },
          })
          .catch(() => {});
        res.status(401).json({ error: "Login yoki parol noto'g'ri" });
        return;
      }

      const token = signToken(user.id, !!remember);

      // Atomic: lastLoginAt update + audit
      await prisma.$transaction([
        prisma.user.update({
          where: { id: user.id },
          data: { lastLoginAt: new Date() },
        }),
        prisma.auditLog.create({
          data: {
            userId: user.id,
            action: "login",
            tableName: "User",
            recordId: user.id,
            branchId: user.branchId,
            newValue: JSON.stringify({ success: true }),
            ipAddress:
              (req.headers["x-forwarded-for"] as string) ||
              req.socket.remoteAddress ||
              null,
            userAgent: req.headers["user-agent"] || null,
          },
        }),
      ]);

      res.json({
        token,
        user: {
          id: user.id,
          username: user.username,
          fullName: user.fullName,
          role: user.role,
          branchId: user.branchId,
          branchName: user.branch?.name ?? null,
        },
      });
    } catch (err) {
      next(err);
    }
  },
);

// /api/me — joriy foydalanuvchi
app.get("/api/me", async (req: Request, res: Response): Promise<void> => {
  const viewer = await getViewer(req);
  if (!viewer) { res.status(401).json({ error: "Avtorizatsiya talab" }); return; }
  res.json({
    id: viewer.id, username: viewer.username, fullName: viewer.fullName,
    role: viewer.role, branchId: viewer.branchId,
    branchName: (viewer as any).branch?.name ?? null,
  });
});

// /api/logout — audit log
app.post("/api/logout", async (req: Request, res: Response): Promise<void> => {
  const viewer = await getViewer(req);
  if (viewer) {
    await prisma.auditLog.create({
      data: { userId: viewer.id, action: "logout", tableName: "User", recordId: viewer.id, branchId: viewer.branchId },
    }).catch(() => {});
  }
  res.json({ ok: true });
});

// =====================================================================
// Statistika API — profil rolini hisobga oladi (RBAC namoyishi)
// =====================================================================
app.get("/api/stats", async (req: Request, res: Response): Promise<void> => {
  try {
    const viewer = await getViewer(req);
    if (!viewer) {
      res.status(404).json({ error: "Profil topilmadi" });
      return;
    }

    // Branch scope: admin faqat o'z filialini ko'radi
    // Owner ?branchId=N parametri bilan filterlay oladi (yoki barchasini ko'radi)
    const requestedBranchId = req.query.branchId ? Number(req.query.branchId) : null;
    const branchFilter =
      viewer.role === "admin" && viewer.branchId
        ? { branchId: viewer.branchId }
        : (viewer.role === "owner" && requestedBranchId ? { branchId: requestedBranchId } : {});

    const [allBranches, allUsers, clients, debts, payments] = await Promise.all([
      prisma.branch.findMany({ orderBy: { id: "asc" } }),
      prisma.user.findMany({ select: { id: true, role: true, branchId: true, fullName: true } }),
      prisma.client.findMany({ where: { isDeleted: false, ...branchFilter } }),
      prisma.debt.findMany({
        where: { isDeleted: false, ...branchFilter },
        include: { client: true, branch: true, payments: true, createdBy: true },
        orderBy: { createdAt: "desc" },
      }),
      prisma.payment.findMany({
        where: branchFilter.branchId ? { debt: { branchId: branchFilter.branchId } } : {},
        include: { debt: { include: { branch: true, client: true } }, recordedBy: true },
        orderBy: { paidDate: "desc" },
      }),
    ]);

    // Audit logni faqat owner ko'radi
    const recentAudits =
      viewer.role === "owner"
        ? await prisma.auditLog.findMany({
            include: { user: true, branch: true },
            orderBy: { createdAt: "desc" },
            take: 10,
          })
        : [];

    const auditTotal =
      viewer.role === "owner" ? await prisma.auditLog.count() : 0;

    // Filiallar:
    //  - admin: faqat o'z filiali
    //  - owner + filter: faqat tanlangan filial
    //  - owner: barchasi
    const branches =
      viewer.role === "admin" && viewer.branchId
        ? allBranches.filter((b) => b.id === viewer.branchId)
        : (viewer.role === "owner" && requestedBranchId
            ? allBranches.filter((b) => b.id === requestedBranchId)
            : allBranches);

    // Vaqt ufqlari
    const now = new Date();
    const startOfToday = new Date(now);
    startOfToday.setHours(0, 0, 0, 0);
    const endOfToday = new Date(now);
    endOfToday.setHours(23, 59, 59, 999);
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // Umumiy summalar
    const totalDebt = sum(debts.map((d) => dec(d.amount)));
    const totalPaid = sum(debts.map((d) => dec(d.paidAmount)));
    const totalRemaining = sum(debts.map((d) => dec(d.remainingAmount)));

    // Status hisoblash
    const activeDebts = debts.filter((d) => d.status === "active");
    const partialDebts = debts.filter((d) => d.status === "partial");
    const paidDebts = debts.filter((d) => d.status === "paid");
    const overdueDebts = debts.filter((d) => d.status === "overdue");
    const cancelledDebts = debts.filter((d) => d.status === "cancelled");

    const dueTodayDebts = debts.filter(
      (d) =>
        d.status !== "paid" &&
        d.status !== "cancelled" &&
        d.dueDate >= startOfToday &&
        d.dueDate <= endOfToday,
    );

    // Bu oy to'lovlar
    const thisMonthPayments = payments.filter((p) => p.paidDate >= startOfMonth);
    const cashThisMonth = sum(
      thisMonthPayments.filter((p) => p.method === "cash").map((p) => dec(p.amount)),
    );
    const cardThisMonth = sum(
      thisMonthPayments.filter((p) => p.method === "card").map((p) => dec(p.amount)),
    );
    const transferThisMonth = sum(
      thisMonthPayments.filter((p) => p.method === "transfer").map((p) => dec(p.amount)),
    );

    // Filial taqqoslash
    const branchStats = branches.map((b) => {
      const bDebts = debts.filter((d) => d.branchId === b.id);
      const bPayments = payments.filter((p) => p.debt.branchId === b.id);
      return {
        id: b.id,
        name: b.name,
        clientsCount: clients.filter((c) => c.branchId === b.id).length,
        debtsCount: bDebts.length,
        totalAmount: sum(bDebts.map((d) => dec(d.amount))),
        totalPaid: sum(bDebts.map((d) => dec(d.paidAmount))),
        totalRemaining: sum(bDebts.map((d) => dec(d.remainingAmount))),
        activeCount: bDebts.filter((d) => d.status === "active").length,
        overdueCount: bDebts.filter((d) => d.status === "overdue").length,
        paymentsCount: bPayments.length,
      };
    });

    // Top mijozlar
    const clientTotals = new Map<
      number,
      { id: number; name: string; phone: string; branch: string; total: number }
    >();
    for (const d of debts) {
      const remaining = dec(d.remainingAmount);
      if (remaining <= 0) continue;
      const existing = clientTotals.get(d.clientId);
      if (existing) {
        existing.total += remaining;
      } else {
        clientTotals.set(d.clientId, {
          id: d.clientId,
          name: d.client.name,
          phone: d.client.phone,
          branch: d.branch.name,
          total: remaining,
        });
      }
    }
    const topClients = Array.from(clientTotals.values())
      .sort((a, b) => b.total - a.total)
      .slice(0, 5)
      .map((tc) => ({
        clientId: tc.id,
        name: tc.name,
        phone: tc.phone,
        branch: tc.branch,
        totalRemaining: tc.total,
      }));

    const recentDebts = debts.slice(0, 10).map((d) => ({
      id: d.id,
      clientId: d.clientId,
      client: d.client.name,
      phone: d.client.phone,
      branch: d.branch.name,
      itemType: d.itemType,
      itemDetails: d.itemDetails,
      amount: dec(d.amount),
      paidAmount: dec(d.paidAmount),
      remainingAmount: dec(d.remainingAmount),
      status: d.status,
      borrowedDate: d.borrowedDate,
      dueDate: d.dueDate,
      createdBy: d.createdBy.fullName,
    }));

    const recentPayments = payments.slice(0, 10).map((p) => ({
      id: p.id,
      amount: dec(p.amount),
      method: p.method,
      paidDate: p.paidDate,
      clientId: p.debt.clientId,
      client: p.debt.client.name,
      branch: p.debt.branch.name,
      recordedBy: p.recordedBy.fullName,
    }));

    // Item turi taqsimoti (PS / kompyuter / bilyard / boshqa)
    const itemBreakdown = ["playstation", "computer", "billiard", "other"].map((t) => ({
      type: t,
      count: debts.filter((d) => d.itemType === t).length,
      amount: sum(debts.filter((d) => d.itemType === t).map((d) => dec(d.amount))),
    }));

    // 30 kunlik vaqt qatori — har kun: yangi qarz va to'lovlar summasi
    const days = 30;
    const startTimeline = new Date(now);
    startTimeline.setDate(startTimeline.getDate() - (days - 1));
    startTimeline.setHours(0, 0, 0, 0);

    const timeseries: { date: string; debtAdded: number; paid: number; debtsCount: number; paymentsCount: number }[] = [];
    for (let i = 0; i < days; i++) {
      const dayStart = new Date(startTimeline);
      dayStart.setDate(startTimeline.getDate() + i);
      const dayEnd = new Date(dayStart);
      dayEnd.setHours(23, 59, 59, 999);

      const dayDebts = debts.filter(
        (d) => d.borrowedDate >= dayStart && d.borrowedDate <= dayEnd,
      );
      const dayPayments = payments.filter(
        (p) => p.paidDate >= dayStart && p.paidDate <= dayEnd,
      );

      timeseries.push({
        date: dayStart.toISOString(),
        debtAdded: sum(dayDebts.map((d) => dec(d.amount))),
        paid: sum(dayPayments.map((p) => dec(p.amount))),
        debtsCount: dayDebts.length,
        paymentsCount: dayPayments.length,
      });
    }

    res.json({
      generatedAt: new Date().toISOString(),
      viewer: {
        id: viewer.id,
        username: viewer.username,
        fullName: viewer.fullName,
        role: viewer.role,
        branchId: viewer.branchId,
        branchName: viewer.role === "admin"
          ? allBranches.find((b) => b.id === viewer.branchId)?.name ?? null
          : null,
      },
      summary: {
        branchesCount: branches.length,
        usersCount: viewer.role === "owner" ? allUsers.length : 1,
        ownersCount: allUsers.filter((u) => u.role === "owner").length,
        adminsCount: allUsers.filter((u) => u.role === "admin").length,
        clientsCount: clients.length,
        debtsCount: debts.length,
        paymentsCount: payments.length,
        auditCount: auditTotal,
      },
      money: {
        totalDebt,
        totalPaid,
        totalRemaining,
        cashThisMonth,
        cardThisMonth,
        transferThisMonth,
        thisMonthTotal: cashThisMonth + cardThisMonth + transferThisMonth,
      },
      statusCounts: {
        active: activeDebts.length,
        partial: partialDebts.length,
        paid: paidDebts.length,
        overdue: overdueDebts.length,
        cancelled: cancelledDebts.length,
        dueToday: dueTodayDebts.length,
      },
      branches: branchStats,
      topClients,
      recentDebts,
      recentPayments,
      recentAudits: recentAudits.map((a) => ({
        id: a.id,
        action: a.action,
        tableName: a.tableName,
        recordId: a.recordId,
        user: a.user.fullName,
        branch: a.branch?.name ?? null,
        createdAt: a.createdAt,
      })),
      itemBreakdown,
      timeseries,
    });
  } catch (err) {
    console.error("Stats xatoligi:", err);
    res.status(500).json({ error: "Statistika olishda xatolik yuz berdi" });
  }
});

// =====================================================================
// Filtrlangan ro'yxat — kartalar bosilganda chiqadigan batafsil ma'lumot
// =====================================================================
app.get("/api/list", async (req: Request, res: Response): Promise<void> => {
  try {
    const viewer = await getViewer(req);
    if (!viewer) {
      res.status(404).json({ error: "Profil topilmadi" });
      return;
    }

    const filter = String(req.query.filter ?? "");
    const requestedBranchId = req.query.branchId ? Number(req.query.branchId) : null;
    const branchFilter =
      viewer.role === "admin" && viewer.branchId
        ? { branchId: viewer.branchId }
        : (viewer.role === "owner" && requestedBranchId ? { branchId: requestedBranchId } : {});

    const now = new Date();
    const startOfToday = new Date(now);
    startOfToday.setHours(0, 0, 0, 0);
    const endOfToday = new Date(now);
    endOfToday.setHours(23, 59, 59, 999);
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // Qarzlar va to'lovlar bo'yicha filtrlash
    let debtWhere: any = { isDeleted: false, ...branchFilter };
    let isPaymentList = false;
    let title = filter;

    switch (filter) {
      case "total-debt":
        title = "Jami qarzlar";
        break;
      case "total-paid":
        title = "Jami to'langan";
        isPaymentList = true;
        break;
      case "remaining":
        title = "Qoldiq qarzli";
        debtWhere = {
          ...debtWhere,
          status: { in: ["active", "partial", "overdue"] },
        };
        break;
      case "this-month":
        title = "Bu oy to'lovlar";
        isPaymentList = true;
        break;
      case "due-today":
      case "status:duetoday":
        title = "Bugun muddati tugaydigan";
        debtWhere = {
          ...debtWhere,
          status: { notIn: ["paid", "cancelled"] },
          dueDate: { gte: startOfToday, lte: endOfToday },
        };
        break;
      case "status:active":
        title = "Faol qarzlar";
        debtWhere = { ...debtWhere, status: "active" };
        break;
      case "status:partial":
        title = "Qisman to'langan";
        debtWhere = { ...debtWhere, status: "partial" };
        break;
      case "status:paid":
        title = "To'liq to'langan";
        debtWhere = { ...debtWhere, status: "paid" };
        break;
      case "status:overdue":
      case "overdue":
        title = "Muddati o'tgan";
        debtWhere = { ...debtWhere, status: "overdue" };
        break;
      case "status:cancelled":
        title = "Bekor qilingan";
        debtWhere = { ...debtWhere, status: "cancelled" };
        break;
      default:
        title = "Hammasi";
    }

    if (isPaymentList) {
      const paymentWhere: any = filter === "this-month"
        ? { paidDate: { gte: startOfMonth } }
        : {};
      if (branchFilter.branchId) {
        paymentWhere.debt = { branchId: branchFilter.branchId };
      }
      const payments = await prisma.payment.findMany({
        where: paymentWhere,
        include: {
          debt: { include: { branch: true, client: true } },
          recordedBy: true,
        },
        orderBy: { paidDate: "desc" },
      });
      res.json({
        kind: "payments",
        title,
        viewer: {
          role: viewer.role,
          fullName: viewer.fullName,
        },
        items: payments.map((p) => ({
          id: p.id,
          amount: dec(p.amount),
          method: p.method,
          paidDate: p.paidDate,
          notes: p.notes,
          debtId: p.debtId,
          debtAmount: dec(p.debt.amount),
          debtRemaining: dec(p.debt.remainingAmount),
          debtItem: p.debt.itemDetails || p.debt.itemType,
          debtItemType: p.debt.itemType,
          client: p.debt.client.name,
          clientId: p.debt.client.id,
          clientPhone: p.debt.client.phone,
          branch: p.debt.branch.name,
          recordedBy: p.recordedBy.fullName,
        })),
      });
      return;
    }

    const debts = await prisma.debt.findMany({
      where: debtWhere,
      include: {
        client: true,
        branch: true,
        payments: { orderBy: { paidDate: "desc" } },
        createdBy: true,
      },
      orderBy: { createdAt: "desc" },
    });

    // Owner uchun har bir qarz logi
    const debtIds = debts.map((d) => d.id);
    const auditByDebt = new Map<number, any[]>();
    if (viewer.role === "owner" && debtIds.length > 0) {
      const logs = await prisma.auditLog.findMany({
        where: {
          tableName: "Debt",
          recordId: { in: debtIds },
        },
        include: { user: true },
        orderBy: { createdAt: "desc" },
      });
      for (const log of logs) {
        const list = auditByDebt.get(log.recordId) ?? [];
        list.push({
          id: log.id,
          action: log.action,
          user: log.user.fullName,
          oldValue: log.oldValue,
          newValue: log.newValue,
          createdAt: log.createdAt,
        });
        auditByDebt.set(log.recordId, list);
      }
    }

    res.json({
      kind: "debts",
      title,
      viewer: {
        role: viewer.role,
        fullName: viewer.fullName,
      },
      items: debts.map((d) => ({
        id: d.id,
        clientId: d.clientId,
        client: d.client.name,
        clientPhone: d.client.phone,
        clientNotes: d.client.notes,
        branch: d.branch.name,
        itemType: d.itemType,
        itemDetails: d.itemDetails,
        amount: dec(d.amount),
        paidAmount: dec(d.paidAmount),
        remainingAmount: dec(d.remainingAmount),
        borrowedDate: d.borrowedDate,
        dueDate: d.dueDate,
        status: d.status,
        notes: d.notes,
        createdBy: d.createdBy.fullName,
        createdAt: d.createdAt,
        payments: d.payments.map((p) => ({
          id: p.id,
          amount: dec(p.amount),
          method: p.method,
          paidDate: p.paidDate,
          notes: p.notes,
        })),
        auditLogs: viewer.role === "owner" ? auditByDebt.get(d.id) ?? [] : null,
      })),
    });
  } catch (err) {
    console.error("List xatoligi:", err);
    res.status(500).json({ error: "Ro'yxatni olishda xatolik" });
  }
});

// =====================================================================
// Mijoz batafsil tarixi — barcha qarz, to'lov, log (owner uchun)
// =====================================================================
app.get("/api/client/:id", async (req: Request, res: Response): Promise<void> => {
  try {
    const viewer = await getViewer(req);
    if (!viewer) {
      res.status(404).json({ error: "Profil topilmadi" });
      return;
    }

    const clientId = Number(req.params.id);
    if (!Number.isFinite(clientId)) {
      res.status(400).json({ error: "Noto'g'ri ID" });
      return;
    }

    const client = await prisma.client.findUnique({
      where: { id: clientId },
      include: { branch: true },
    });

    if (!client) {
      res.status(404).json({ error: "Mijoz topilmadi" });
      return;
    }

    // Branch scope
    if (viewer.role === "admin" && viewer.branchId !== client.branchId) {
      res.status(403).json({ error: "Bu mijoz boshqa filialda" });
      return;
    }

    const debts = await prisma.debt.findMany({
      where: { clientId, isDeleted: false },
      include: {
        payments: { orderBy: { paidDate: "desc" }, include: { recordedBy: true } },
        createdBy: true,
        branch: true,
      },
      orderBy: { createdAt: "desc" },
    });

    // Owner uchun barcha log (mijoz, qarz, to'lov)
    let auditLogs: any[] = [];
    if (viewer.role === "owner") {
      const paymentIds = debts.flatMap((d) => d.payments.map((p) => p.id));
      const debtIds = debts.map((d) => d.id);
      const logs = await prisma.auditLog.findMany({
        where: {
          OR: [
            { tableName: "Client", recordId: clientId },
            { tableName: "Debt", recordId: { in: debtIds } },
            { tableName: "Payment", recordId: { in: paymentIds } },
          ],
        },
        include: { user: true },
        orderBy: { createdAt: "desc" },
      });
      auditLogs = logs.map((l) => ({
        id: l.id,
        action: l.action,
        tableName: l.tableName,
        recordId: l.recordId,
        user: l.user.fullName,
        oldValue: l.oldValue,
        newValue: l.newValue,
        createdAt: l.createdAt,
      }));
    }

    const totalAmount = debts.reduce((acc, d) => acc + dec(d.amount), 0);
    const totalPaid = debts.reduce((acc, d) => acc + dec(d.paidAmount), 0);
    const totalRemaining = debts.reduce((acc, d) => acc + dec(d.remainingAmount), 0);

    res.json({
      kind: "client",
      viewer: { role: viewer.role, fullName: viewer.fullName },
      client: {
        id: client.id,
        name: client.name,
        phone: client.phone,
        notes: client.notes,
        branch: client.branch.name,
        branchId: client.branchId,
        createdAt: client.createdAt,
        isBlacklisted: client.isBlacklisted,
        blacklistReason: client.blacklistReason,
        blacklistedAt: client.blacklistedAt,
      },
      summary: {
        debtsCount: debts.length,
        paymentsCount: debts.reduce((a, d) => a + d.payments.length, 0),
        totalAmount,
        totalPaid,
        totalRemaining,
      },
      debts: debts.map((d) => ({
        id: d.id,
        itemType: d.itemType,
        itemDetails: d.itemDetails,
        amount: dec(d.amount),
        paidAmount: dec(d.paidAmount),
        remainingAmount: dec(d.remainingAmount),
        status: d.status,
        borrowedDate: d.borrowedDate,
        dueDate: d.dueDate,
        notes: d.notes,
        createdBy: d.createdBy.fullName,
        branch: d.branch.name,
        payments: d.payments.map((p) => ({
          id: p.id,
          amount: dec(p.amount),
          method: p.method,
          paidDate: p.paidDate,
          notes: p.notes,
          recordedBy: p.recordedBy.fullName,
        })),
      })),
      auditLogs,
    });
  } catch (err) {
    console.error("Client xatoligi:", err);
    res.status(500).json({ error: "Mijoz ma'lumotini olishda xatolik" });
  }
});

// =====================================================================
// Mutatsiyalar — qarz qo'shish, to'lov, o'chirish, mijoz qo'shish
// =====================================================================

// Qaytarish muddati noma'lum bo'lsa shu sana qo'yiladi (sentinel)
const UNKNOWN_DUE = new Date("2099-12-31T00:00:00Z");

function isUnknownDue(d: Date | null | undefined): boolean {
  if (!d) return false;
  return d.getUTCFullYear() >= 2099;
}

// Mijoz yaratish (yoki o'chirilgan bo'lsa qayta tiklash)
app.post("/api/clients", async (req: Request, res: Response): Promise<void> => {
  try {
    const viewer = await getViewer(req);
    if (!viewer) { res.status(401).json({ error: "Profil topilmadi" }); return; }

    const { name, phone, branchId: rawBranchId, notes } = req.body ?? {};
    if (!name || !String(name).trim() || !phone || !String(phone).trim()) {
      res.status(400).json({ error: "Ism va telefon majburiy" });
      return;
    }

    const branchId = viewer.role === "admin" ? viewer.branchId : Number(rawBranchId || 0) || null;
    if (!branchId) {
      res.status(400).json({ error: "Filial tanlanmagan" });
      return;
    }

    const trimmedName = String(name).trim();
    const trimmedPhone = String(phone).trim();

    let client = await prisma.client.findUnique({
      where: { branchId_phone: { branchId, phone: trimmedPhone } },
    });

    if (client) {
      if (client.isDeleted) {
        client = await prisma.client.update({
          where: { id: client.id },
          data: { isDeleted: false, deletedAt: null, deletedById: null, name: trimmedName, notes: notes ?? client.notes },
        });
        await prisma.auditLog.create({
          data: { userId: viewer.id, action: "restore", tableName: "Client", recordId: client.id, branchId, newValue: JSON.stringify({ name: trimmedName }) },
        });
      } else if (client.name !== trimmedName || client.notes !== (notes ?? null)) {
        client = await prisma.client.update({
          where: { id: client.id },
          data: { name: trimmedName, notes: notes ?? client.notes },
        });
      }
    } else {
      client = await prisma.client.create({
        data: { name: trimmedName, phone: trimmedPhone, branchId, notes: notes || null },
      });
      await prisma.auditLog.create({
        data: { userId: viewer.id, action: "create", tableName: "Client", recordId: client.id, branchId, newValue: JSON.stringify({ name: trimmedName, phone: trimmedPhone }) },
      });
    }

    res.json(client);
  } catch (err) {
    console.error("Client create error:", err);
    res.status(500).json({ error: "Mijoz yaratishda xatolik" });
  }
});

// Qarz yaratish
app.post("/api/debts", async (req: Request, res: Response): Promise<void> => {
  try {
    const viewer = await getViewer(req);
    if (!viewer) { res.status(401).json({ error: "Profil topilmadi" }); return; }

    const { clientId, itemType, itemDetails, amount, borrowedDate, dueDate, dueDateUnknown, notes } = req.body ?? {};
    const cid = Number(clientId);
    if (!cid) { res.status(400).json({ error: "Mijoz tanlanmagan" }); return; }

    const validItems = ["playstation", "computer", "billiard", "other"];
    if (!validItems.includes(String(itemType))) {
      res.status(400).json({ error: "Xizmat turi noto'g'ri" });
      return;
    }

    const amt = Number(amount);
    if (!Number.isFinite(amt) || amt < 1000) {
      res.status(400).json({ error: "Eng kami 1000 so'm kiritish kerak" });
      return;
    }

    const client = await prisma.client.findUnique({ where: { id: cid } });
    if (!client || client.isDeleted) {
      res.status(404).json({ error: "Mijoz topilmadi" });
      return;
    }
    if (viewer.role === "admin" && client.branchId !== viewer.branchId) {
      res.status(403).json({ error: "Bu mijoz boshqa filialda" });
      return;
    }
    // Qora ro'yxatdagi mijozga qarz yozib bo'lmaydi
    if (client.isBlacklisted) {
      res.status(403).json({
        error: `⛔ Mijoz qora ro'yxatda${client.blacklistReason ? ": " + client.blacklistReason : ""}`,
      });
      return;
    }

    const finalBorrowed = borrowedDate ? new Date(borrowedDate) : new Date();
    const finalDue = dueDateUnknown ? UNKNOWN_DUE : (dueDate ? new Date(dueDate) : UNKNOWN_DUE);

    if (!dueDateUnknown && finalDue < finalBorrowed) {
      res.status(400).json({ error: "Qaytarish muddati olingan sanadan oldin bo'lishi mumkin emas" });
      return;
    }

    const debt = await prisma.debt.create({
      data: {
        branchId: client.branchId,
        clientId: client.id,
        itemType: String(itemType),
        itemDetails: itemDetails ? String(itemDetails) : null,
        amount: new Prisma.Decimal(amt),
        paidAmount: new Prisma.Decimal(0),
        remainingAmount: new Prisma.Decimal(amt),
        borrowedDate: finalBorrowed,
        dueDate: finalDue,
        status: "active",
        notes: notes ? String(notes) : null,
        createdById: viewer.id,
      },
    });

    await prisma.auditLog.create({
      data: {
        userId: viewer.id, action: "create", tableName: "Debt", recordId: debt.id, branchId: debt.branchId,
        newValue: JSON.stringify({ amount: amt, itemType, clientId: cid, dueUnknown: !!dueDateUnknown }),
      },
    });

    // Egaga xabar
    const branch = await prisma.branch.findUnique({ where: { id: client.branchId } });
    await notifyOwnerSafe(
      `➕ *Yangi qarz qo'shildi*\n\n` +
      `👤 ${client.name} — ${client.phone}\n` +
      `🏢 ${branch?.name}\n` +
      `🎮 ${itemDetails || itemType}\n` +
      `💰 ${amt.toLocaleString("uz-UZ")} so'm\n` +
      `✍️ ${viewer.fullName}`,
    );

    res.json(debt);
  } catch (err) {
    console.error("Debt create error:", err);
    res.status(500).json({ error: "Qarz yaratishda xatolik" });
  }
});

// To'lov yozish (qarzni kamaytirish)
app.post("/api/debts/:id/payments", async (req: Request, res: Response): Promise<void> => {
  try {
    const viewer = await getViewer(req);
    if (!viewer) { res.status(401).json({ error: "Profil topilmadi" }); return; }

    const debtId = Number(req.params.id);
    const { amount, method, paidDate, notes } = req.body ?? {};
    const validMethods = ["cash", "card", "transfer"];

    if (!validMethods.includes(String(method))) {
      res.status(400).json({ error: "To'lov usuli noto'g'ri" });
      return;
    }

    const amt = Number(amount);
    if (!Number.isFinite(amt) || amt < 1000) {
      res.status(400).json({ error: "Eng kami 1000 so'm" });
      return;
    }

    const debt = await prisma.debt.findUnique({ where: { id: debtId } });
    if (!debt || debt.isDeleted) { res.status(404).json({ error: "Qarz topilmadi" }); return; }
    if (viewer.role === "admin" && debt.branchId !== viewer.branchId) {
      res.status(403).json({ error: "Bu qarz boshqa filialda" });
      return;
    }

    const payDec = new Prisma.Decimal(amt);
    const newPaid = debt.paidAmount.plus(payDec);
    if (newPaid.gt(debt.amount)) {
      res.status(400).json({
        error: `To'lov qoldiqdan ko'p (qoldiq: ${debt.remainingAmount.toString()})`,
      });
      return;
    }

    const newRemaining = debt.amount.minus(newPaid);
    let newStatus = debt.status;
    if (newRemaining.eq(0)) newStatus = "paid";
    else if (newPaid.gt(0)) newStatus = "partial";

    const result = await prisma.$transaction(async (tx) => {
      const payment = await tx.payment.create({
        data: {
          debtId, amount: payDec, method: String(method),
          paidDate: paidDate ? new Date(paidDate) : new Date(),
          notes: notes ? String(notes) : null,
          recordedById: viewer.id,
        },
      });
      await tx.debt.update({
        where: { id: debtId },
        data: { paidAmount: newPaid, remainingAmount: newRemaining, status: newStatus },
      });
      await tx.auditLog.create({
        data: {
          userId: viewer.id, action: "payment", tableName: "Payment", recordId: payment.id,
          branchId: debt.branchId,
          newValue: JSON.stringify({ amount: amt, method, debtId }),
        },
      });
      await tx.auditLog.create({
        data: {
          userId: viewer.id, action: "update", tableName: "Debt", recordId: debtId,
          branchId: debt.branchId,
          oldValue: JSON.stringify({ paidAmount: debt.paidAmount.toString(), status: debt.status }),
          newValue: JSON.stringify({ paidAmount: newPaid.toString(), status: newStatus, trigger: "payment" }),
        },
      });
      return payment;
    });

    // Egaga xabar
    const cli = await prisma.client.findUnique({ where: { id: debt.clientId } });
    await notifyOwnerSafe(
      `💵 *To'lov qabul qilindi*\n\n` +
      `👤 ${cli?.name}\n` +
      `💰 ${amt.toLocaleString("uz-UZ")} so'm (${method})\n` +
      `📊 Yangi status: ${newStatus} — qoldiq: ${newRemaining.toString()} so'm\n` +
      `✍️ ${viewer.fullName}`,
    );

    res.json({ ok: true, paymentId: result.id, newStatus, newRemaining: newRemaining.toString() });
  } catch (err) {
    console.error("Payment error:", err);
    res.status(500).json({ error: "To'lov yozishda xatolik" });
  }
});

// Bitta qarz tafsiloti (tahrirlash uchun)
app.get("/api/debts/:id", async (req: Request, res: Response): Promise<void> => {
  try {
    const viewer = await getViewer(req);
    if (!viewer) { res.status(401).json({ error: "Profil topilmadi" }); return; }
    const debtId = Number(req.params.id);
    const debt = await prisma.debt.findUnique({ where: { id: debtId }, include: { client: true } });
    if (!debt) { res.status(404).json({ error: "Qarz topilmadi" }); return; }
    if (viewer.role === "admin" && debt.branchId !== viewer.branchId) {
      res.status(403).json({ error: "Bu qarz boshqa filialda" }); return;
    }
    res.json({
      id: debt.id, clientId: debt.clientId, client: debt.client.name, clientPhone: debt.client.phone,
      itemType: debt.itemType, itemDetails: debt.itemDetails,
      amount: dec(debt.amount), paidAmount: dec(debt.paidAmount), remainingAmount: dec(debt.remainingAmount),
      borrowedDate: debt.borrowedDate, dueDate: debt.dueDate, status: debt.status, notes: debt.notes,
    });
  } catch (err) {
    console.error("Get debt error:", err);
    res.status(500).json({ error: "Olishda xatolik" });
  }
});

// Qarzni TAHRIRLASH (admin va owner)
app.patch("/api/debts/:id", async (req: Request, res: Response): Promise<void> => {
  try {
    const viewer = await getViewer(req);
    if (!viewer) { res.status(401).json({ error: "Profil topilmadi" }); return; }

    const debtId = Number(req.params.id);
    const { itemType, itemDetails, amount, borrowedDate, dueDate, dueDateUnknown, notes } = req.body ?? {};

    const old = await prisma.debt.findUnique({ where: { id: debtId }, include: { client: true } });
    if (!old || old.isDeleted) { res.status(404).json({ error: "Qarz topilmadi" }); return; }
    if (viewer.role === "admin" && old.branchId !== viewer.branchId) {
      res.status(403).json({ error: "Bu qarz boshqa filialda" }); return;
    }

    const data: any = {};
    if (itemType !== undefined) {
      const validItems = ["playstation", "computer", "billiard", "other"];
      if (!validItems.includes(String(itemType))) { res.status(400).json({ error: "Xizmat turi noto'g'ri" }); return; }
      data.itemType = String(itemType);
    }
    if (itemDetails !== undefined) data.itemDetails = itemDetails ? String(itemDetails) : null;
    if (amount !== undefined) {
      const amt = Number(amount);
      if (!Number.isFinite(amt) || amt < 1000) { res.status(400).json({ error: "Eng kami 1000 so'm" }); return; }
      const paidNum = Number(old.paidAmount.toString());
      // Yangi qoldiq: agar yangi summa to'langan summadan kam bo'lsa, qoldiq 0 bo'ladi
      // (qarz kechirildi yoki kamaytirildi)
      const newRemaining = Math.max(0, amt - paidNum);
      const effectivePaid = Math.min(paidNum, amt);
      data.amount = new Prisma.Decimal(amt);
      data.paidAmount = new Prisma.Decimal(effectivePaid);
      data.remainingAmount = new Prisma.Decimal(newRemaining);
      // status qayta hisoblanadi
      if (newRemaining === 0) data.status = "paid";
      else if (effectivePaid > 0) data.status = "partial";
      else data.status = old.status === "cancelled" ? "active" : "active";
    }
    if (borrowedDate !== undefined) data.borrowedDate = new Date(borrowedDate);
    if (dueDate !== undefined || dueDateUnknown !== undefined) {
      data.dueDate = dueDateUnknown ? UNKNOWN_DUE : (dueDate ? new Date(dueDate) : old.dueDate);
    }
    if (notes !== undefined) data.notes = notes ? String(notes) : null;

    const updated = await prisma.debt.update({ where: { id: debtId }, data });

    await prisma.auditLog.create({
      data: {
        userId: viewer.id, action: "update", tableName: "Debt", recordId: debtId, branchId: old.branchId,
        oldValue: JSON.stringify({
          amount: old.amount.toString(), itemType: old.itemType, itemDetails: old.itemDetails,
          dueDate: old.dueDate.toISOString(), notes: old.notes,
        }),
        newValue: JSON.stringify({
          amount: updated.amount.toString(), itemType: updated.itemType, itemDetails: updated.itemDetails,
          dueDate: updated.dueDate.toISOString(), notes: updated.notes,
        }),
      },
    });

    await notifyOwnerSafe(
      `✏️ *Qarz tahrirlandi*\n\n` +
      `👤 ${old.client.name}\n` +
      `💰 ${old.amount.toString()} → ${updated.amount.toString()} so'm\n` +
      `✍️ ${viewer.fullName}`,
    );

    res.json(updated);
  } catch (err) {
    console.error("Debt edit error:", err);
    res.status(500).json({ error: "Tahrirlashda xatolik" });
  }
});

// Qarzni soft-delete (bekor qilish)
app.post("/api/debts/:id/soft-delete", async (req: Request, res: Response): Promise<void> => {
  try {
    const viewer = await getViewer(req);
    if (!viewer) { res.status(401).json({ error: "Profil topilmadi" }); return; }

    const debtId = Number(req.params.id);
    const debt = await prisma.debt.findUnique({ where: { id: debtId } });
    if (!debt) { res.status(404).json({ error: "Qarz topilmadi" }); return; }
    if (viewer.role === "admin" && debt.branchId !== viewer.branchId) {
      res.status(403).json({ error: "Bu qarz boshqa filialda" }); return;
    }

    await prisma.$transaction([
      prisma.debt.update({
        where: { id: debtId },
        data: { isDeleted: true, deletedAt: new Date(), deletedById: viewer.id, status: "cancelled" },
      }),
      prisma.auditLog.create({
        data: {
          userId: viewer.id, action: "soft_delete", tableName: "Debt", recordId: debtId,
          branchId: debt.branchId,
          oldValue: JSON.stringify({ status: debt.status }),
          newValue: JSON.stringify({ status: "cancelled", isDeleted: true }),
        },
      }),
    ]);

    const cli = await prisma.client.findUnique({ where: { id: debt.clientId } });
    await notifyOwnerSafe(
      `❌ *Qarz bekor qilindi*\n\n` +
      `👤 ${cli?.name}\n` +
      `💰 ${debt.amount.toString()} so'm\n` +
      `✍️ ${viewer.fullName}`,
    );

    res.json({ ok: true });
  } catch (err) {
    console.error("Soft delete error:", err);
    res.status(500).json({ error: "Bekor qilishda xatolik" });
  }
});

// Qarzni TO'LIQ o'chirish (faqat owner)
app.delete("/api/debts/:id", async (req: Request, res: Response): Promise<void> => {
  try {
    const viewer = await getViewer(req);
    if (!viewer) { res.status(401).json({ error: "Profil topilmadi" }); return; }
    if (viewer.role !== "owner") {
      res.status(403).json({ error: "Faqat ega to'liq o'chira oladi" }); return;
    }

    const debtId = Number(req.params.id);
    const debt = await prisma.debt.findUnique({ where: { id: debtId }, include: { client: true } });
    if (!debt) { res.status(404).json({ error: "Qarz topilmadi" }); return; }

    await prisma.$transaction([
      prisma.payment.deleteMany({ where: { debtId } }),
      prisma.reminder.deleteMany({ where: { debtId } }),
      prisma.debt.delete({ where: { id: debtId } }),
      prisma.auditLog.create({
        data: {
          userId: viewer.id, action: "delete", tableName: "Debt", recordId: debtId,
          branchId: debt.branchId,
          oldValue: JSON.stringify({
            amount: debt.amount.toString(), client: debt.client.name, status: debt.status,
          }),
        },
      }),
    ]);

    await notifyOwnerSafe(
      `🗑️ *Qarz BUTUNLAY o'chirildi*\n\n` +
      `👤 ${debt.client.name}\n` +
      `💰 ${debt.amount.toString()} so'm\n` +
      `✍️ ${viewer.fullName}`,
    );

    res.json({ ok: true });
  } catch (err) {
    console.error("Hard delete error:", err);
    res.status(500).json({ error: "O'chirishda xatolik" });
  }
});

// =====================================================================
// Filiallar CRUD (faqat owner)
// =====================================================================
// To'liq filial ma'lumotlari (address, phone, isActive bilan) — owner uchun
app.get("/api/branches/full", async (req: Request, res: Response): Promise<void> => {
  const viewer = await getViewer(req);
  if (!viewer || viewer.role !== "owner") { res.status(403).json({ error: "Forbidden" }); return; }
  const branches = await prisma.branch.findMany({
    orderBy: { id: "asc" },
    include: { _count: { select: { clients: true, debts: true, users: true } } },
  });
  res.json(branches.map((b) => ({
    id: b.id,
    name: b.name,
    address: b.address,
    phone: b.phone,
    isActive: b.isActive,
    clientsCount: b._count.clients,
    debtsCount: b._count.debts,
    usersCount: b._count.users,
    createdAt: b.createdAt,
  })));
});

app.post("/api/branches", async (req: Request, res: Response): Promise<void> => {
  try {
    const viewer = await getViewer(req);
    if (!viewer || viewer.role !== "owner") {
      res.status(403).json({ error: "Faqat ega filial qo'sha oladi" }); return;
    }
    const { name, address, phone } = req.body ?? {};
    if (!name || !String(name).trim()) {
      res.status(400).json({ error: "Filial nomi majburiy" }); return;
    }
    const branch = await prisma.branch.create({
      data: {
        name: String(name).trim(),
        address: address ? String(address).trim() : null,
        phone: phone ? String(phone).trim() : null,
      },
    });
    await prisma.auditLog.create({
      data: { userId: viewer.id, action: "create", tableName: "Branch", recordId: branch.id, branchId: branch.id, newValue: JSON.stringify({ name: branch.name }) },
    });
    res.json(branch);
  } catch (err: any) {
    console.error("Branch create error:", err);
    if (err?.code === "P2002") {
      res.status(409).json({ error: "Bu nomli filial allaqachon mavjud" });
      return;
    }
    res.status(500).json({ error: "Filial yaratishda xatolik" });
  }
});

app.patch("/api/branches/:id", async (req: Request, res: Response): Promise<void> => {
  try {
    const viewer = await getViewer(req);
    if (!viewer || viewer.role !== "owner") {
      res.status(403).json({ error: "Faqat ega tahrirlay oladi" }); return;
    }
    const id = Number(req.params.id);
    const { name, address, phone, isActive } = req.body ?? {};
    const old = await prisma.branch.findUnique({ where: { id } });
    if (!old) { res.status(404).json({ error: "Topilmadi" }); return; }
    const branch = await prisma.branch.update({
      where: { id },
      data: {
        ...(name !== undefined ? { name: String(name).trim() } : {}),
        ...(address !== undefined ? { address: address ? String(address).trim() : null } : {}),
        ...(phone !== undefined ? { phone: phone ? String(phone).trim() : null } : {}),
        ...(isActive !== undefined ? { isActive: !!isActive } : {}),
      },
    });
    await prisma.auditLog.create({
      data: {
        userId: viewer.id, action: "update", tableName: "Branch", recordId: branch.id, branchId: branch.id,
        oldValue: JSON.stringify({ name: old.name, isActive: old.isActive }),
        newValue: JSON.stringify({ name: branch.name, isActive: branch.isActive }),
      },
    });
    res.json(branch);
  } catch (err: any) {
    console.error("Branch update error:", err);
    if (err?.code === "P2002") {
      res.status(409).json({ error: "Bu nomli filial allaqachon mavjud" });
      return;
    }
    res.status(500).json({ error: "Tahrirlashda xatolik" });
  }
});

// =====================================================================
// Adminlar CRUD + ruxsatlar (faqat owner)
// Permissionlar User.permissions (JSON string) ustunida saqlanadi.
// =====================================================================
type Permissions = {
  canAddDebt: boolean;
  canEditDebt: boolean;
  canRecordPayment: boolean;
  canCancelDebt: boolean;
  canAddClient: boolean;
  canEditClient: boolean;
  canDeleteClient: boolean;
};
const DEFAULT_PERMS: Permissions = {
  canAddDebt: true, canEditDebt: true, canRecordPayment: true, canCancelDebt: true,
  canAddClient: true, canEditClient: true, canDeleteClient: false,
};

function parsePerms(raw: string | null | undefined): Permissions {
  if (!raw) return { ...DEFAULT_PERMS };
  try {
    const p = JSON.parse(raw);
    return { ...DEFAULT_PERMS, ...p };
  } catch { return { ...DEFAULT_PERMS }; }
}

// Foydalanuvchilar ro'yxati — owner uchun. Owner o'zini ham, adminlarni ham boshqara oladi.
app.get("/api/admins", async (req: Request, res: Response): Promise<void> => {
  const viewer = await getViewer(req);
  if (!viewer || viewer.role !== "owner") {
    res.status(403).json({ error: "Faqat ega ko'ra oladi" }); return;
  }
  const showInactive = String(req.query.showInactive ?? "") === "1";
  const users = await prisma.user.findMany({
    where: {
      role: { in: ["owner", "admin"] },
      ...(showInactive ? {} : { isActive: true }),
    },
    include: { branch: true },
    orderBy: { id: "asc" },
  });
  // Owner birinchi, keyin adminlar id tartibida
  users.sort((a, b) => {
    if (a.role !== b.role) return a.role === "owner" ? -1 : 1;
    return a.id - b.id;
  });
  res.json(users.map((a) => ({
    id: a.id,
    username: a.username,
    fullName: a.fullName,
    role: a.role,
    branchId: a.branchId,
    branchName: a.branch?.name ?? null,
    isActive: a.isActive,
    permissions: parsePerms(a.permissions),
    lastLoginAt: a.lastLoginAt,
    createdAt: a.createdAt,
  })));
});

app.get("/api/admins/:id/permissions", async (req: Request, res: Response): Promise<void> => {
  const viewer = await getViewer(req);
  if (!viewer || viewer.role !== "owner") { res.status(403).json({ error: "Forbidden" }); return; }
  const id = Number(req.params.id);
  const user = await prisma.user.findUnique({ where: { id } });
  res.json(parsePerms(user?.permissions));
});

app.patch("/api/admins/:id/permissions", async (req: Request, res: Response): Promise<void> => {
  const viewer = await getViewer(req);
  if (!viewer || viewer.role !== "owner") { res.status(403).json({ error: "Forbidden" }); return; }
  const id = Number(req.params.id);
  const old = await prisma.user.findUnique({ where: { id } });
  if (!old) { res.status(404).json({ error: "Topilmadi" }); return; }
  const current = parsePerms(old.permissions);
  const updated: Permissions = { ...current, ...req.body };
  await prisma.user.update({
    where: { id },
    data: { permissions: JSON.stringify(updated) },
  });
  await prisma.auditLog.create({
    data: {
      userId: viewer.id, action: "update", tableName: "User", recordId: id,
      oldValue: JSON.stringify({ permissions: current }),
      newValue: JSON.stringify({ permissions: updated }),
    },
  });
  res.json(updated);
});

// Admin parolini tiklash (faqat owner)
app.post("/api/admins/:id/reset-password", async (req: Request, res: Response): Promise<void> => {
  try {
    const viewer = await getViewer(req);
    if (!viewer || viewer.role !== "owner") { res.status(403).json({ error: "Forbidden" }); return; }
    const id = Number(req.params.id);
    const { password } = req.body ?? {};
    if (!password || String(password).length < 6) {
      res.status(400).json({ error: "Parol kamida 6 ta belgi bo'lishi kerak" }); return;
    }
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) { res.status(404).json({ error: "Foydalanuvchi topilmadi" }); return; }

    const bcrypt = await import("bcrypt");
    const hash = await bcrypt.hash(String(password), 12);

    await prisma.user.update({ where: { id }, data: { passwordHash: hash } });
    await prisma.auditLog.create({
      data: {
        userId: viewer.id, action: "update", tableName: "User", recordId: id,
        newValue: JSON.stringify({ event: "password_reset", target: user.username }),
      },
    });
    res.json({ ok: true });
  } catch (err) {
    console.error("Reset password error:", err);
    res.status(500).json({ error: "Parolni tiklashda xatolik" });
  }
});

// Adminni o'chirish — ?force=1 bilan butunlay, aks holda faolsizlantirish
app.delete("/api/admins/:id", async (req: Request, res: Response): Promise<void> => {
  try {
    const viewer = await getViewer(req);
    if (!viewer || viewer.role !== "owner") { res.status(403).json({ error: "Forbidden" }); return; }
    const id = Number(req.params.id);
    const force = String(req.query.force ?? "") === "1";
    const user = await prisma.user.findUnique({
      where: { id },
      include: { _count: { select: { createdDebts: true, recordedPayments: true, auditLogs: true } } },
    });
    if (!user) { res.status(404).json({ error: "Foydalanuvchi topilmadi" }); return; }
    if (user.role === "owner") {
      res.status(400).json({ error: "Egani o'chirib bo'lmaydi" }); return;
    }
    if (user.id === viewer.id) {
      res.status(400).json({ error: "O'zingizni o'chira olmaysiz" }); return;
    }

    if (force) {
      // Hard delete — bog'liq audit log'larni viewer'ga o'tkazamiz, qarz/to'lovlarning createdById ham
      // Audit logni o'chirmaymiz — egada qoldirib, "ex-admin" bo'lib turadi
      await prisma.$transaction(async (tx) => {
        await tx.auditLog.updateMany({ where: { userId: id }, data: { userId: viewer.id } });
        await tx.debt.updateMany({ where: { createdById: id }, data: { createdById: viewer.id } });
        await tx.payment.updateMany({ where: { recordedById: id }, data: { recordedById: viewer.id } });
        await tx.client.updateMany({ where: { deletedById: id }, data: { deletedById: null } });
        await tx.user.delete({ where: { id } });
        await tx.auditLog.create({
          data: {
            userId: viewer.id, action: "delete", tableName: "User", recordId: id,
            oldValue: JSON.stringify({ username: user.username, fullName: user.fullName, role: user.role }),
            newValue: JSON.stringify({
              hardDeleted: true,
              transferredAuditLogs: user._count.auditLogs,
              transferredDebts: user._count.createdDebts,
              transferredPayments: user._count.recordedPayments,
            }),
          },
        });
      });
      res.json({ ok: true, mode: "deleted" });
      return;
    }

    // Soft delete (default)
    await prisma.user.update({
      where: { id },
      data: { isActive: false },
    });
    await prisma.auditLog.create({
      data: {
        userId: viewer.id, action: "soft_delete", tableName: "User", recordId: id,
        oldValue: JSON.stringify({ isActive: user.isActive }),
        newValue: JSON.stringify({ isActive: false }),
      },
    });
    res.json({
      ok: true,
      mode: "deactivated",
      counts: user._count,
      hint: user._count.createdDebts + user._count.recordedPayments + user._count.auditLogs > 0
        ? `Adminda ${user._count.createdDebts} qarz, ${user._count.recordedPayments} to'lov, ${user._count.auditLogs} log mavjud — butunlay o'chirish uchun ?force=1`
        : null,
    });
  } catch (err) {
    console.error("Delete admin error:", err);
    res.status(500).json({ error: "O'chirishda xatolik" });
  }
});

// Yangi admin yaratish
app.post("/api/admins", async (req: Request, res: Response): Promise<void> => {
  try {
    const viewer = await getViewer(req);
    if (!viewer || viewer.role !== "owner") {
      res.status(403).json({ error: "Faqat ega admin yarata oladi" }); return;
    }
    const { username, password, fullName, branchId } = req.body ?? {};
    if (!username || !String(username).trim()) { res.status(400).json({ error: "Username majburiy" }); return; }
    if (!password || String(password).length < 6) { res.status(400).json({ error: "Parol kamida 6 ta belgi" }); return; }
    if (!fullName || !String(fullName).trim()) { res.status(400).json({ error: "Ism majburiy" }); return; }
    if (!branchId) { res.status(400).json({ error: "Filial tanlanmagan" }); return; }

    const bcrypt = await import("bcrypt");
    const hash = await bcrypt.hash(String(password), 12);

    const existing = await prisma.user.findUnique({ where: { username: String(username).trim() } });
    if (existing) { res.status(409).json({ error: "Bu username band" }); return; }

    const user = await prisma.user.create({
      data: {
        username: String(username).trim(),
        passwordHash: hash,
        fullName: String(fullName).trim(),
        role: "admin",
        branchId: Number(branchId),
        isActive: true,
      },
    });

    await prisma.auditLog.create({
      data: { userId: viewer.id, action: "create", tableName: "User", recordId: user.id, branchId: Number(branchId), newValue: JSON.stringify({ username: user.username, fullName: user.fullName, role: "admin" }) },
    });

    res.json({ id: user.id, username: user.username, fullName: user.fullName, branchId: user.branchId, isActive: user.isActive });
  } catch (err) {
    console.error("Admin create error:", err);
    res.status(500).json({ error: "Admin yaratishda xatolik" });
  }
});

app.patch("/api/admins/:id", async (req: Request, res: Response): Promise<void> => {
  try {
    const viewer = await getViewer(req);
    if (!viewer || viewer.role !== "owner") { res.status(403).json({ error: "Forbidden" }); return; }
    const id = Number(req.params.id);
    const { fullName, username, branchId, isActive } = req.body ?? {};
    const old = await prisma.user.findUnique({ where: { id } });
    if (!old) { res.status(404).json({ error: "Topilmadi" }); return; }

    // Username unikalligini tekshirish
    if (username !== undefined && String(username).trim() !== old.username) {
      const newUsername = String(username).trim();
      if (!/^[a-z0-9_]+$/i.test(newUsername)) {
        res.status(400).json({ error: "Username faqat harf, raqam va _ bo'lishi mumkin" }); return;
      }
      const exist = await prisma.user.findUnique({ where: { username: newUsername } });
      if (exist && exist.id !== id) { res.status(409).json({ error: "Bu username band" }); return; }
    }

    // Owner uchun himoya: filial yoki faol holatini o'zgartirib bo'lmaydi
    const isTargetOwner = old.role === "owner";
    if (isTargetOwner && isActive !== undefined && !isActive) {
      res.status(400).json({ error: "Egani faolsizlantirib bo'lmaydi" }); return;
    }

    const updated = await prisma.user.update({
      where: { id },
      data: {
        ...(fullName !== undefined ? { fullName: String(fullName).trim() } : {}),
        ...(username !== undefined ? { username: String(username).trim() } : {}),
        ...(!isTargetOwner && branchId !== undefined ? { branchId: branchId ? Number(branchId) : null } : {}),
        ...(!isTargetOwner && isActive !== undefined ? { isActive: !!isActive } : {}),
      },
    });
    await prisma.auditLog.create({
      data: {
        userId: viewer.id, action: "update", tableName: "User", recordId: id,
        oldValue: JSON.stringify({ fullName: old.fullName, username: old.username, isActive: old.isActive, branchId: old.branchId }),
        newValue: JSON.stringify({ fullName: updated.fullName, username: updated.username, isActive: updated.isActive, branchId: updated.branchId }),
      },
    });
    res.json(updated);
  } catch (err: any) {
    console.error("Admin update error:", err);
    if (err?.code === "P2002") {
      res.status(409).json({ error: "Bu username band" }); return;
    }
    res.status(500).json({ error: "Tahrirlashda xatolik" });
  }
});

// Barcha test ma'lumotlarini tozalash (faqat owner)
app.post("/api/admin/clear-data", async (req: Request, res: Response): Promise<void> => {
  try {
    const viewer = await getViewer(req);
    if (!viewer) { res.status(401).json({ error: "Profil topilmadi" }); return; }
    if (viewer.role !== "owner") {
      res.status(403).json({ error: "Faqat ega tozalashi mumkin" }); return;
    }

    await prisma.$transaction([
      prisma.payment.deleteMany(),
      prisma.reminder.deleteMany(),
      prisma.debt.deleteMany(),
      prisma.client.deleteMany(),
      prisma.auditLog.deleteMany({ where: { tableName: { in: ["Client", "Debt", "Payment", "Reminder"] } } }),
    ]);

    // Autoincrement counterlarni reset qilish (SQLite va PostgreSQL uchun har xil)
    const isSqlite = (process.env.DATABASE_URL || "").startsWith("file:");
    if (isSqlite) {
      await prisma
        .$executeRawUnsafe(
          `DELETE FROM sqlite_sequence WHERE name IN ('Client','Debt','Payment','Reminder')`,
        )
        .catch(() => {});
    } else {
      for (const table of ["Client", "Debt", "Payment", "Reminder"]) {
        await prisma
          .$executeRawUnsafe(`ALTER SEQUENCE "${table}_id_seq" RESTART WITH 1`)
          .catch(() => {});
      }
    }

    await prisma.auditLog.create({
      data: {
        userId: viewer.id, action: "delete", tableName: "ALL", recordId: 0,
        newValue: JSON.stringify({ note: "All test data cleared by owner" }),
      },
    });

    res.json({ ok: true, cleared: true });
  } catch (err) {
    console.error("Clear data error:", err);
    res.status(500).json({ error: "Tozalashda xatolik" });
  }
});

// =====================================================================
// Bildirishnomalar — qo'ng'iroqcha uchun (48h ichida muddati / overdue / bugun)
// =====================================================================
app.get("/api/notifications", async (req: Request, res: Response): Promise<void> => {
  try {
    const viewer = await getViewer(req);
    if (!viewer) { res.status(401).json({ error: "Profil topilmadi" }); return; }

    const requestedBranchId = req.query.branchId ? Number(req.query.branchId) : null;
    const branchFilter = viewer.role === "admin" && viewer.branchId
      ? { branchId: viewer.branchId }
      : (viewer.role === "owner" && requestedBranchId ? { branchId: requestedBranchId } : {});

    const now = new Date();
    const startOfToday = new Date(now); startOfToday.setHours(0, 0, 0, 0);
    const endOfToday = new Date(now); endOfToday.setHours(23, 59, 59, 999);
    const in48h = new Date(now); in48h.setHours(in48h.getHours() + 48);

    // 48 soat ichida muddati tugaydigan VA muddati o'tgan
    const debts = await prisma.debt.findMany({
      where: {
        isDeleted: false,
        status: { notIn: ["paid", "cancelled"] },
        OR: [
          { dueDate: { lte: in48h, gte: startOfToday } }, // bugun-48h
          { dueDate: { lt: startOfToday } }, // o'tgan
        ],
        ...branchFilter,
      },
      include: { client: true, branch: true },
      orderBy: { dueDate: "asc" },
    });

    const items = debts.map((d) => {
      const isOverdue = d.dueDate < startOfToday;
      const isToday = d.dueDate >= startOfToday && d.dueDate <= endOfToday;
      const hoursUntil = Math.round((d.dueDate.getTime() - now.getTime()) / (60 * 60 * 1000));
      return {
        id: d.id,
        clientId: d.clientId,
        client: d.client.name,
        clientPhone: d.client.phone,
        branch: d.branch.name,
        itemType: d.itemType,
        itemDetails: d.itemDetails,
        remaining: dec(d.remainingAmount),
        amount: dec(d.amount),
        dueDate: d.dueDate,
        urgency: isOverdue ? "overdue" : isToday ? "today" : "soon",
        hoursUntil,
      };
    });

    res.json({
      generatedAt: new Date().toISOString(),
      items,
      counts: {
        total: items.length,
        overdue: items.filter((i) => i.urgency === "overdue").length,
        today: items.filter((i) => i.urgency === "today").length,
        soon: items.filter((i) => i.urgency === "soon").length,
      },
    });
  } catch (err) {
    console.error("Notifications error:", err);
    res.status(500).json({ error: "Bildirishnomalarni olishda xatolik" });
  }
});

// =====================================================================
// Audit log so'rovi (owner only) — sana, foydalanuvchi, filial bo'yicha
// =====================================================================
app.get("/api/audit-logs", async (req: Request, res: Response): Promise<void> => {
  try {
    const viewer = await getViewer(req);
    if (!viewer || viewer.role !== "owner") {
      res.status(403).json({ error: "Faqat ega ko'ra oladi" }); return;
    }
    const from = req.query.from ? new Date(String(req.query.from)) : null;
    const to = req.query.to ? new Date(String(req.query.to)) : null;
    const userId = req.query.userId ? Number(req.query.userId) : null;
    const branchId = req.query.branchId ? Number(req.query.branchId) : null;
    const action = req.query.action ? String(req.query.action) : null;
    const tableName = req.query.tableName ? String(req.query.tableName) : null;

    const where: Prisma.AuditLogWhereInput = {};
    if (from || to) {
      where.createdAt = {};
      if (from) (where.createdAt as any).gte = from;
      if (to) {
        const toEnd = new Date(to);
        toEnd.setHours(23, 59, 59, 999);
        (where.createdAt as any).lte = toEnd;
      }
    }
    if (userId) where.userId = userId;
    if (branchId) where.branchId = branchId;
    if (action) where.action = action;
    if (tableName) where.tableName = tableName;

    const logs = await prisma.auditLog.findMany({
      where,
      include: { user: true, branch: true },
      orderBy: { createdAt: "desc" },
      take: 500,
    });

    res.json(logs.map((l) => ({
      id: l.id,
      action: l.action,
      tableName: l.tableName,
      recordId: l.recordId,
      user: l.user.fullName,
      userId: l.userId,
      branch: l.branch?.name ?? null,
      branchId: l.branchId,
      oldValue: l.oldValue,
      newValue: l.newValue,
      ipAddress: l.ipAddress,
      createdAt: l.createdAt,
    })));
  } catch (err) {
    console.error("Audit logs error:", err);
    res.status(500).json({ error: "Audit log olishda xatolik" });
  }
});

// =====================================================================
// Oylik hisobot (owner only)
// =====================================================================
app.get("/api/reports/monthly", async (req: Request, res: Response): Promise<void> => {
  try {
    const viewer = await getViewer(req);
    if (!viewer || viewer.role !== "owner") {
      res.status(403).json({ error: "Faqat ega ko'ra oladi" }); return;
    }

    const now = new Date();
    const year = req.query.year ? Number(req.query.year) : now.getFullYear();
    const month = req.query.month ? Number(req.query.month) - 1 : now.getMonth();

    const start = new Date(year, month, 1);
    const end = new Date(year, month + 1, 1);

    const [debts, payments, allBranches] = await Promise.all([
      prisma.debt.findMany({
        where: { createdAt: { gte: start, lt: end } },
        include: { branch: true, createdBy: true, client: true },
      }),
      prisma.payment.findMany({
        where: { paidDate: { gte: start, lt: end } },
        include: { debt: { include: { branch: true } }, recordedBy: true },
      }),
      prisma.branch.findMany(),
    ]);

    const totalDebtAdded = sum(debts.map((d) => dec(d.amount)));
    const totalPaid = sum(payments.map((p) => dec(p.amount)));
    const cashTotal = sum(payments.filter((p) => p.method === "cash").map((p) => dec(p.amount)));
    const cardTotal = sum(payments.filter((p) => p.method === "card").map((p) => dec(p.amount)));
    const transferTotal = sum(payments.filter((p) => p.method === "transfer").map((p) => dec(p.amount)));

    const byBranch = allBranches.map((b) => ({
      id: b.id,
      name: b.name,
      debtsCount: debts.filter((d) => d.branchId === b.id).length,
      debtsAmount: sum(debts.filter((d) => d.branchId === b.id).map((d) => dec(d.amount))),
      paymentsCount: payments.filter((p) => p.debt.branchId === b.id).length,
      paymentsAmount: sum(payments.filter((p) => p.debt.branchId === b.id).map((p) => dec(p.amount))),
    }));

    // Adminlar bo'yicha samaradorlik
    const admins = await prisma.user.findMany({ where: { role: "admin" } });
    const byAdmin = admins.map((a) => ({
      id: a.id,
      name: a.fullName,
      debtsCount: debts.filter((d) => d.createdById === a.id).length,
      debtsAmount: sum(debts.filter((d) => d.createdById === a.id).map((d) => dec(d.amount))),
      paymentsCount: payments.filter((p) => p.recordedById === a.id).length,
      paymentsAmount: sum(payments.filter((p) => p.recordedById === a.id).map((p) => dec(p.amount))),
    }));

    // Kunlar bo'yicha
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daily = [];
    for (let d = 1; d <= daysInMonth; d++) {
      const dayStart = new Date(year, month, d);
      const dayEnd = new Date(year, month, d + 1);
      const dayDebts = debts.filter((x) => x.createdAt >= dayStart && x.createdAt < dayEnd);
      const dayPayments = payments.filter((x) => x.paidDate >= dayStart && x.paidDate < dayEnd);
      daily.push({
        day: d,
        debtsAmount: sum(dayDebts.map((x) => dec(x.amount))),
        paymentsAmount: sum(dayPayments.map((x) => dec(x.amount))),
        debtsCount: dayDebts.length,
        paymentsCount: dayPayments.length,
      });
    }

    res.json({
      year, month: month + 1,
      summary: {
        debtsCount: debts.length,
        totalDebtAdded,
        paymentsCount: payments.length,
        totalPaid,
        cashTotal, cardTotal, transferTotal,
      },
      byBranch,
      byAdmin,
      daily,
    });
  } catch (err) {
    console.error("Monthly report error:", err);
    res.status(500).json({ error: "Hisobot olishda xatolik" });
  }
});

// =====================================================================
// Davriy hisobot (owner only) — sana oraliq (from..to) datetime aniqligida
// =====================================================================
app.get("/api/reports/range", async (req: Request, res: Response): Promise<void> => {
  try {
    const viewer = await getViewer(req);
    if (!viewer || viewer.role !== "owner") {
      res.status(403).json({ error: "Faqat ega ko'ra oladi" }); return;
    }

    const fromStr = req.query.from ? String(req.query.from) : null;
    const toStr = req.query.to ? String(req.query.to) : null;
    if (!fromStr || !toStr) {
      res.status(400).json({ error: "from va to majburiy" }); return;
    }
    const start = new Date(fromStr);
    const end = new Date(toStr);
    if (isNaN(start.getTime()) || isNaN(end.getTime()) || end <= start) {
      res.status(400).json({ error: "Sana noto'g'ri (to dan keyin from bo'lsin)" }); return;
    }

    const requestedBranchId = req.query.branchId ? Number(req.query.branchId) : null;
    const branchFilter = requestedBranchId ? { branchId: requestedBranchId } : {};

    const [debts, payments, allBranches] = await Promise.all([
      prisma.debt.findMany({
        where: { createdAt: { gte: start, lt: end }, ...branchFilter },
        include: { branch: true, createdBy: true, client: true },
      }),
      prisma.payment.findMany({
        where: {
          paidDate: { gte: start, lt: end },
          ...(requestedBranchId ? { debt: { branchId: requestedBranchId } } : {}),
        },
        include: { debt: { include: { branch: true } }, recordedBy: true },
      }),
      prisma.branch.findMany(),
    ]);

    const totalDebtAdded = sum(debts.map((d) => dec(d.amount)));
    const totalPaid = sum(payments.map((p) => dec(p.amount)));
    const cashTotal = sum(payments.filter((p) => p.method === "cash").map((p) => dec(p.amount)));
    const cardTotal = sum(payments.filter((p) => p.method === "card").map((p) => dec(p.amount)));
    const transferTotal = sum(payments.filter((p) => p.method === "transfer").map((p) => dec(p.amount)));

    const branchesToShow = requestedBranchId
      ? allBranches.filter((b) => b.id === requestedBranchId)
      : allBranches;
    const byBranch = branchesToShow.map((b) => ({
      id: b.id,
      name: b.name,
      debtsCount: debts.filter((d) => d.branchId === b.id).length,
      debtsAmount: sum(debts.filter((d) => d.branchId === b.id).map((d) => dec(d.amount))),
      paymentsCount: payments.filter((p) => p.debt.branchId === b.id).length,
      paymentsAmount: sum(payments.filter((p) => p.debt.branchId === b.id).map((p) => dec(p.amount))),
    }));

    const admins = await prisma.user.findMany({ where: { role: "admin" } });
    const byAdmin = admins
      .filter((a) => !requestedBranchId || a.branchId === requestedBranchId)
      .map((a) => ({
        id: a.id,
        name: a.fullName,
        debtsCount: debts.filter((d) => d.createdById === a.id).length,
        debtsAmount: sum(debts.filter((d) => d.createdById === a.id).map((d) => dec(d.amount))),
        paymentsCount: payments.filter((p) => p.recordedById === a.id).length,
        paymentsAmount: sum(payments.filter((p) => p.recordedById === a.id).map((p) => dec(p.amount))),
      }));

    // Kunlik taqsimot — agar oraliq 90 kundan kichik bo'lsa
    const ms = end.getTime() - start.getTime();
    const days = Math.ceil(ms / 86400000);
    let daily: Array<{ date: string; debtsAmount: number; paymentsAmount: number; debtsCount: number; paymentsCount: number }> = [];
    if (days <= 90) {
      for (let i = 0; i < days; i++) {
        const dStart = new Date(start.getTime() + i * 86400000);
        dStart.setHours(0, 0, 0, 0);
        const dEnd = new Date(dStart.getTime() + 86400000);
        const dayDebts = debts.filter((x) => x.createdAt >= dStart && x.createdAt < dEnd);
        const dayPayments = payments.filter((x) => x.paidDate >= dStart && x.paidDate < dEnd);
        daily.push({
          date: dStart.toISOString(),
          debtsAmount: sum(dayDebts.map((x) => dec(x.amount))),
          paymentsAmount: sum(dayPayments.map((x) => dec(x.amount))),
          debtsCount: dayDebts.length,
          paymentsCount: dayPayments.length,
        });
      }
    }

    res.json({
      from: start.toISOString(),
      to: end.toISOString(),
      summary: {
        debtsCount: debts.length,
        totalDebtAdded,
        paymentsCount: payments.length,
        totalPaid,
        cashTotal, cardTotal, transferTotal,
      },
      byBranch,
      byAdmin,
      daily,
    });
  } catch (err) {
    console.error("Range report error:", err);
    res.status(500).json({ error: "Hisobot olishda xatolik" });
  }
});

// =====================================================================
// Qarzdorlar ro'yxati — har bir mijoz, qoldiq qarzi bilan
// =====================================================================
app.get("/api/debtors", async (req: Request, res: Response): Promise<void> => {
  try {
    const viewer = await getViewer(req);
    if (!viewer) { res.status(401).json({ error: "Profil topilmadi" }); return; }

    const requestedBranchId = req.query.branchId ? Number(req.query.branchId) : null;
    const branchFilter = viewer.role === "admin" && viewer.branchId
      ? { branchId: viewer.branchId }
      : (viewer.role === "owner" && requestedBranchId ? { branchId: requestedBranchId } : {});

    const clients = await prisma.client.findMany({
      where: { isDeleted: false, ...branchFilter },
      include: {
        branch: true,
        debts: {
          where: { isDeleted: false },
          include: { payments: true },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    const result = clients.map((c) => {
      const activeDebts = c.debts.filter((d) => d.status !== "paid" && d.status !== "cancelled");
      const totalDebt = sum(c.debts.map((d) => dec(d.amount)));
      const totalPaid = sum(c.debts.map((d) => dec(d.paidAmount)));
      const totalRemaining = sum(c.debts.map((d) => dec(d.remainingAmount)));
      const lastPayment = c.debts
        .flatMap((d) => d.payments)
        .sort((a, b) => b.paidDate.getTime() - a.paidDate.getTime())[0];
      const oldestActive = activeDebts
        .sort((a, b) => a.borrowedDate.getTime() - b.borrowedDate.getTime())[0];
      return {
        id: c.id,
        name: c.name,
        phone: c.phone,
        notes: c.notes,
        branch: c.branch.name,
        branchId: c.branchId,
        debtsCount: c.debts.length,
        activeDebtsCount: activeDebts.length,
        totalDebt,
        totalPaid,
        totalRemaining,
        lastPaymentDate: lastPayment?.paidDate || null,
        oldestActiveDate: oldestActive?.borrowedDate || null,
        hasOverdue: c.debts.some((d) => d.status === "overdue"),
      };
    }).filter((c) => c.activeDebtsCount > 0); // faqat hozirgi qarzdorlar

    // Eng katta qoldiq qarzdan boshlab tartiblanadi
    result.sort((a, b) => b.totalRemaining - a.totalRemaining);

    res.json({
      generatedAt: new Date().toISOString(),
      total: result.length,
      totalRemaining: sum(result.map((r) => r.totalRemaining)),
      items: result,
    });
  } catch (err) {
    console.error("Debtors list error:", err);
    res.status(500).json({ error: "Qarzdorlar olishda xatolik" });
  }
});

// =====================================================================
// Tizim sozlamalari (logo, tizim nomi, sub-title, ranglar va h.k.)
//   - GET hammaga ochiq (logo va nom dashboard'da ko'rinishi uchun)
//   - PATCH faqat owner uchun
// =====================================================================
const DEFAULT_SETTINGS: Record<string, { value: string; type: string }> = {
  systemName: { value: "Game Zone Qarz", type: "text" },
  systemSubtitle: { value: "Boshqaruv tizimi", type: "text" },
  logo: { value: "🎮", type: "text" }, // emoji yoki base64 image
  primaryColor: { value: "#6366f1", type: "color" },
  ownerLabel: { value: "Tarmoq egasi", type: "text" },
};

async function loadSettings(): Promise<Record<string, { value: string; type: string }>> {
  const rows = await prisma.appSetting.findMany();
  const out: Record<string, { value: string; type: string }> = {};
  for (const k of Object.keys(DEFAULT_SETTINGS)) out[k] = { ...DEFAULT_SETTINGS[k] };
  for (const r of rows) out[r.key] = { value: r.value, type: r.type };
  return out;
}

app.get("/api/settings", async (_req, res: Response): Promise<void> => {
  try {
    const settings = await loadSettings();
    res.json(settings);
  } catch (err) {
    console.error("Settings get error:", err);
    res.status(500).json({ error: "Sozlamalarni olishda xatolik" });
  }
});

app.patch("/api/settings", async (req: Request, res: Response): Promise<void> => {
  try {
    const viewer = await getViewer(req);
    if (!viewer || viewer.role !== "owner") {
      res.status(403).json({ error: "Faqat ega sozlamalarni o'zgartira oladi" }); return;
    }
    const body = req.body || {};
    const allowed = ["systemName", "systemSubtitle", "logo", "primaryColor", "ownerLabel"];
    const oldSettings = await loadSettings();
    const changes: Record<string, { from: string; to: string }> = {};

    for (const key of allowed) {
      if (body[key] === undefined) continue;
      const value = String(body[key] ?? "").trim();
      if (!value) continue;
      // Logo bazasida 5MB cheklov
      if (key === "logo" && value.length > 6_000_000) {
        res.status(413).json({ error: "Logo juda katta (5MB cheklov)" }); return;
      }
      const type = key === "logo" && value.startsWith("data:image/") ? "image"
                 : key === "primaryColor" ? "color" : "text";
      await prisma.appSetting.upsert({
        where: { key },
        create: { key, value, type, updatedById: viewer.id },
        update: { value, type, updatedById: viewer.id },
      });
      changes[key] = { from: oldSettings[key]?.value || "", to: value.length > 200 ? value.slice(0, 50) + "...(image)" : value };
    }

    if (Object.keys(changes).length > 0) {
      await prisma.auditLog.create({
        data: {
          userId: viewer.id, action: "update", tableName: "AppSetting", recordId: 0,
          newValue: JSON.stringify(changes),
        },
      });
    }

    const settings = await loadSettings();
    res.json(settings);
  } catch (err) {
    console.error("Settings patch error:", err);
    res.status(500).json({ error: "Sozlamalarni saqlashda xatolik" });
  }
});

// =====================================================================
// Mijoz tahrirlash va o'chirish
// =====================================================================
app.patch("/api/clients/:id", async (req: Request, res: Response): Promise<void> => {
  try {
    const viewer = await getViewer(req);
    if (!viewer) { res.status(401).json({ error: "Profil topilmadi" }); return; }

    const id = Number(req.params.id);
    const { name, phone, notes } = req.body ?? {};
    const old = await prisma.client.findUnique({ where: { id } });
    if (!old) { res.status(404).json({ error: "Mijoz topilmadi" }); return; }
    if (viewer.role === "admin" && old.branchId !== viewer.branchId) {
      res.status(403).json({ error: "Bu mijoz boshqa filialda" }); return;
    }
    if (viewer.role === "admin") {
      const perms = parsePerms(viewer.permissions);
      if (!perms.canEditClient) {
        res.status(403).json({ error: "Mijoz tahrirlash ruxsati yo'q" }); return;
      }
    }

    const data: any = {};
    if (name !== undefined) {
      const v = String(name).trim();
      if (!v) { res.status(400).json({ error: "Ism bo'sh bo'lmasligi kerak" }); return; }
      data.name = v;
    }
    if (phone !== undefined) {
      const v = String(phone).trim();
      if (!v) { res.status(400).json({ error: "Telefon bo'sh bo'lmasligi kerak" }); return; }
      data.phone = v;
    }
    if (notes !== undefined) data.notes = notes ? String(notes).trim() : null;

    const updated = await prisma.client.update({ where: { id }, data });
    await prisma.auditLog.create({
      data: {
        userId: viewer.id, action: "update", tableName: "Client", recordId: id, branchId: old.branchId,
        oldValue: JSON.stringify({ name: old.name, phone: old.phone, notes: old.notes }),
        newValue: JSON.stringify({ name: updated.name, phone: updated.phone, notes: updated.notes }),
      },
    });
    res.json(updated);
  } catch (err: any) {
    console.error("Client edit error:", err);
    if (err?.code === "P2002") {
      res.status(409).json({ error: "Bu telefon raqam allaqachon ishlatilgan" }); return;
    }
    res.status(500).json({ error: "Tahrirlashda xatolik" });
  }
});

// Mijozni soft-delete (qarz va to'lovlari bilan birga, lekin ma'lumotlar saqlanadi)
app.post("/api/clients/:id/soft-delete", async (req: Request, res: Response): Promise<void> => {
  try {
    const viewer = await getViewer(req);
    if (!viewer) { res.status(401).json({ error: "Profil topilmadi" }); return; }
    const id = Number(req.params.id);
    const client = await prisma.client.findUnique({ where: { id } });
    if (!client) { res.status(404).json({ error: "Mijoz topilmadi" }); return; }
    if (viewer.role === "admin" && client.branchId !== viewer.branchId) {
      res.status(403).json({ error: "Bu mijoz boshqa filialda" }); return;
    }
    if (viewer.role === "admin") {
      const perms = parsePerms(viewer.permissions);
      if (!perms.canDeleteClient) {
        res.status(403).json({ error: "Mijoz o'chirish ruxsati yo'q" }); return;
      }
    }
    await prisma.$transaction([
      prisma.client.update({
        where: { id },
        data: { isDeleted: true, deletedAt: new Date(), deletedById: viewer.id },
      }),
      prisma.auditLog.create({
        data: {
          userId: viewer.id, action: "soft_delete", tableName: "Client", recordId: id, branchId: client.branchId,
          oldValue: JSON.stringify({ name: client.name, phone: client.phone }),
        },
      }),
    ]);
    res.json({ ok: true });
  } catch (err) {
    console.error("Client soft-delete error:", err);
    res.status(500).json({ error: "O'chirishda xatolik" });
  }
});

// Mijozni butunlay o'chirish (faqat owner)
app.delete("/api/clients/:id", async (req: Request, res: Response): Promise<void> => {
  try {
    const viewer = await getViewer(req);
    if (!viewer || viewer.role !== "owner") {
      res.status(403).json({ error: "Faqat ega to'liq o'chira oladi" }); return;
    }
    const id = Number(req.params.id);
    const client = await prisma.client.findUnique({ where: { id }, include: { debts: true } });
    if (!client) { res.status(404).json({ error: "Mijoz topilmadi" }); return; }

    const debtIds = client.debts.map((d) => d.id);
    await prisma.$transaction([
      prisma.payment.deleteMany({ where: { debtId: { in: debtIds } } }),
      prisma.reminder.deleteMany({ where: { debtId: { in: debtIds } } }),
      prisma.debt.deleteMany({ where: { clientId: id } }),
      prisma.client.delete({ where: { id } }),
      prisma.auditLog.create({
        data: {
          userId: viewer.id, action: "delete", tableName: "Client", recordId: id, branchId: client.branchId,
          oldValue: JSON.stringify({ name: client.name, phone: client.phone, debtsRemoved: debtIds.length }),
        },
      }),
    ]);
    res.json({ ok: true });
  } catch (err) {
    console.error("Client hard-delete error:", err);
    res.status(500).json({ error: "O'chirishda xatolik" });
  }
});

// Filialni o'chirish (faqat owner) — agar ichida mijoz/qarz bo'lsa, faqat faolsizlantiriladi
app.delete("/api/branches/:id", async (req: Request, res: Response): Promise<void> => {
  try {
    const viewer = await getViewer(req);
    if (!viewer || viewer.role !== "owner") { res.status(403).json({ error: "Forbidden" }); return; }
    const id = Number(req.params.id);
    const force = String(req.query.force ?? "") === "1";
    const branch = await prisma.branch.findUnique({
      where: { id },
      include: {
        _count: { select: { users: true, clients: true, debts: true } },
      },
    });
    if (!branch) { res.status(404).json({ error: "Filial topilmadi" }); return; }

    const hasContent = branch._count.users > 0 || branch._count.clients > 0 || branch._count.debts > 0;

    if (hasContent && !force) {
      // Faolsizlantirish
      const updated = await prisma.branch.update({
        where: { id },
        data: { isActive: false },
      });
      await prisma.auditLog.create({
        data: {
          userId: viewer.id, action: "soft_delete", tableName: "Branch", recordId: id, branchId: id,
          oldValue: JSON.stringify({ isActive: branch.isActive }),
          newValue: JSON.stringify({ isActive: false, hadContent: branch._count }),
        },
      });
      res.json({ ok: true, mode: "deactivated", reason: "Filialda mijoz/qarz mavjud", counts: branch._count });
      return;
    }

    // To'liq o'chirish — barcha bog'liq narsalarni ham
    await prisma.$transaction(async (tx) => {
      const debts = await tx.debt.findMany({ where: { branchId: id }, select: { id: true } });
      const debtIds = debts.map((d) => d.id);
      await tx.payment.deleteMany({ where: { debtId: { in: debtIds } } });
      await tx.reminder.deleteMany({ where: { debtId: { in: debtIds } } });
      await tx.debt.deleteMany({ where: { branchId: id } });
      await tx.client.deleteMany({ where: { branchId: id } });
      // Filialdagi adminlarni branchId=null qilish (ma'lumotlari saqlansin)
      await tx.user.updateMany({ where: { branchId: id }, data: { branchId: null, isActive: false } });
      await tx.auditLog.updateMany({ where: { branchId: id }, data: { branchId: null } });
      await tx.branch.delete({ where: { id } });
      await tx.auditLog.create({
        data: {
          userId: viewer.id, action: "delete", tableName: "Branch", recordId: id,
          oldValue: JSON.stringify({ name: branch.name, counts: branch._count }),
        },
      });
    });
    res.json({ ok: true, mode: "deleted" });
  } catch (err) {
    console.error("Branch delete error:", err);
    res.status(500).json({ error: "O'chirishda xatolik" });
  }
});

// =====================================================================
// Tizim haqida qisqacha statistika (dashboard'da settings panelida ko'rsatish uchun)
// =====================================================================
app.get("/api/system-info", async (req: Request, res: Response): Promise<void> => {
  try {
    const viewer = await getViewer(req);
    if (!viewer || viewer.role !== "owner") { res.status(403).json({ error: "Forbidden" }); return; }
    const [branches, users, clients, debts, payments, audits, dbSize] = await Promise.all([
      prisma.branch.count(),
      prisma.user.count(),
      prisma.client.count(),
      prisma.debt.count(),
      prisma.payment.count(),
      prisma.auditLog.count(),
      (async () => {
        try {
          const stats = await fs.promises.stat(path.resolve(process.cwd(), "prisma", "dev.db"));
          return stats.size;
        } catch { return 0; }
      })(),
    ]);
    res.json({
      counts: { branches, users, clients, debts, payments, audits },
      dbSizeBytes: dbSize,
      uptime: process.uptime(),
      now: new Date().toISOString(),
    });
  } catch (err) {
    console.error("System info error:", err);
    res.status(500).json({ error: "Tizim ma'lumotini olishda xatolik" });
  }
});

// =====================================================================
// BACKUP — SQLite faylni yuklab olish (faqat owner)
// =====================================================================
app.get("/api/backup", async (req: Request, res: Response): Promise<void> => {
  try {
    const viewer = await getViewer(req);
    if (!viewer || viewer.role !== "owner") { res.status(403).json({ error: "Faqat ega" }); return; }
    const dbUrl = process.env.DATABASE_URL || "file:./dev.db";
    if (!dbUrl.startsWith("file:")) {
      res.status(400).json({ error: "Backup faqat SQLite uchun ishlaydi (production'da Postgres backup boshqacha qilinadi)" });
      return;
    }
    const dbPath = dbUrl.replace(/^file:/, "").replace(/^\.\//, "");
    // Prisma URL schema fayli joylashgan papkadan boshlab qaraydi (prisma/)
    const fullPath = path.isAbsolute(dbPath)
      ? dbPath
      : path.resolve(process.cwd(), "prisma", dbPath);
    if (!fs.existsSync(fullPath)) { res.status(404).json({ error: "Baza fayli topilmadi" }); return; }
    const stamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
    const filename = `gamezone-backup-${stamp}.db`;
    await prisma.auditLog.create({
      data: { userId: viewer.id, action: "backup", tableName: "Database", recordId: 0, newValue: JSON.stringify({ filename, sizeBytes: fs.statSync(fullPath).size }) },
    });
    res.setHeader("Content-Type", "application/octet-stream");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    fs.createReadStream(fullPath).pipe(res);
  } catch (err) {
    console.error("Backup error:", err);
    if (!res.headersSent) res.status(500).json({ error: "Backup xatoligi" });
  }
});

// RESTORE — yuklangan SQLite faylni o'rnatish (faqat owner)
app.post("/api/restore", express.raw({ type: "application/octet-stream", limit: "100mb" }), async (req: Request, res: Response): Promise<void> => {
  try {
    const viewer = await getViewer(req);
    if (!viewer || viewer.role !== "owner") { res.status(403).json({ error: "Faqat ega" }); return; }
    const buf = req.body as Buffer;
    if (!buf || !Buffer.isBuffer(buf) || buf.length < 100) { res.status(400).json({ error: "Fayl yuborilmagan" }); return; }
    // SQLite fayl tasdiqlash: header "SQLite format 3\0"
    const header = buf.slice(0, 16).toString("utf-8");
    if (!header.startsWith("SQLite format 3")) {
      res.status(400).json({ error: "Bu SQLite fayl emas" });
      return;
    }
    const dbUrl = process.env.DATABASE_URL || "file:./dev.db";
    if (!dbUrl.startsWith("file:")) {
      res.status(400).json({ error: "Restore faqat SQLite uchun ishlaydi" });
      return;
    }
    const dbPath = dbUrl.replace(/^file:/, "").replace(/^\.\//, "");
    // Prisma URL schema fayli joylashgan papkadan boshlab qaraydi (prisma/)
    const fullPath = path.isAbsolute(dbPath)
      ? dbPath
      : path.resolve(process.cwd(), "prisma", dbPath);
    // Eski faylni saqlab qo'yamiz
    const stamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
    const safetyPath = path.resolve(process.cwd(), `dev.db.before-restore-${stamp}`);
    if (fs.existsSync(fullPath)) fs.copyFileSync(fullPath, safetyPath);
    // Audit log yozish (eski bazaga, qayta ishga tushishdan oldin)
    await prisma.auditLog.create({
      data: { userId: viewer.id, action: "update", tableName: "Database", recordId: 0, newValue: JSON.stringify({ event: "restore", sizeBytes: buf.length, safetyBackup: path.basename(safetyPath) }) },
    }).catch(() => {});
    // Yangi faylni yozamiz
    await prisma.$disconnect();
    fs.writeFileSync(fullPath, buf);
    res.json({
      ok: true,
      message: "Baza yangilandi. Server avtomatik qayta ishga tushadi.",
      safetyBackup: path.basename(safetyPath),
    });
    // tsx watch'ni triggerlash uchun source faylga "touch" qilamiz
    setTimeout(() => {
      try {
        const srcFile = path.resolve(process.cwd(), "src", "preview-server.ts");
        if (fs.existsSync(srcFile)) {
          const now = new Date();
          fs.utimesSync(srcFile, now, now);
        }
      } catch (err) { console.error("touch err:", err); }
    }, 800);
  } catch (err) {
    console.error("Restore error:", err);
    if (!res.headersSent) res.status(500).json({ error: "Restore xatoligi" });
  }
});

// =====================================================================
// Mijozni qora ro'yxatga qo'shish / olib tashlash
// =====================================================================
app.patch("/api/clients/:id/blacklist", async (req: Request, res: Response): Promise<void> => {
  try {
    const viewer = await getViewer(req);
    if (!viewer) { res.status(401).json({ error: "Avtorizatsiya talab" }); return; }
    const id = Number(req.params.id);
    const { blacklist, reason } = req.body ?? {};
    const client = await prisma.client.findUnique({ where: { id } });
    if (!client || client.isDeleted) { res.status(404).json({ error: "Mijoz topilmadi" }); return; }
    if (viewer.role === "admin" && client.branchId !== viewer.branchId) {
      res.status(403).json({ error: "Bu mijoz boshqa filialda" }); return;
    }
    const updated = await prisma.client.update({
      where: { id },
      data: blacklist
        ? { isBlacklisted: true, blacklistReason: String(reason || "").trim() || null, blacklistedAt: new Date() }
        : { isBlacklisted: false, blacklistReason: null, blacklistedAt: null },
    });
    await prisma.auditLog.create({
      data: {
        userId: viewer.id, action: "update", tableName: "Client", recordId: id, branchId: client.branchId,
        oldValue: JSON.stringify({ isBlacklisted: client.isBlacklisted }),
        newValue: JSON.stringify({ isBlacklisted: !!blacklist, reason: reason || null }),
      },
    });
    res.json(updated);
  } catch (err) {
    console.error("Blacklist toggle error:", err);
    res.status(500).json({ error: "Qora ro'yxat o'zgartirishda xatolik" });
  }
});

// =====================================================================
// Barcha mijozlar ro'yxati — admin faqat o'z filiali, owner hammasini
// =====================================================================
app.get("/api/clients/all", async (req: Request, res: Response): Promise<void> => {
  try {
    const viewer = await getViewer(req);
    if (!viewer) { res.status(401).json({ error: "Avtorizatsiya talab" }); return; }
    const branchFilter = viewer.role === "admin" && viewer.branchId
      ? { branchId: viewer.branchId }
      : (viewer.role === "owner" && req.query.branchId ? { branchId: Number(req.query.branchId) } : {});

    const showDeleted = String(req.query.showDeleted ?? "") === "1";
    const showBlacklisted = String(req.query.showBlacklisted ?? "") === "1";

    const clients = await prisma.client.findMany({
      where: {
        ...branchFilter,
        ...(showDeleted ? {} : { isDeleted: false }),
        ...(showBlacklisted ? { isBlacklisted: true } : {}),
      },
      include: {
        branch: true,
        debts: { where: { isDeleted: false }, select: { remainingAmount: true, status: true, amount: true, paidAmount: true } },
      },
      orderBy: [{ isBlacklisted: "desc" }, { name: "asc" }],
    });

    const items = clients.map((c) => {
      const totalRemaining = c.debts.reduce((acc, d) => acc + Number(d.remainingAmount.toString()), 0);
      const activeDebts = c.debts.filter((d) => d.status === "active" || d.status === "partial" || d.status === "overdue");
      return {
        id: c.id,
        name: c.name,
        phone: c.phone,
        notes: c.notes,
        branch: c.branch.name,
        branchId: c.branchId,
        isDeleted: c.isDeleted,
        isBlacklisted: c.isBlacklisted,
        blacklistReason: c.blacklistReason,
        debtsCount: c.debts.length,
        activeDebtsCount: activeDebts.length,
        totalRemaining,
        hasOverdue: c.debts.some((d) => d.status === "overdue"),
        createdAt: c.createdAt,
      };
    });

    res.json({
      total: items.length,
      totalRemaining: items.reduce((acc, i) => acc + i.totalRemaining, 0),
      items,
    });
  } catch (err) {
    console.error("All clients error:", err);
    res.status(500).json({ error: "Mijozlarni olishda xatolik" });
  }
});

// =====================================================================
// Mijoz qidirish — ism yoki telefon bo'yicha (admin faqat o'z filialida)
// =====================================================================
app.get("/api/search/clients", async (req: Request, res: Response): Promise<void> => {
  try {
    const viewer = await getViewer(req);
    if (!viewer) { res.status(401).json({ error: "Avtorizatsiya talab" }); return; }
    const q = String(req.query.q ?? "").trim();
    if (q.length < 2) { res.json([]); return; }

    const branchFilter = viewer.role === "admin" && viewer.branchId
      ? { branchId: viewer.branchId }
      : {};

    const clients = await prisma.client.findMany({
      where: {
        isDeleted: false,
        ...branchFilter,
        OR: [
          { name: { contains: q } },
          { phone: { contains: q } },
        ],
      },
      include: {
        branch: true,
        debts: { where: { isDeleted: false }, select: { remainingAmount: true, status: true } },
      },
      take: 15,
      orderBy: { name: "asc" },
    });

    res.json(clients.map((c) => ({
      id: c.id,
      name: c.name,
      phone: c.phone,
      notes: c.notes,
      branch: c.branch.name,
      branchId: c.branchId,
      debtsCount: c.debts.length,
      totalRemaining: c.debts.reduce((acc, d) => acc + Number(d.remainingAmount.toString()), 0),
      hasOverdue: c.debts.some((d) => d.status === "overdue"),
      isBlacklisted: c.isBlacklisted,
      blacklistReason: c.blacklistReason,
    })));
  } catch (err) {
    console.error("Search clients error:", err);
    res.status(500).json({ error: "Qidirishda xatolik" });
  }
});

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, stage: 1, time: new Date().toISOString() });
});

// =====================================================================
// In-app bildirishnomalar — barcha mutatsiyalardan keyin chaqiriladigan no-op.
// Avval Telegram'ga yuborardi; endi frontend `/api/notifications` orqali
// muddati o'tgan/yaqinlashayotgan qarzlarni o'zi olib chiqadi (NotificationBell).
// =====================================================================
async function notifyOwnerSafe(_message: string): Promise<void> {
  // Hozir hech narsa qilmaydi — frontend bell + sonner toast yetarli.
}

// =====================================================================
// EKSPORT — Excel (qarzdorlar / to'lovlar / oylik hisobot)
// =====================================================================
async function loadExportData(viewer: any, kind: string, opts: { from?: Date; to?: Date }) {
  const branchFilter = viewer.role === "admin" && viewer.branchId ? { branchId: viewer.branchId } : {};
  if (kind === "debtors") {
    return prisma.debt.findMany({
      where: {
        isDeleted: false,
        ...branchFilter,
        status: { in: ["active", "partial", "overdue"] },
      },
      include: { client: true, branch: true, createdBy: true },
      orderBy: { dueDate: "asc" },
    });
  }
  if (kind === "payments") {
    return prisma.payment.findMany({
      where: {
        ...(opts.from ? { paidDate: { gte: opts.from } } : {}),
        ...(opts.to ? { paidDate: { ...(opts.from ? { gte: opts.from, lte: opts.to } : { lte: opts.to }) } } : {}),
        ...(branchFilter.branchId ? { debt: { branchId: branchFilter.branchId } } : {}),
      },
      include: { debt: { include: { client: true, branch: true } }, recordedBy: true },
      orderBy: { paidDate: "desc" },
    });
  }
  if (kind === "all-debts") {
    return prisma.debt.findMany({
      where: { isDeleted: false, ...branchFilter },
      include: { client: true, branch: true, createdBy: true, payments: true },
      orderBy: { createdAt: "desc" },
    });
  }
  return [];
}

app.get("/api/export/excel", async (req: Request, res: Response): Promise<void> => {
  try {
    const viewer = await getViewer(req);
    if (!viewer) { res.status(401).json({ error: "Avtorizatsiya talab" }); return; }
    const kind = String(req.query.kind ?? "debtors");
    const fromStr = req.query.from ? String(req.query.from) : null;
    const toStr = req.query.to ? String(req.query.to) : null;
    const from = fromStr ? new Date(fromStr) : undefined;
    const to = toStr ? new Date(toStr + "T23:59:59") : undefined;

    const ExcelJS = (await import("exceljs")).default;
    const workbook = new ExcelJS.Workbook();
    workbook.creator = "Game Zone Qarz";
    workbook.created = new Date();

    const data = await loadExportData(viewer, kind, { from, to });

    if (kind === "payments") {
      const ws = workbook.addWorksheet("To'lovlar");
      ws.columns = [
        { header: "Sana", key: "date", width: 18 },
        { header: "Mijoz", key: "client", width: 28 },
        { header: "Telefon", key: "phone", width: 18 },
        { header: "Filial", key: "branch", width: 20 },
        { header: "Xizmat", key: "item", width: 22 },
        { header: "Summa (so'm)", key: "amount", width: 18 },
        { header: "Usul", key: "method", width: 12 },
        { header: "Yozgan", key: "by", width: 24 },
        { header: "Izoh", key: "notes", width: 30 },
      ];
      ws.getRow(1).font = { bold: true, color: { argb: "FFFFFFFF" } };
      ws.getRow(1).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF4F46E5" } };
      let total = 0;
      for (const p of data as any[]) {
        const amt = dec(p.amount);
        total += amt;
        ws.addRow({
          date: p.paidDate.toLocaleString("uz-UZ"),
          client: p.debt.client.name,
          phone: p.debt.client.phone,
          branch: p.debt.branch.name,
          item: p.debt.itemDetails || p.debt.itemType,
          amount: amt,
          method: p.method,
          by: p.recordedBy.fullName,
          notes: p.notes || "",
        });
      }
      ws.getColumn("amount").numFmt = "#,##0";
      const totalRow = ws.addRow({ client: "JAMI", amount: total });
      totalRow.font = { bold: true };
    } else {
      const isDebtors = kind === "debtors";
      const ws = workbook.addWorksheet(isDebtors ? "Qarzdorlar" : "Barcha qarzlar");
      ws.columns = [
        { header: "Mijoz", key: "client", width: 28 },
        { header: "Telefon", key: "phone", width: 18 },
        { header: "Filial", key: "branch", width: 20 },
        { header: "Xizmat", key: "item", width: 24 },
        { header: "Olingan", key: "borrowed", width: 14 },
        { header: "Muddat", key: "due", width: 14 },
        { header: "Summa", key: "amount", width: 14 },
        { header: "To'langan", key: "paid", width: 14 },
        { header: "Qoldiq", key: "remaining", width: 14 },
        { header: "Status", key: "status", width: 12 },
        { header: "Yozgan", key: "by", width: 24 },
        { header: "Izoh", key: "notes", width: 30 },
      ];
      ws.getRow(1).font = { bold: true, color: { argb: "FFFFFFFF" } };
      ws.getRow(1).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF4F46E5" } };
      let totalAmt = 0, totalPaid = 0, totalRem = 0;
      for (const d of data as any[]) {
        const amt = dec(d.amount), pd = dec(d.paidAmount), rem = dec(d.remainingAmount);
        totalAmt += amt; totalPaid += pd; totalRem += rem;
        const dueIsUnknown = d.dueDate.getUTCFullYear() >= 2099;
        ws.addRow({
          client: d.client.name,
          phone: d.client.phone,
          branch: d.branch.name,
          item: d.itemDetails || d.itemType,
          borrowed: d.borrowedDate.toLocaleDateString("uz-UZ"),
          due: dueIsUnknown ? "—" : d.dueDate.toLocaleDateString("uz-UZ"),
          amount: amt,
          paid: pd,
          remaining: rem,
          status: d.status,
          by: d.createdBy.fullName,
          notes: d.notes || "",
        });
      }
      ["amount", "paid", "remaining"].forEach((c) => { ws.getColumn(c).numFmt = "#,##0"; });
      const totalRow = ws.addRow({ client: "JAMI", amount: totalAmt, paid: totalPaid, remaining: totalRem });
      totalRow.font = { bold: true };
    }

    const stamp = new Date().toISOString().slice(0, 10);
    const filename = `gamezone-${kind}-${stamp}.xlsx`;
    await prisma.auditLog.create({
      data: { userId: viewer.id, action: "update", tableName: "Export", recordId: 0, newValue: JSON.stringify({ kind, format: "xlsx", count: (data as any[]).length }) },
    }).catch(() => {});
    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    console.error("Excel export error:", err);
    if (!res.headersSent) res.status(500).json({ error: "Excel eksport xatoligi" });
  }
});

// PDF eksport — qarzdorlar yoki to'lovlar ro'yxati
app.get("/api/export/pdf", async (req: Request, res: Response): Promise<void> => {
  try {
    const viewer = await getViewer(req);
    if (!viewer) { res.status(401).json({ error: "Avtorizatsiya talab" }); return; }
    const kind = String(req.query.kind ?? "debtors");
    const fromStr = req.query.from ? String(req.query.from) : null;
    const toStr = req.query.to ? String(req.query.to) : null;
    const from = fromStr ? new Date(fromStr) : undefined;
    const to = toStr ? new Date(toStr + "T23:59:59") : undefined;

    const PDFDocument = (await import("pdfkit")).default;
    const doc = new PDFDocument({ size: "A4", margin: 36 });
    const stamp = new Date().toISOString().slice(0, 10);
    const filename = `gamezone-${kind}-${stamp}.pdf`;
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    doc.pipe(res);

    const settings = await prisma.appSetting.findMany();
    const sysName = settings.find((s) => s.key === "systemName")?.value || "Game Zone Qarz";
    const sysSub = settings.find((s) => s.key === "systemSubtitle")?.value || "";

    // Sarlavha
    doc.fontSize(18).text(sysName, { align: "center" });
    if (sysSub) doc.fontSize(10).fillColor("#666").text(sysSub, { align: "center" });
    doc.moveDown(0.3);
    const titleMap: Record<string, string> = {
      debtors: "QARZDORLAR RO'YXATI",
      payments: "TO'LOVLAR HISOBOTI",
      "all-debts": "BARCHA QARZLAR",
    };
    doc.fontSize(14).fillColor("#000").text(titleMap[kind] || "HISOBOT", { align: "center" });
    doc.fontSize(9).fillColor("#666").text(`${new Date().toLocaleString("uz-UZ")}`, { align: "center" });
    if (viewer.role === "admin" && (viewer as any).branch) {
      doc.text(`Filial: ${(viewer as any).branch.name}`, { align: "center" });
    }
    doc.moveDown(0.8);

    const data = await loadExportData(viewer, kind, { from, to });

    if (kind === "payments") {
      let total = 0;
      doc.fontSize(8).fillColor("#000");
      // Table header
      const headers = ["#", "Sana", "Mijoz", "Telefon", "Filial", "Summa", "Usul"];
      const widths = [22, 80, 110, 80, 90, 70, 50];
      let y = doc.y;
      doc.font("Helvetica-Bold");
      let x = 36;
      headers.forEach((h, i) => { doc.text(h, x, y); x += widths[i]; });
      doc.font("Helvetica").moveDown(0.5);
      doc.moveTo(36, doc.y).lineTo(560, doc.y).stroke("#999"); doc.moveDown(0.3);

      (data as any[]).forEach((p, idx) => {
        const amt = dec(p.amount); total += amt;
        if (doc.y > 770) { doc.addPage(); }
        y = doc.y; x = 36;
        const row = [
          String(idx + 1),
          p.paidDate.toLocaleDateString("uz-UZ"),
          p.debt.client.name.slice(0, 22),
          p.debt.client.phone,
          p.debt.branch.name.slice(0, 16),
          amt.toLocaleString("uz-UZ"),
          p.method,
        ];
        row.forEach((v, i) => { doc.text(v, x, y, { width: widths[i] - 4 }); x += widths[i]; });
        doc.moveDown(0.3);
      });
      doc.moveDown(0.5);
      doc.font("Helvetica-Bold").fontSize(11);
      doc.text(`JAMI: ${total.toLocaleString("uz-UZ")} so'm  •  ${(data as any[]).length} ta to'lov`, { align: "right" });
    } else {
      let totalAmt = 0, totalRem = 0;
      doc.fontSize(8).fillColor("#000");
      const headers = ["#", "Mijoz", "Telefon", "Filial", "Muddat", "Qoldiq", "Status"];
      const widths = [22, 110, 80, 90, 70, 80, 60];
      let y = doc.y;
      doc.font("Helvetica-Bold");
      let x = 36;
      headers.forEach((h, i) => { doc.text(h, x, y); x += widths[i]; });
      doc.font("Helvetica").moveDown(0.5);
      doc.moveTo(36, doc.y).lineTo(560, doc.y).stroke("#999"); doc.moveDown(0.3);

      (data as any[]).forEach((d, idx) => {
        const rem = dec(d.remainingAmount);
        totalAmt += dec(d.amount); totalRem += rem;
        if (doc.y > 770) { doc.addPage(); }
        y = doc.y; x = 36;
        const dueIsUnknown = d.dueDate.getUTCFullYear() >= 2099;
        const row = [
          String(idx + 1),
          d.client.name.slice(0, 22),
          d.client.phone,
          d.branch.name.slice(0, 16),
          dueIsUnknown ? "—" : d.dueDate.toLocaleDateString("uz-UZ"),
          rem.toLocaleString("uz-UZ"),
          d.status,
        ];
        row.forEach((v, i) => { doc.text(v, x, y, { width: widths[i] - 4 }); x += widths[i]; });
        doc.moveDown(0.3);
      });
      doc.moveDown(0.5);
      doc.font("Helvetica-Bold").fontSize(11);
      doc.text(`JAMI qoldiq: ${totalRem.toLocaleString("uz-UZ")} so'm  •  ${(data as any[]).length} ta qarz`, { align: "right" });
    }

    doc.end();
    await prisma.auditLog.create({
      data: { userId: viewer.id, action: "update", tableName: "Export", recordId: 0, newValue: JSON.stringify({ kind, format: "pdf", count: (data as any[]).length }) },
    }).catch(() => {});
  } catch (err) {
    console.error("PDF export error:", err);
    if (!res.headersSent) res.status(500).json({ error: "PDF eksport xatoligi" });
  }
});

// Catch-all — barcha route'lardan keyin (SPA fallback)
app.get("*", (_req, res) => {
  res.sendFile(path.join(PUBLIC_DIR, "index.html"));
});

// Global error handler — barcha throw'lar shu yerga keladi.
// MUHIM: barcha route'lardan keyin keladi.
app.use(errorHandler);

app.listen(PORT, () => {
  logger.info(
    { port: PORT, env: env.NODE_ENV },
    `Game Zone Qarz server ishga tushdi → http://localhost:${PORT}`,
  );
  if (!isProduction) {
    // eslint-disable-next-line no-console
    console.log(`\n🎮 Game Zone Qarz Backend`);
    // eslint-disable-next-line no-console
    console.log(`   ➜ http://localhost:${PORT}`);
    // eslint-disable-next-line no-console
    console.log(`   ➜ API: http://localhost:${PORT}/api/stats\n`);
  }
});
