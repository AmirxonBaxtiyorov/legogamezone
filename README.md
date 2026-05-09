# Game Zone Qarz Boshqaruv Tizimi

Game zone tarmog'i (PlayStation, kompyuter, bilyard) uchun mijozlar qarzlarini yozib borish, kuzatish va eslatib turish web ilovasi. Multi-branch, role-based access control (RBAC), Telegram bot integratsiyasi bilan.

## Stack

| Qatlam | Texnologiya |
|---|---|
| Backend | Node.js 20+, Express 4, TypeScript, Prisma 5 |
| DB (dev) | SQLite |
| DB (prod) | PostgreSQL 16 |
| Frontend | React 18, Vite 6, TypeScript, TailwindCSS 3, shadcn/ui |
| State | Zustand, React Query (@tanstack/react-query) |
| Forma | React Hook Form + Zod |
| Routing | React Router v6 |
| Telegram | grammY |
| Cron | node-cron (Asia/Tashkent) |
| Auth | JWT + bcrypt + 2FA (Telegram OTP) |
| Validatsiya | Zod (backend va frontend) |
| Xavfsizlik | helmet, cors, express-rate-limit |
| Logging | pino |
| Eksport | exceljs, pdfkit |
| Til | uz / cyr / ru (i18n) |

## Tuzilma

```
.
├── backend/                  # Express API + Prisma + Telegram bot + cron
│   ├── src/
│   │   ├── config/           # env, prisma — markaziy konfiguratsiya
│   │   ├── lib/              # jwt, bcrypt, decimal, logger, otp
│   │   ├── middleware/       # auth, rbac, branchScope, rateLimit, audit, errorHandler, validate
│   │   ├── schemas/          # Zod schemalar (auth, client, debt, payment, ...)
│   │   ├── types/            # express.d.ts (req.viewer)
│   │   ├── preview-server.ts # asosiy server (modulli refactor jarayonida)
│   │   └── telegram-bot.ts   # bot setup
│   ├── prisma/               # schema, migrations, seed
│   ├── public/               # vanilla JS dashboard (legacy)
│   └── Dockerfile
├── frontend/                 # React + Vite SPA
│   ├── src/
│   │   ├── components/       # ui/* (shadcn), layout/*
│   │   ├── pages/            # LoginPage, DashboardPage, ...
│   │   ├── lib/              # api, format, utils
│   │   ├── store/            # auth (Zustand)
│   │   └── providers/        # ThemeProvider
│   └── Dockerfile (+ nginx.conf)
├── docker-compose.yml        # postgres + backend + frontend
├── package.json              # workspaces ildiz
└── PROMPT_FINALIZE.md        # to'liq texnik topshiriq
```

## Boshlash (development)

```bash
# 1) Bog'liqliklar
npm install

# 2) Backend env
cp backend/.env.example backend/.env
# .env ni tahrirlang (TELEGRAM_BOT_TOKEN, TELEGRAM_OWNER_ID)

# 3) Ma'lumotlar bazasi
npm run db:migrate
npm run db:seed

# 4) Backend (porti 4000)
npm run dev:backend

# 5) Frontend (porti 5173, /api proxy → 4000)
npm run dev:frontend
```

Brauzerda: http://localhost:5173

## Test foydalanuvchilari

| Username | Parol | Rol | Filial |
|----------|--------|-----|--------|
| `owner` | `owner123` | owner | — |
| `admin1` | `admin123` | admin | Markaziy filial |
| `admin2` | `admin123` | admin | Chilonzor filiali |

## Production (Docker)

```bash
# 1) .env yarating (yoki shell o'zgaruvchilar bering)
export JWT_SECRET="$(openssl rand -base64 64)"
export DB_PASSWORD="strong-password-here"
export TELEGRAM_BOT_TOKEN="..."
export TELEGRAM_OWNER_ID="..."

# 2) Build va ishga tushirish
docker compose up -d --build

# Frontend: http://localhost
# Backend API: http://localhost:4000/api
```

To'liq deployment qoidalari uchun [DEPLOYMENT.md](DEPLOYMENT.md) ga qarang.

## Xavfsizlik

- **JWT only** — `?asUser` query fallback olib tashlandi
- **Production'da JWT_SECRET** kamida 64 belgi bo'lishi shart, default qiymat tekshiriladi
- **2FA owner uchun** — Telegramga 6-raqamli OTP, DB'da bcrypt hash, 5 daqiqa amal qiladi
- **Rate limit** — login 5/daqiqa, umumiy API 100/daqiqa
- **Helmet** + **CORS allowlist** (CORS_ORIGIN)
- **Zod validatsiya** — auth oqimida + asosiy schemalar
- **Audit log** — barcha mutatsiyalar (login, qarz, to'lov, mijoz, parol almashtirish)
- **$transaction** — to'lov va status update atomic

## Hozirgi holat (2026-05-08)

Loyiha **production-ready holat sari yo'lda**. Bajarilgan:

✅ Backend xavfsizlik hardening (P0): JWT only, helmet, CORS, rate limit, 2FA in DB, JWT_SECRET validatsiyasi  
✅ Modulli foundation: config, lib, middleware, schemas, types  
✅ Pino structured logging  
✅ Frontend Vite+React+TS+Tailwind+shadcn skeleton  
✅ Login + 2FA + Dashboard (boshqaruv paneli) ishlaydi  
✅ Docker + docker-compose (PostgreSQL + backend + nginx-frontend)  
✅ Multi-stage Dockerfile (backend va frontend)

⏳ Keyingi sessiyalar uchun: 11 sahifa CRUD frontend feature parity, Vitest+Playwright testlar, modulli backend refactor (preview-server.ts → routes/services), GitHub Actions CI, Swagger/OpenAPI, PWA va polish.

To'liq texnik topshiriq: [PROMPT_FINALIZE.md](PROMPT_FINALIZE.md)
