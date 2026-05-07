# Game Zone Qarz Boshqaruv Tizimi

Game zone tarmog'i (PlayStation, kompyuter, bilyard) uchun mijozlar qarzlarini yozib borish, kuzatish va eslatib turish web ilovasi. Multi-branch, role-based access control (RBAC) bilan ishlaydi.

## Stack

- **Backend**: Node.js + Express + TypeScript + Prisma ORM + SQLite
- **Frontend**: React + Vite + TypeScript + TailwindCSS + shadcn/ui
- **Telegram bot**: grammY
- **Cron**: node-cron
- **Auth**: JWT + bcrypt
- **Validatsiya**: Zod
- **Vaqt zonasi**: Asia/Tashkent

## Tuzilma

```
.
├── backend/         # Express API + Prisma + Telegram bot + cron
├── frontend/        # React + Vite SPA
├── package.json     # workspaces ildiz
└── README.md
```

## Boshlash

```bash
# Bog'liqliklarni o'rnatish
npm install

# Ma'lumotlar bazasini sozlash
npm run db:migrate
npm run db:seed

# Backend serverni ishga tushirish
npm run dev:backend

# Frontend dev serverni ishga tushirish
npm run dev:frontend
```

## Test foydalanuvchilari (seed dan keyin)

| Username | Parol | Rol | Filial |
|----------|--------|-----|--------|
| `owner` | `owner123` | owner | — |
| `admin1` | `admin123` | admin | Filial #1 (Markaziy) |
| `admin2` | `admin123` | admin | Filial #2 (Chilonzor) |

## Bosqichlar

Loyiha 21 bosqichdan iborat. Hozirgi bosqich va keyingi rejalar `docs/` papkasida (keyinchalik) tasvirlanadi.
