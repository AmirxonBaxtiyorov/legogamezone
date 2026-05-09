// Production seed — minimal: 1 owner + 1 ta filial + 1 ta admin.
// Lokal test seed (seed.ts) ishlatmang, qator-qator ma'lumot.
//
// Ishga tushirish:
//   npx tsx prisma/seed-production.ts
//
// MUHIM: Birinchi loginda OWNER PAROLINI o'zgartiring!

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

const SALT_ROUNDS = 12;

// ENV orqali sozlash mumkin
const OWNER_USERNAME = process.env.SEED_OWNER_USERNAME || "owner";
const OWNER_PASSWORD = process.env.SEED_OWNER_PASSWORD || "owner123";
const OWNER_FULLNAME = process.env.SEED_OWNER_FULLNAME || "Tarmoq Egasi";

const BRANCH_NAME = process.env.SEED_BRANCH_NAME || "Asosiy filial";
const BRANCH_ADDRESS = process.env.SEED_BRANCH_ADDRESS || "";
const BRANCH_PHONE = process.env.SEED_BRANCH_PHONE || "";

async function main() {
  console.log("Production seed boshlandi...");

  // Owner mavjud bo'lsa, qayta yaratmaymiz
  const existingOwner = await prisma.user.findFirst({ where: { role: "owner" } });
  if (!existingOwner) {
    const hash = await bcrypt.hash(OWNER_PASSWORD, SALT_ROUNDS);
    await prisma.user.create({
      data: {
        username: OWNER_USERNAME,
        passwordHash: hash,
        fullName: OWNER_FULLNAME,
        role: "owner",
        branchId: null,
        isActive: true,
      },
    });
    console.log(`✅ Owner yaratildi: ${OWNER_USERNAME} / ${OWNER_PASSWORD} (BIRINCHI LOGINDA O'ZGARTIRING!)`);
  } else {
    console.log(`⏭️  Owner allaqachon mavjud: ${existingOwner.username}`);
  }

  // Filial mavjud bo'lsa, qayta yaratmaymiz
  const existingBranch = await prisma.branch.findFirst();
  if (!existingBranch) {
    await prisma.branch.create({
      data: {
        name: BRANCH_NAME,
        address: BRANCH_ADDRESS || null,
        phone: BRANCH_PHONE || null,
        isActive: true,
      },
    });
    console.log(`✅ Filial yaratildi: ${BRANCH_NAME}`);
  } else {
    console.log(`⏭️  Filial allaqachon mavjud: ${existingBranch.name}`);
  }

  // Tizim sozlamalari (default brending)
  const settings = [
    { key: "systemName", value: "Game Zone Qarz", type: "text" },
    { key: "systemSubtitle", value: "Boshqaruv tizimi", type: "text" },
    { key: "primaryColor", value: "#4f46e5", type: "color" },
    { key: "twoFactorOwner", value: "0", type: "text" },
  ];
  for (const s of settings) {
    await prisma.appSetting.upsert({
      where: { key: s.key },
      create: s,
      update: {}, // mavjud bo'lsa o'zgartirmaymiz
    });
  }
  console.log("✅ Default sozlamalar joylashtirildi");

  console.log("\n=== PRODUCTION SEED YAKUNLANDI ===");
  console.log("Login uchun:");
  console.log(`  Username: ${OWNER_USERNAME}`);
  console.log(`  Password: ${OWNER_PASSWORD}`);
  console.log("\n⚠️  BIRINCHI LOGINDA OWNER PAROLINI O'ZGARTIRING!");
}

main()
  .catch((err) => {
    console.error("Seed xatosi:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
