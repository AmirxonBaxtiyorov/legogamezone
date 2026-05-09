# O'zgarishlar tarixi

## [2.0.0] — 2026-05-10

### O'zgartirildi
- **Telegram bot integratsiyasi olib tashlandi** — barcha bildirishnomalar endi frontend'da (sonner toast + NotificationBell qo'ng'irog'i)
- **2FA olib tashlandi** — login oddiy username/parol orqali
- **Daily reminder cron** olib tashlandi — frontend bell har 60 soniyada yangilanadi
- `node-cron`, `grammy` paketlar dependencies'dan olib tashlandi
- `OtpCode` jadvali, `User.telegramId/telegramUsername` ustunlari schema'dan olib tashlandi
- `twoFactorOwner` sozlamasi olib tashlandi

### Tuzatildi
- TypeScript build xatolari (Prisma.Decimal namespace, implicit any)
- Railpack/Nixpacks bilan to'qnashuv: `railpack.json` va `nixpacks.toml` o'chirildi (faqat Dockerfile ishlatiladi)
- `railway.json`'dagi noto'g'ri startCommand olib tashlandi (Dockerfile CMD ishlatiladi)

## [1.0.0] — 2026-05-07

- Birinchi versiya: Express + Prisma + React + Tailwind asosida MVP
