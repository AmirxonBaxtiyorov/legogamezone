// Preview server — 1-bosqich uchun chiroyli statistik dashboard.
// Bu vaqtinchalik server. Asosiy Express API 2-bosqichdan boshlab quriladi.

import express, { Request, Response } from "express";
import path from "path";
import { PrismaClient, Prisma } from "@prisma/client";

const prisma = new PrismaClient();
const app = express();
const PORT = Number(process.env.PORT ?? 4000);
const PUBLIC_DIR = path.resolve(process.cwd(), "public");

app.use(express.json());

// Brauzer keshini o'chirish (development uchun)
app.use((_req, res, next) => {
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");
  res.setHeader("Surrogate-Control", "no-store");
  next();
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
// Joriy profilni belgilash (cookie/header'siz, query orqali)
// =====================================================================
async function getViewer(req: Request) {
  const idParam = req.query.asUser;
  if (!idParam) {
    // Default: birinchi owner
    const owner = await prisma.user.findFirst({ where: { role: "owner", isActive: true } });
    return owner;
  }
  const id = Number(idParam);
  if (!Number.isFinite(id)) return null;
  return prisma.user.findUnique({
    where: { id },
    include: { branch: true },
  });
}

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
    const branchFilter =
      viewer.role === "admin" && viewer.branchId
        ? { branchId: viewer.branchId }
        : {};

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

    // Filiallar — admin faqat o'zini ko'radi
    const branches =
      viewer.role === "admin" && viewer.branchId
        ? allBranches.filter((b) => b.id === viewer.branchId)
        : allBranches;

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
    const branchFilter =
      viewer.role === "admin" && viewer.branchId
        ? { branchId: viewer.branchId }
        : {};

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
        createdAt: client.createdAt,
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

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, stage: 1, time: new Date().toISOString() });
});

app.get("*", (_req, res) => {
  res.sendFile(path.join(PUBLIC_DIR, "index.html"));
});

app.listen(PORT, () => {
  console.log(`\n🎮 Game Zone Qarz Preview Dashboard`);
  console.log(`   ➜ http://localhost:${PORT}`);
  console.log(`   ➜ API: http://localhost:${PORT}/api/stats\n`);
});
