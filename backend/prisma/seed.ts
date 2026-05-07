import { PrismaClient, Prisma } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

const SALT_ROUNDS = 12;

// Sana yordamchilari (Asia/Tashkent zonasiga e'tibor — saqlashda UTC, ko'rsatishda zona)
const now = new Date();
const daysAgo = (n: number) => new Date(now.getTime() - n * 24 * 60 * 60 * 1000);
const daysFromNow = (n: number) => new Date(now.getTime() + n * 24 * 60 * 60 * 1000);

const D = (v: number | string) => new Prisma.Decimal(v);

async function main() {
  console.log("Seed boshlandi...");

  // -----------------------------------------------------------
  // 1. Eski ma'lumotlarni tozalash (toza seed uchun)
  // -----------------------------------------------------------
  console.log("Eski ma'lumotlarni tozalash...");
  await prisma.auditLog.deleteMany();
  await prisma.reminder.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.debt.deleteMany();
  await prisma.client.deleteMany();
  await prisma.user.deleteMany();
  await prisma.branch.deleteMany();
  // SQLite autoincrement counter'ini reset qilish — har safar 1'dan boshlasin
  await prisma.$executeRawUnsafe(
    `DELETE FROM sqlite_sequence WHERE name IN ('Branch','User','Client','Debt','Payment','Reminder','AuditLog')`,
  );

  // -----------------------------------------------------------
  // 2. Filiallar
  // -----------------------------------------------------------
  console.log("Filiallar yaratilmoqda...");
  const branchCentral = await prisma.branch.create({
    data: {
      name: "Markaziy filial",
      address: "Toshkent shahri, Amir Temur ko'chasi 12-uy",
      phone: "+998 71 200 10 10",
      isActive: true,
    },
  });

  const branchChilonzor = await prisma.branch.create({
    data: {
      name: "Chilonzor filiali",
      address: "Toshkent shahri, Chilonzor 7-mavze, 35-uy",
      phone: "+998 71 200 20 20",
      isActive: true,
    },
  });

  // -----------------------------------------------------------
  // 3. Foydalanuvchilar — 1 ega + har filialga 1 admin
  // -----------------------------------------------------------
  console.log("Foydalanuvchilar yaratilmoqda...");
  const ownerPassword = await bcrypt.hash("owner123", SALT_ROUNDS);
  const adminPassword = await bcrypt.hash("admin123", SALT_ROUNDS);

  const owner = await prisma.user.create({
    data: {
      username: "owner",
      passwordHash: ownerPassword,
      fullName: "Tarmoq Egasi",
      role: "owner",
      branchId: null,
      isActive: true,
    },
  });

  const admin1 = await prisma.user.create({
    data: {
      username: "admin1",
      passwordHash: adminPassword,
      fullName: "Aliyev Sanjar",
      role: "admin",
      branchId: branchCentral.id,
      isActive: true,
    },
  });

  const admin2 = await prisma.user.create({
    data: {
      username: "admin2",
      passwordHash: adminPassword,
      fullName: "Karimov Bahrom",
      role: "admin",
      branchId: branchChilonzor.id,
      isActive: true,
    },
  });

  // -----------------------------------------------------------
  // 4. Mijozlar — har filialga 3 ta
  // -----------------------------------------------------------
  console.log("Mijozlar yaratilmoqda...");

  // Markaziy filial mijozlari
  const c1 = await prisma.client.create({
    data: {
      branchId: branchCentral.id,
      name: "Aliyev Vali",
      phone: "+998901234567",
      notes: "Doimiy mijoz",
    },
  });

  const c2 = await prisma.client.create({
    data: {
      branchId: branchCentral.id,
      name: "Karimov Bobur",
      phone: "+998912345678",
      notes: null,
    },
  });

  const c3 = await prisma.client.create({
    data: {
      branchId: branchCentral.id,
      name: "Yusupov Farrux",
      phone: "+998933456789",
      notes: "Bilyard ixlosmandi",
    },
  });

  // Chilonzor filial mijozlari
  const c4 = await prisma.client.create({
    data: {
      branchId: branchChilonzor.id,
      name: "Rahimov Sherzod",
      phone: "+998944567890",
      notes: null,
    },
  });

  const c5 = await prisma.client.create({
    data: {
      branchId: branchChilonzor.id,
      name: "Toshmatov Jasur",
      phone: "+998955678901",
      notes: "PS5 doimiy o'ynaydi",
    },
  });

  const c6 = await prisma.client.create({
    data: {
      branchId: branchChilonzor.id,
      name: "Ergashev Akmal",
      phone: "+998966789012",
      notes: null,
    },
  });

  // -----------------------------------------------------------
  // 5. Qarzlar — turli statuslar bilan
  // -----------------------------------------------------------
  console.log("Qarzlar yaratilmoqda...");

  // ----- Markaziy filial qarzlari -----

  // Faol qarz, kelajakda muddati
  const debt1 = await prisma.debt.create({
    data: {
      branchId: branchCentral.id,
      clientId: c1.id,
      itemType: "playstation",
      itemDetails: "PS5 — 3 soat",
      amount: D(50000),
      paidAmount: D(0),
      remainingAmount: D(50000),
      borrowedDate: daysAgo(2),
      dueDate: daysFromNow(5),
      status: "active",
      notes: "Yakshanba kuni qaytaradi",
      createdById: admin1.id,
    },
  });

  // Bugun muddati tugaydigan qarz (sariq)
  const debt2 = await prisma.debt.create({
    data: {
      branchId: branchCentral.id,
      clientId: c2.id,
      itemType: "billiard",
      itemDetails: "Bilyard 2 soat",
      amount: D(80000),
      paidAmount: D(0),
      remainingAmount: D(80000),
      borrowedDate: daysAgo(7),
      dueDate: now,
      status: "active",
      notes: null,
      createdById: admin1.id,
    },
  });

  // Muddati o'tgan qarz (qizil)
  const debt3 = await prisma.debt.create({
    data: {
      branchId: branchCentral.id,
      clientId: c3.id,
      itemType: "billiard",
      itemDetails: "Bilyard 4 soat",
      amount: D(160000),
      paidAmount: D(0),
      remainingAmount: D(160000),
      borrowedDate: daysAgo(20),
      dueDate: daysAgo(5),
      status: "overdue",
      notes: "Telefoni javob bermayapti",
      createdById: admin1.id,
    },
  });

  // Qisman to'langan qarz
  const debt4 = await prisma.debt.create({
    data: {
      branchId: branchCentral.id,
      clientId: c1.id,
      itemType: "computer",
      itemDetails: "Kompyuter 5 soat",
      amount: D(75000),
      paidAmount: D(40000),
      remainingAmount: D(35000),
      borrowedDate: daysAgo(10),
      dueDate: daysFromNow(3),
      status: "partial",
      notes: null,
      createdById: admin1.id,
    },
  });

  // To'liq to'langan qarz
  const debt5 = await prisma.debt.create({
    data: {
      branchId: branchCentral.id,
      clientId: c2.id,
      itemType: "playstation",
      itemDetails: "PS5 — 1 soat",
      amount: D(25000),
      paidAmount: D(25000),
      remainingAmount: D(0),
      borrowedDate: daysAgo(15),
      dueDate: daysAgo(8),
      status: "paid",
      notes: "Vaqtida to'lagan",
      createdById: admin1.id,
    },
  });

  // ----- Chilonzor filial qarzlari -----

  // Faol qarz
  const debt6 = await prisma.debt.create({
    data: {
      branchId: branchChilonzor.id,
      clientId: c4.id,
      itemType: "playstation",
      itemDetails: "PS5 — 2 soat",
      amount: D(40000),
      paidAmount: D(0),
      remainingAmount: D(40000),
      borrowedDate: daysAgo(1),
      dueDate: daysFromNow(7),
      status: "active",
      notes: null,
      createdById: admin2.id,
    },
  });

  // Ertaga muddati tugaydigan
  const debt7 = await prisma.debt.create({
    data: {
      branchId: branchChilonzor.id,
      clientId: c5.id,
      itemType: "playstation",
      itemDetails: "PS5 — 4 soat",
      amount: D(100000),
      paidAmount: D(0),
      remainingAmount: D(100000),
      borrowedDate: daysAgo(6),
      dueDate: daysFromNow(1),
      status: "active",
      notes: null,
      createdById: admin2.id,
    },
  });

  // Muddati o'tgan
  const debt8 = await prisma.debt.create({
    data: {
      branchId: branchChilonzor.id,
      clientId: c6.id,
      itemType: "computer",
      itemDetails: "Kompyuter 3 soat",
      amount: D(45000),
      paidAmount: D(0),
      remainingAmount: D(45000),
      borrowedDate: daysAgo(12),
      dueDate: daysAgo(3),
      status: "overdue",
      notes: null,
      createdById: admin2.id,
    },
  });

  // Qisman to'langan
  const debt9 = await prisma.debt.create({
    data: {
      branchId: branchChilonzor.id,
      clientId: c5.id,
      itemType: "billiard",
      itemDetails: "Bilyard 2.5 soat",
      amount: D(100000),
      paidAmount: D(60000),
      remainingAmount: D(40000),
      borrowedDate: daysAgo(8),
      dueDate: daysFromNow(2),
      status: "partial",
      notes: null,
      createdById: admin2.id,
    },
  });

  // -----------------------------------------------------------
  // 6. To'lovlar — qisman va to'liq to'lov yozuvlarini yaratish
  // -----------------------------------------------------------
  console.log("To'lovlar yaratilmoqda...");

  // debt4 uchun qisman to'lov (40000)
  await prisma.payment.create({
    data: {
      debtId: debt4.id,
      amount: D(40000),
      method: "cash",
      paidDate: daysAgo(3),
      notes: "Naqd to'lagan",
      recordedById: admin1.id,
    },
  });

  // debt5 uchun ikki bo'lib to'liq to'lov (10000 + 15000)
  await prisma.payment.create({
    data: {
      debtId: debt5.id,
      amount: D(10000),
      method: "card",
      paidDate: daysAgo(12),
      notes: null,
      recordedById: admin1.id,
    },
  });
  await prisma.payment.create({
    data: {
      debtId: debt5.id,
      amount: D(15000),
      method: "card",
      paidDate: daysAgo(8),
      notes: null,
      recordedById: admin1.id,
    },
  });

  // debt9 uchun qisman to'lov (60000)
  await prisma.payment.create({
    data: {
      debtId: debt9.id,
      amount: D(60000),
      method: "transfer",
      paidDate: daysAgo(2),
      notes: "Click orqali",
      recordedById: admin2.id,
    },
  });

  // -----------------------------------------------------------
  // 7. Audit log namunasi (login va seed yozuvlari)
  // -----------------------------------------------------------
  console.log("Audit log yozuvlari yaratilmoqda...");

  await prisma.auditLog.create({
    data: {
      userId: owner.id,
      action: "create",
      tableName: "Branch",
      recordId: branchCentral.id,
      branchId: branchCentral.id,
      newValue: JSON.stringify({ name: branchCentral.name }),
    },
  });
  await prisma.auditLog.create({
    data: {
      userId: owner.id,
      action: "create",
      tableName: "Branch",
      recordId: branchChilonzor.id,
      branchId: branchChilonzor.id,
      newValue: JSON.stringify({ name: branchChilonzor.name }),
    },
  });
  await prisma.auditLog.create({
    data: {
      userId: owner.id,
      action: "create",
      tableName: "User",
      recordId: admin1.id,
      branchId: branchCentral.id,
      newValue: JSON.stringify({ username: admin1.username, role: admin1.role }),
    },
  });
  await prisma.auditLog.create({
    data: {
      userId: owner.id,
      action: "create",
      tableName: "User",
      recordId: admin2.id,
      branchId: branchChilonzor.id,
      newValue: JSON.stringify({ username: admin2.username, role: admin2.role }),
    },
  });

  // Mijozlar uchun audit log
  for (const c of [c1, c2, c3]) {
    await prisma.auditLog.create({
      data: {
        userId: admin1.id,
        action: "create",
        tableName: "Client",
        recordId: c.id,
        branchId: branchCentral.id,
        newValue: JSON.stringify({ name: c.name, phone: c.phone }),
        ipAddress: "192.168.1.10",
      },
    });
  }
  for (const c of [c4, c5, c6]) {
    await prisma.auditLog.create({
      data: {
        userId: admin2.id,
        action: "create",
        tableName: "Client",
        recordId: c.id,
        branchId: branchChilonzor.id,
        newValue: JSON.stringify({ name: c.name, phone: c.phone }),
        ipAddress: "192.168.1.20",
      },
    });
  }

  // Qarzlar uchun audit log (yaratish va kerak bo'lsa update)
  const debts = [
    { d: debt1, by: admin1, branch: branchCentral },
    { d: debt2, by: admin1, branch: branchCentral },
    { d: debt3, by: admin1, branch: branchCentral },
    { d: debt4, by: admin1, branch: branchCentral },
    { d: debt5, by: admin1, branch: branchCentral },
    { d: debt6, by: admin2, branch: branchChilonzor },
    { d: debt7, by: admin2, branch: branchChilonzor },
    { d: debt8, by: admin2, branch: branchChilonzor },
    { d: debt9, by: admin2, branch: branchChilonzor },
  ];

  for (const { d, by, branch } of debts) {
    await prisma.auditLog.create({
      data: {
        userId: by.id,
        action: "create",
        tableName: "Debt",
        recordId: d.id,
        branchId: branch.id,
        newValue: JSON.stringify({
          amount: d.amount.toString(),
          itemType: d.itemType,
          status: d.status,
        }),
        ipAddress: by.id === admin1.id ? "192.168.1.10" : "192.168.1.20",
      },
    });
  }

  // To'lovlar uchun audit log (har bir to'lov yozilganda qarz statusi yangilangan ham)
  const allPayments = await prisma.payment.findMany({
    include: { debt: { include: { branch: true } }, recordedBy: true },
  });
  for (const p of allPayments) {
    await prisma.auditLog.create({
      data: {
        userId: p.recordedById,
        action: "payment",
        tableName: "Payment",
        recordId: p.id,
        branchId: p.debt.branchId,
        newValue: JSON.stringify({
          amount: p.amount.toString(),
          method: p.method,
          debtId: p.debtId,
        }),
        ipAddress: p.recordedBy.id === admin1.id ? "192.168.1.10" : "192.168.1.20",
      },
    });
    // Qarz status update
    await prisma.auditLog.create({
      data: {
        userId: p.recordedById,
        action: "update",
        tableName: "Debt",
        recordId: p.debtId,
        branchId: p.debt.branchId,
        oldValue: JSON.stringify({ paidAmount: "0" }),
        newValue: JSON.stringify({ paidAmount: p.amount.toString(), trigger: "payment" }),
        ipAddress: p.recordedBy.id === admin1.id ? "192.168.1.10" : "192.168.1.20",
      },
    });
  }

  // Login event'lari
  await prisma.auditLog.create({
    data: {
      userId: owner.id,
      action: "login",
      tableName: "User",
      recordId: owner.id,
      ipAddress: "127.0.0.1",
      userAgent: "Mozilla/5.0",
    },
  });
  await prisma.auditLog.create({
    data: {
      userId: admin1.id,
      action: "login",
      tableName: "User",
      recordId: admin1.id,
      branchId: branchCentral.id,
      ipAddress: "192.168.1.10",
      userAgent: "Mozilla/5.0",
    },
  });
  await prisma.auditLog.create({
    data: {
      userId: admin2.id,
      action: "login",
      tableName: "User",
      recordId: admin2.id,
      branchId: branchChilonzor.id,
      ipAddress: "192.168.1.20",
      userAgent: "Mozilla/5.0",
    },
  });

  // -----------------------------------------------------------
  // Xulosa
  // -----------------------------------------------------------
  const branchCount = await prisma.branch.count();
  const userCount = await prisma.user.count();
  const clientCount = await prisma.client.count();
  const debtCount = await prisma.debt.count();
  const paymentCount = await prisma.payment.count();
  const auditCount = await prisma.auditLog.count();

  console.log("\n=== SEED MUVAFFAQIYATLI YAKUNLANDI ===");
  console.log(`Filiallar:    ${branchCount}`);
  console.log(`Foydalanuvchilar: ${userCount}`);
  console.log(`Mijozlar:     ${clientCount}`);
  console.log(`Qarzlar:      ${debtCount}`);
  console.log(`To'lovlar:    ${paymentCount}`);
  console.log(`Audit log:    ${auditCount}`);
  console.log("\nTest foydalanuvchilari:");
  console.log("  owner / owner123  (ega — barcha filiallar)");
  console.log("  admin1 / admin123 (admin — Markaziy filial)");
  console.log("  admin2 / admin123 (admin — Chilonzor filial)");
}

main()
  .catch((e) => {
    console.error("SEED XATOLIK:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
