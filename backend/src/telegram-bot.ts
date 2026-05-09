// Game Zone Qarz — Telegram bot integratsiyasi
// Egaga har bir mutatsiya haqida bildirishnoma yuboradi.
// Adminlarni ulash: web UI dan kod olib, /start <kod> bilan ulanadi.

import { Bot, Context } from "grammy";
import { PrismaClient, Prisma } from "@prisma/client";

type Notifier = {
  notifyOwner(message: string): Promise<void>;
  notifyUser(userId: number, message: string): Promise<void>;
  consumeCode(code: string): Promise<number | null>;
};

export function createBot(
  prisma: PrismaClient,
  config: {
    token: string;
    ownerTelegramId: string | null;
    consumeLinkCode: (code: string) => Promise<number | null> | number | null;
  },
): { bot: Bot; notifier: Notifier } {
  const bot = new Bot(config.token);

  // ======================== Komandalar =================================
  bot.command("start", async (ctx) => {
    const arg = (ctx.match || "").trim();

    // Agar bu owner Telegram ID bo'lsa
    if (config.ownerTelegramId && String(ctx.from?.id) === String(config.ownerTelegramId)) {
      const owners = await prisma.user.findMany({ where: { role: "owner", isActive: true } });
      if (owners.length > 0) {
        const owner = owners[0];
        await prisma.user.update({
          where: { id: owner.id },
          data: {
            telegramId: String(ctx.from!.id),
            telegramUsername: ctx.from?.username || null,
          },
        });
        await ctx.reply(
          `🎮 *Game Zone Qarz — Salom!*\n\n` +
            `Siz tarmoq egasi sifatida tanildingiz.\n` +
            `Endi har bir qarz, to'lov va o'chirish haqida xabar olib turasiz.\n\n` +
            `📋 Komandalar:\n` +
            `/today — bugun muddati tugaydigan qarzlar\n` +
            `/overdue — muddati o'tgan qarzlar\n` +
            `/total — jami qarz summasi\n` +
            `/stats — qisqa statistika\n` +
            `/help — yordam`,
          { parse_mode: "Markdown" },
        );
        return;
      }
    }

    // Aks holda — kod orqali admin ulash
    if (arg && /^\d{6}$/.test(arg)) {
      const userId = await Promise.resolve(config.consumeLinkCode(arg));
      if (!userId) {
        await ctx.reply("❌ Kod noto'g'ri yoki muddati tugagan. Yangi kod oling.");
        return;
      }
      const user = await prisma.user.findUnique({ where: { id: userId }, include: { branch: true } });
      if (!user) { await ctx.reply("❌ Foydalanuvchi topilmadi."); return; }
      await prisma.user.update({
        where: { id: userId },
        data: { telegramId: String(ctx.from!.id), telegramUsername: ctx.from?.username || null },
      });
      await ctx.reply(
        `✅ *Muvaffaqiyatli ulandingiz!*\n\n` +
          `👤 ${user.fullName}\n` +
          `🏢 ${user.branch?.name || "—"}\n\n` +
          `Endi sizga o'z filialingiz bo'yicha xabarlar keladi.\n` +
          `/help — komandalar ro'yxati`,
        { parse_mode: "Markdown" },
      );
      return;
    }

    // Hech narsa
    await ctx.reply(
      `Salom! Bu Game Zone Qarz boshqaruv tizimi boti.\n\n` +
        `Tizimga ulanish uchun web ilovadan 6-raqamli kod oling va\n` +
        `\`/start <kod>\` ko'rinishida yuboring.`,
      { parse_mode: "Markdown" },
    );
  });

  bot.command("help", async (ctx) => {
    await ctx.reply(
      `📋 *Komandalar*\n\n` +
        `/today — bugun muddati tugaydigan qarzlar\n` +
        `/overdue — muddati o'tgan qarzlar\n` +
        `/total — jami qarz summasi\n` +
        `/stats — qisqa statistika\n` +
        `/unlink — botni uzish`,
      { parse_mode: "Markdown" },
    );
  });

  bot.command("today", async (ctx) => {
    const user = await prisma.user.findFirst({
      where: { telegramId: String(ctx.from!.id), isActive: true },
    });
    if (!user) { await ctx.reply("❌ Sizning akkauntingiz tizimga ulanmagan."); return; }

    const start = new Date(); start.setHours(0, 0, 0, 0);
    const end = new Date(); end.setHours(23, 59, 59, 999);
    const where: Prisma.DebtWhereInput = {
      isDeleted: false,
      status: { notIn: ["paid", "cancelled"] },
      dueDate: { gte: start, lte: end },
      ...(user.role === "admin" && user.branchId ? { branchId: user.branchId } : {}),
    };
    const debts = await prisma.debt.findMany({
      where, include: { client: true, branch: true }, orderBy: { dueDate: "asc" },
    });

    if (debts.length === 0) {
      await ctx.reply("📅 Bugun muddati tugaydigan qarz yo'q.");
      return;
    }
    const lines = debts.map((d, i) =>
      `${i + 1}. *${d.client.name}* — ${d.client.phone}\n` +
      `   ${d.itemDetails || d.itemType}, ${d.remainingAmount} so'm (qoldiq)\n` +
      (user.role === "owner" ? `   Filial: ${d.branch.name}\n` : ""),
    );
    const total = debts.reduce((a, d) => a + Number(d.remainingAmount.toString()), 0);
    await ctx.reply(
      `📅 *Bugun muddati tugaydigan qarzlar*\n` +
        `Jami: ${debts.length} ta, ${total.toLocaleString("uz-UZ")} so'm\n\n` +
        lines.join("\n"),
      { parse_mode: "Markdown" },
    );
  });

  bot.command("overdue", async (ctx) => {
    const user = await prisma.user.findFirst({ where: { telegramId: String(ctx.from!.id), isActive: true } });
    if (!user) { await ctx.reply("❌ Akkaunt ulanmagan."); return; }

    const where: Prisma.DebtWhereInput = {
      isDeleted: false,
      status: "overdue",
      ...(user.role === "admin" && user.branchId ? { branchId: user.branchId } : {}),
    };
    const debts = await prisma.debt.findMany({
      where, include: { client: true, branch: true }, orderBy: { dueDate: "asc" }, take: 20,
    });
    if (debts.length === 0) { await ctx.reply("✅ Muddati o'tgan qarz yo'q."); return; }
    const lines = debts.map((d, i) =>
      `${i + 1}. *${d.client.name}* — ${d.client.phone}\n` +
      `   ${d.remainingAmount} so'm, ${user.role === "owner" ? d.branch.name : ""}`,
    );
    await ctx.reply(
      `🔴 *Muddati o'tgan qarzlar* (${debts.length})\n\n` + lines.join("\n"),
      { parse_mode: "Markdown" },
    );
  });

  bot.command("total", async (ctx) => {
    const user = await prisma.user.findFirst({ where: { telegramId: String(ctx.from!.id), isActive: true } });
    if (!user) { await ctx.reply("❌ Akkaunt ulanmagan."); return; }
    const where: Prisma.DebtWhereInput = {
      isDeleted: false,
      status: { notIn: ["paid", "cancelled"] },
      ...(user.role === "admin" && user.branchId ? { branchId: user.branchId } : {}),
    };
    const debts = await prisma.debt.findMany({ where });
    const total = debts.reduce((a, d) => a + Number(d.remainingAmount.toString()), 0);
    await ctx.reply(
      `💰 Jami faol qarz: *${total.toLocaleString("uz-UZ")} so'm*\n` +
        `Sonidan: ${debts.length} ta`,
      { parse_mode: "Markdown" },
    );
  });

  bot.command("stats", async (ctx) => {
    const user = await prisma.user.findFirst({ where: { telegramId: String(ctx.from!.id), isActive: true } });
    if (!user) { await ctx.reply("❌ Akkaunt ulanmagan."); return; }
    const startOfDay = new Date(); startOfDay.setHours(0, 0, 0, 0);
    const branchFilter = user.role === "admin" && user.branchId ? { branchId: user.branchId } : {};
    const [activeDebts, todayDebts, todayPayments] = await Promise.all([
      prisma.debt.count({ where: { isDeleted: false, status: { notIn: ["paid", "cancelled"] }, ...branchFilter } }),
      prisma.debt.count({ where: { isDeleted: false, createdAt: { gte: startOfDay }, ...branchFilter } }),
      prisma.payment.findMany({
        where: { paidDate: { gte: startOfDay }, ...(branchFilter.branchId ? { debt: branchFilter } : {}) },
      }),
    ]);
    const todayPaid = todayPayments.reduce((a, p) => a + Number(p.amount.toString()), 0);
    await ctx.reply(
      `📊 *Bugungi statistika*\n\n` +
        `📦 Faol qarzlar: ${activeDebts}\n` +
        `➕ Bugun qo'shildi: ${todayDebts}\n` +
        `💵 Bugun to'landi: ${todayPaid.toLocaleString("uz-UZ")} so'm`,
      { parse_mode: "Markdown" },
    );
  });

  bot.command("unlink", async (ctx) => {
    const user = await prisma.user.findFirst({ where: { telegramId: String(ctx.from!.id) } });
    if (!user) { await ctx.reply("Akkaunt ulanmagan edi."); return; }
    await prisma.user.update({ where: { id: user.id }, data: { telegramId: null, telegramUsername: null } });
    await ctx.reply("✅ Akkaunt botdan uzildi.");
  });

  bot.catch((err) => {
    console.error("Bot error:", err);
  });

  // ======================== Notifier ===================================
  const notifier: Notifier = {
    async notifyOwner(message: string) {
      try {
        const owners = await prisma.user.findMany({
          where: { role: "owner", isActive: true, telegramId: { not: null } },
        });
        for (const o of owners) {
          if (o.telegramId) {
            try {
              await bot.api.sendMessage(o.telegramId, message, { parse_mode: "Markdown" });
            } catch (err) {
              console.error("notifyOwner failed for", o.id, err);
            }
          }
        }
      } catch (err) {
        console.error("notifyOwner error:", err);
      }
    },
    async notifyUser(userId: number, message: string) {
      try {
        const u = await prisma.user.findUnique({ where: { id: userId } });
        if (u?.telegramId) {
          try {
            await bot.api.sendMessage(u.telegramId, message, { parse_mode: "Markdown" });
          } catch (err) {
            console.error("notifyUser failed:", err);
          }
        }
      } catch (err) {
        console.error("notifyUser error:", err);
      }
    },
    async consumeCode(code: string) { return Promise.resolve(config.consumeLinkCode(code)); },
  };

  return { bot, notifier };
}
