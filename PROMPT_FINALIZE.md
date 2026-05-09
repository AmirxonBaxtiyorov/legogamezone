# Game Zone Qarz — Loyihani to'liq tugatish PROMPTI

> Bu hujjat AI yoki dasturchiga berilishi mumkin bo'lgan **to'liq texnik topshiriq**. Joriy holatdan boshlab production-ready holatigacha har bir bosqichni qamrab oladi.

---

## 0) LOYIHA HAQIDA QISQACHA

**Game Zone Qarz** — game zone tarmog'i (PlayStation, kompyuter, bilyard) uchun **multi-branch (ko'p filialli) qarz boshqaruv tizimi**. Mijozlar olgan qarzlarini yozib borish, kuzatish, eslatma yuborish va to'lovlarni qayd etish — bularning hammasi RBAC (rolga asoslangan) ruxsat bilan.

**Mavjud stack:**
- Backend: Node.js 20+ / Express 4 / TypeScript / Prisma 5 / SQLite (dev) / PostgreSQL (prod uchun rejalashtirilgan)
- Frontend (rejalashtirilgan, qurilmagan): React 18 + Vite + TypeScript + TailwindCSS + shadcn/ui
- Hozirgi frontend: vanilla JS dashboard (`backend/public/`)
- Telegram bot: grammY
- Auth: JWT + bcrypt (12 rounds) + ixtiyoriy 2FA Telegram orqali
- Cron: node-cron (Asia/Tashkent vaqt zonasi)
- Eksport: pdfkit + exceljs

**Til:** o'zbekcha (lotin alifbosi). Code identifierlar — inglizcha. UI matnlari — uzbekcha (`uz`), kirill (`cyr`), ruscha (`ru`) i18n.

---

## 1) JORIY HOLAT — NIMA QILINGAN

### ✅ Backend (`backend/src/preview-server.ts`, ~2950 qator)
- JWT auth (`/api/login`, `/api/me`, `/api/logout`, `/api/login/2fa`)
- 2FA owner uchun (Telegram'ga 6 xonali kod, 5 daqiqa amal qiladi)
- Branch-scope RBAC: owner barcha filiallarni, admin faqat o'zinikini
- Mijoz CRUD (`/api/clients/*`), qora ro'yxat (`/api/clients/:id/blacklist`)
- Qarz CRUD (`/api/debts/*`), to'lov yozish, soft+hard delete
- Filial CRUD (`/api/branches/*`) — force delete bilan cascade
- Admin boshqaruvi (`/api/admins/*`) — owner uchun
- Audit log (`/api/audit-logs`) — barcha mutatsiyalar yoziladi
- Statistik API (`/api/stats`, `/api/list`, `/api/debtors`, `/api/reports/monthly`)
- Mijoz qidirish (`/api/search/clients`, `/api/clients/all`)
- Telegram bot (grammY): `/start`, `/today`, `/overdue`, `/total`, `/stats` + admin link kodi
- Cron: har kuni 09:00'da kechikkan/bugun/ertaga qarzlar haqida eslatma
- Eksport: Excel (`/api/export/excel`), PDF (`/api/export/pdf`)
- Backup/Restore: SQLite faylni stream (`/api/backup`, `/api/restore`)
- Tizim sozlamalari (logo, nom, rang, 2FA flag) — `/api/settings`

### ✅ Frontend (vanilla JS — `backend/public/app.js`, ~4280 qator)
- Login formasi + 2FA tasdiqlash
- Dashboard: statistika kartalari, 30-kunlik chart, status taqsimoti, to'lov usullari
- Filial taqqoslash (owner uchun)
- Mijoz qidirish header'da
- Mijozlar ro'yxati ("Mijozlar" tugmasi)
- Qarzdorlar ro'yxati ("Qarzdorlar" tugmasi)
- Modallar: qarz qo'shish, to'lov yozish, mijoz tahrirlash, blacklist
- Chek chop etish (80mm thermal printer formati)
- Eksport formasi (Excel/PDF)
- Backup yuklab olish + restore
- Profil dropdown: Sozlamalar, Filiallar, Adminlar, Mijozlar, Audit, Hisobotlar, Backup, Eksport, Logout
- 3 tilli i18n (uz / cyr / ru)
- Tema (dark/light) + bell notification
- Real-time refresh har 30s

### ✅ Schema (`backend/prisma/schema.prisma`)
8 ta model: `Branch`, `User`, `Client`, `Debt`, `Payment`, `Reminder`, `AuditLog`, `AppSetting` + 3 ta migration applied.

---

## 2) NIMA QILINMAGAN — MUAMMOLAR

### 🔴 P0 — Xavfsizlik / barqarorlik (PRODUCTION'GA QO'YIB BO'LMAYDI)

| # | Muammo | Yechim |
|---|---|---|
| 1 | `?asUser=N` query param fallback'i — autentifikatsiyani aylanib o'tadi | `getViewer`'dan asUser branch'ini olib tashlash, faqat JWT |
| 2 | Zod validatsiyasi yo'q — `req.body` xom holda ishlatiladi | Har bir endpoint uchun Zod schema yaratish |
| 3 | Rate limiting yo'q — login brute-force ochiq | `express-rate-limit` o'rnatish, login uchun 5/daqiqa |
| 4 | CORS middleware yo'q | `cors` paket, `CORS_ORIGIN` env'dan o'qish |
| 5 | Security headers yo'q | `helmet()` middleware qo'shish |
| 6 | 2FA kodlari RAM'da (`Map`) — server restart'da yo'qoladi | Redis yoki DB jadvaliga ko'chirish (TTL bilan) |
| 7 | Multi-step operatsiyalar atomic emas — payment + audit yarim ishlashi mumkin | `prisma.$transaction()` o'rab olish |
| 8 | JWT_SECRET zaif default qiymati | Production'da `JWT_SECRET.length >= 64` ni majburlash |
| 9 | Soft-delete filtri ko'p endpointlarda yo'q (`isDeleted: false`) | Audit qilib hammasiga qo'shish |
| 10 | Decimal → Number konvertatsiyasi katta summalarda aniqlik yo'qotadi | Pul summalarini string sifatida saqlash yoki BigInt |

### 🟡 P1 — Arxitektura (qo'l ostida)

| # | Muammo | Yechim |
|---|---|---|
| 11 | `preview-server.ts` 2950 qatorlik monolit | Modulli tuzilma: `src/routes/`, `src/services/`, `src/middleware/`, `src/lib/` |
| 12 | Auth har endpointda qo'lda chaqiriladi | `requireAuth`, `requireOwner` middleware |
| 13 | Branch-scope qo'lda tekshiriladi | `branchScopeMiddleware` |
| 14 | Audit log qo'lda yoziladi | `auditMiddleware` yoki Prisma `$extends` |
| 15 | Global error handler yo'q | `app.use(errorHandler)` middleware |
| 16 | Logging — `console.log/error` | `pino` + structured logging |
| 17 | Telegram bot va cron monolitda | Alohida `src/bot/`, `src/cron/` modullari |
| 18 | Pagination yo'q — barcha qatorlar bir vaqtda yuklanadi | `?limit=20&offset=0` standartlash |
| 19 | Express.d.ts yo'q — `req.user` uchun typing yo'q | TypeScript declaration merging |

### 🔵 P2 — Frontend (REACT) — to'liq qurish kerak

| # | Komponent / sahifa | Tavsif |
|---|---|---|
| 20 | `frontend/` papkasi bo'sh | Vite + React 18 + TS bootstrap |
| 21 | TailwindCSS + shadcn/ui setup | Theme provider, dark mode |
| 22 | React Query (`@tanstack/react-query`) | API client + cache |
| 23 | Zustand store | Auth state, settings, branch filter |
| 24 | React Router v6 | `/login`, `/dashboard`, `/clients`, `/debts`, `/payments`, `/reports`, `/settings` |
| 25 | React Hook Form + Zod resolver | Barcha forma'lar |
| 26 | Sahifalar: Login (+ 2FA), Dashboard, Clients, ClientDetail, Debts, Payments, Reports, Audit, Settings, Branches, Admins | Vanilla JS UI'dan ko'chirish |
| 27 | Recharts | Timeline, status, methods chartlari |
| 28 | lucide-react | Icon library (emoji'lar o'rniga) |
| 29 | Mobile responsive | Tablet (>=768px) va telefon (>=375px) breakpoints |
| 30 | Toast (sonner / react-hot-toast) | Bildirishnomalar |

### 🟢 P3 — Test va sifat

| # | Element | Tavsif |
|---|---|---|
| 31 | Vitest setup | Unit + integration testlar |
| 32 | Backend testlari | Auth, RBAC, CRUD oqimlari |
| 33 | Frontend testlari (React Testing Library) | Komponent va flow testlari |
| 34 | E2E (Playwright) | Login → CRUD → Logout flow |
| 35 | ESLint + Prettier | TypeScript ESLint config |
| 36 | Husky + lint-staged | Pre-commit hooks |
| 37 | Swagger / OpenAPI | API hujjatlari |

### 🟣 P4 — DevOps

| # | Element | Tavsif |
|---|---|---|
| 38 | `Dockerfile` (multi-stage) | Backend uchun |
| 39 | `Dockerfile` frontend | Static build + nginx |
| 40 | `docker-compose.yml` | dev / staging / prod |
| 41 | PostgreSQL migratsiya | `DATABASE_URL` PostgreSQL'ga o'tkazish, schema'da provider="postgresql" |
| 42 | GitHub Actions | build → test → deploy oqimi |
| 43 | Nginx config | Reverse proxy + static caching |
| 44 | PM2 yoki systemd service | Process manager |
| 45 | `.env.example` ni mukammallashtirish | Hech qanday secret bo'lmasin |
| 46 | Deployment runbook | Markdown'da to'liq deploy yo'riqnomasi |

### ⚪ P5 — Polish (ixtiyoriy lekin foydali)

| # | Element |
|---|---|
| 47 | PWA manifest + service worker (offline qarz qo'shish, sync) |
| 48 | Mijoz fotosi (Client.photoUrl) |
| 49 | Kreditlimit (Client.creditLimit) — qarz yaratishda warning |
| 50 | Drag-to-refresh mobile uchun |
| 51 | Dashboard widgetlari sozlanadigan |
| 52 | Filiallar xaritasi (Yandex/Google Maps) |
| 53 | Rasmiy hisobot bosib chiqarish (oylik soliq hisoboti) |
| 54 | Mijoz tarixini grafik (mini chart per client) |

---

## 3) TO'LIQ MUVAFFAQIYAT MEZONLARI

Loyiha "tugatilgan" deb sanaladi qachonki:

1. **Xavfsizlik:**
   - JWT only auth, `?asUser` yo'q
   - Zod validatsiyasi har endpoint'da
   - Rate limiting login + general API
   - Helmet + CORS + structured logging
   - Multi-step operatsiyalar `$transaction` ichida

2. **Arxitektura:**
   - Backend modulli (auth, clients, debts, payments, branches, admins, exports, settings)
   - Middleware chain: rateLimit → cors → helmet → auth → branchScope → handler → errorHandler
   - Telegram bot, cron — alohida modullar

3. **Frontend:**
   - React + Vite SPA
   - Vanilla JS dashboard'idagi har bir feature React'da takrorlangan
   - Mobile responsive
   - PWA bonus (offline qarz qo'shish)

4. **Sifat:**
   - Vitest unit/integration testlar — ≥80% coverage
   - Playwright E2E — kritik 5 oqim
   - ESLint + Prettier toza, husky pre-commit ishlaydi
   - Swagger UI `/api/docs`

5. **DevOps:**
   - `docker-compose up` to'liq dev muhitni ko'taradi (DB + backend + frontend)
   - GitHub Actions: PR'da test, main'da deploy
   - Production: nginx + PostgreSQL + PM2/Docker

6. **Hujjatlar:**
   - README to'liq (setup, dev, build, deploy)
   - API.md (Swagger linki + examples)
   - DEPLOYMENT.md (production runbook)
   - CHANGELOG.md (versiyalar tarixi)

---

## 4) BAJARISH BO'YICHA TAVSIYA QILINGAN BOSQICHLAR

### Bosqich A — Backend hardening (1 hafta)
1. Zod schema'larni har endpoint uchun yarat (`src/schemas/*.ts`)
2. Middleware chain yarat (`src/middleware/auth.ts`, `branchScope.ts`, `audit.ts`, `errorHandler.ts`)
3. preview-server.ts'ni split: `src/routes/auth.ts`, `clients.ts`, `debts.ts`, `payments.ts`, `branches.ts`, `admins.ts`, `exports.ts`, `settings.ts`, `reports.ts`
4. `?asUser` fallback'ini olib tashla
5. Helmet + CORS + rate-limit qo'sh
6. Pino logger
7. Multi-step ops uchun `$transaction`
8. 2FA kodlarini DB'ga ko'chir (yangi `OtpCode` jadvali yoki Redis)
9. Backend testlari (Vitest + supertest)

### Bosqich B — DevOps (3 kun)
10. `Dockerfile` (backend, multi-stage)
11. `docker-compose.yml` (PostgreSQL + backend)
12. PostgreSQL migration sinash
13. `.env.example` mukammallashtirish
14. GitHub Actions: lint + test + build

### Bosqich C — Frontend bootstrap (1 hafta)
15. Vite + React 18 + TS init `frontend/` ichida
16. TailwindCSS + shadcn/ui o'rnatish
17. React Router + auth guard
18. React Query + Axios client (token interceptor)
19. Zustand store (auth, settings, branch filter)
20. Login (+ 2FA) sahifa
21. Dashboard sahifa (stat cards, charts)

### Bosqich D — Frontend feature parity (2 hafta)
22. Clients CRUD sahifasi (list + detail + edit + blacklist)
23. Debts CRUD (list + detail + edit + payment recording)
24. Payments list + receipt printing
25. Reports (Monthly + Audit log + Export)
26. Settings + Branches + Admins (owner only)
27. Telegram link form
28. Mobile breakpoint + dark mode polishing

### Bosqich E — Frontend Dockerize + Deploy (2 kun)
29. Frontend `Dockerfile` (nginx static)
30. `docker-compose.yml`'ga frontend qo'sh
31. Nginx reverse proxy: `/` → frontend, `/api` → backend
32. Production env variables

### Bosqich F — Test va polish (1 hafta)
33. E2E testlar (Playwright)
34. Performance optimization (React Query cache, lazy loading)
35. PWA manifest + offline support
36. Bug fixing va polish

### Bosqich G — Hujjatlash + Release (3 kun)
37. README, API.md, DEPLOYMENT.md
38. Swagger UI ulanishi
39. CHANGELOG v1.0.0
40. Birinchi deployment

**Jami taxmin:** 6–7 hafta (1 full-stack dasturchi, 40 soat/hafta)

---

## 5) ARXITEKTURA NAMUNA — modulli backend

```
backend/
├── src/
│   ├── index.ts                    # entry point
│   ├── app.ts                      # Express app yaratish + middleware chain
│   ├── config/
│   │   ├── env.ts                  # Zod bilan env validatsiyasi
│   │   └── prisma.ts               # PrismaClient singleton
│   ├── lib/
│   │   ├── jwt.ts                  # signToken, verifyToken
│   │   ├── bcrypt.ts               # hash, compare
│   │   ├── decimal.ts              # money helpers
│   │   └── logger.ts               # pino instance
│   ├── middleware/
│   │   ├── auth.ts                 # requireAuth, optionalAuth
│   │   ├── rbac.ts                 # requireOwner, requireAdmin
│   │   ├── branchScope.ts          # admin'ni o'z filialiga cheklash
│   │   ├── rateLimit.ts            # express-rate-limit
│   │   ├── audit.ts                # audit log middleware
│   │   ├── errorHandler.ts         # global error handler
│   │   └── validate.ts             # Zod validation wrapper
│   ├── schemas/
│   │   ├── auth.ts                 # login, 2fa schemas
│   │   ├── client.ts
│   │   ├── debt.ts
│   │   ├── payment.ts
│   │   └── ...
│   ├── routes/
│   │   ├── auth.ts                 # /api/login, /api/me, /api/logout
│   │   ├── clients.ts              # /api/clients/*
│   │   ├── debts.ts                # /api/debts/*
│   │   ├── payments.ts
│   │   ├── branches.ts
│   │   ├── admins.ts
│   │   ├── stats.ts
│   │   ├── reports.ts
│   │   ├── exports.ts
│   │   ├── settings.ts
│   │   └── system.ts               # /api/health, /api/system-info, /api/backup
│   ├── services/
│   │   ├── auth.service.ts
│   │   ├── client.service.ts
│   │   ├── debt.service.ts
│   │   ├── payment.service.ts
│   │   ├── reminder.service.ts
│   │   ├── notification.service.ts # Telegram orqali yuborish
│   │   └── export.service.ts
│   ├── bot/
│   │   ├── index.ts                # bot start
│   │   ├── handlers.ts             # /today, /overdue, etc.
│   │   └── notifier.ts             # notifyOwner, notifyUser
│   ├── cron/
│   │   ├── index.ts                # cron schedule
│   │   └── jobs/
│   │       ├── dailyReminders.ts
│   │       └── backupRotation.ts
│   └── types/
│       └── express.d.ts            # req.user augmentation
└── tests/
    ├── unit/
    └── integration/
```

---

## 6) FRONTEND ARXITEKTURA NAMUNA

```
frontend/
├── src/
│   ├── main.tsx
│   ├── App.tsx
│   ├── routes/
│   │   ├── index.tsx
│   │   ├── login.tsx
│   │   ├── dashboard.tsx
│   │   ├── clients/
│   │   │   ├── list.tsx
│   │   │   └── detail.$id.tsx
│   │   ├── debts/
│   │   ├── payments/
│   │   ├── reports/
│   │   ├── settings/
│   │   ├── branches/
│   │   └── admins/
│   ├── lib/
│   │   ├── api.ts                  # Axios instance + interceptors
│   │   ├── queryClient.ts          # React Query setup
│   │   └── format.ts               # money, date helpers
│   ├── store/
│   │   ├── auth.ts                 # Zustand auth store
│   │   └── settings.ts
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   ├── useClients.ts           # React Query hooks
│   │   ├── useDebts.ts
│   │   └── ...
│   ├── components/
│   │   ├── ui/                     # shadcn/ui (Button, Input, etc.)
│   │   ├── layout/                 # Header, Sidebar, ProfileMenu
│   │   ├── charts/                 # Timeline, Status, Methods
│   │   ├── modals/                 # AddDebt, RecordPayment, etc.
│   │   └── shared/                 # ClientCard, DebtCard, etc.
│   ├── i18n/
│   │   ├── uz.json
│   │   ├── cyr.json
│   │   └── ru.json
│   └── types/
│       └── api.ts                  # ApiResponse types
├── tests/
└── public/
```

---

## 7) MUHIM TEXNIK QARORLAR

1. **Pul summalari:** Backend Decimal sifatida saqlaydi, response'da string yuboradi (`amount: "50000"`). Frontend `Number()` qiladi displaydan oldin. Production'da BigInt yoki kichik birlikda (tiyin) saqlash maslahat beriladi.

2. **JWT Strategy:** Access token (15 daqiqa) + Refresh token (30 kun). Hozir faqat access token bor; refresh qo'shish kerak.

3. **Pagination:** Default `limit=20`, `offset=0`. Maksimal `limit=100`. Cursor-based pagination katta jadvallar uchun (`/api/audit-logs`).

4. **Branch scope strategy:** Middleware'da `req.branchFilter = viewer.role === "admin" ? { branchId: viewer.branchId } : {}`; barcha service'lar buni ishlatadi.

5. **Audit log:** Prisma `$extends` orqali avtomatlashtirish mumkin (har `update`/`create`/`delete`'da log yozish). Yoki manual middleware bilan.

6. **2FA TTL:** OtpCode jadvali yarat: `id`, `userId`, `code` (hashed), `expiresAt`, `consumedAt`. Cron har 10 daqiqada eskilarini tozalaydi.

7. **PostgreSQL migratsiya:**
   - `schema.prisma`'da `provider = "postgresql"`
   - `Decimal` aniqligi: `@db.Decimal(15, 2)`
   - SQLite-only `Boolean` fieldlari `@default(false)` PostgreSQL'da ishlaydi
   - Indeksilar to'g'ri

8. **i18n:** `react-i18next` o'rniga oddiy JSON dictionary + custom hook. 3 til, key-based lookup.

9. **Forma validatsiyasi:** Backend va frontend bir xil Zod schema'larni ishlatadi (`shared/schemas/` paketi). Hozircha har birida alohida bo'lsa ham bo'ladi.

10. **Realtime (kelajakda):** Hozircha 30s polling. Production'da SSE (`/api/stream`) yoki Socket.io qo'shish mumkin.

---

## 8) BIRINCHI 100 SOATLIK ROADMAP

| Hafta | Bosqich | Vazifalar |
|---|---|---|
| **1-hafta** | Backend hardening | Bosqich A (Zod, middleware, modulli refactor, $transaction) |
| **2-hafta** | DevOps + PostgreSQL | Bosqich B (Docker, PG migration, GitHub Actions) |
| **3-hafta** | Frontend bootstrap | Bosqich C (Vite, Tailwind, shadcn, auth, dashboard) |
| **4-hafta** | Frontend feature parity (1) | Clients, Debts |
| **5-hafta** | Frontend feature parity (2) | Payments, Reports, Settings, Branches, Admins |
| **6-hafta** | Test va polish | Bosqich F (E2E, perf, mobile) |
| **7-hafta** | Hujjatlar va release | Bosqich G (docs, deploy v1.0) |

---

## 9) YAKUNIY TOPSHIRIQ — AI/dasturchiga

> "Game Zone Qarz loyihasini production-ready holatga keltirish kerak. Joriy holat: backend ishlaydi (preview-server.ts, vanilla JS dashboard), schema va asosiy CRUD lar bor. Lekin xavfsizlik (Zod, rate limit, CORS, helmet, transactions), arxitektura (modulli refactor, middleware chain), frontend (React + Vite to'liq qurish), test (Vitest, Playwright), DevOps (Docker, PostgreSQL, GitHub Actions), va hujjatlar yetishmaydi.
>
> P0 → P1 → P2 → P3 → P4 → P5 tartibida bos. Har bosqich tugagandan keyin tasdiq so'ra. Vaqt zonasi Asia/Tashkent, sanalar `dd.MM.yyyy HH:mm`, pul `45 000 so'm`. RBAC: owner barcha filiallar, admin faqat o'zinikini ko'radi. Audit log majburiy. Soft delete by default; hard delete faqat owner uchun tasdiq bilan. Telegram bot allaqachon ulangan, cron 09:00'da ishlaydi.
>
> Frontend stack: React 18 + Vite + TS + TailwindCSS + shadcn/ui + React Query + Zustand + React Router v6 + React Hook Form + Zod + Recharts + lucide-react. 3 til (uz/cyr/ru), dark+light tema, mobile responsive.
>
> Production deploy: Docker + PostgreSQL + Nginx + GitHub Actions. Test coverage ≥80% backend uchun. Loyiha tugaganda `docker-compose up`'dan keyin to'liq ishlaydigan tizim bo'lishi kerak."

---

## 10) FAYL QILIB SAQLASH UCHUN ESLATMA

Bu prompt'ni dasturchiga yoki AI'ga berish uchun:
- Markdown formatida o'qilishi mumkin
- Har bir bosqichni alohida task sifatida olish mumkin (P0, P1, ...)
- README va spec hujjati sifatida loyiha repository'siga yotqizib qo'yish foydali

---

**Versiya:** 1.0
**Sana:** 2026-05-08
**Loyiha holati:** Stage 1 preview tugadi, production-ready uchun ~6-7 hafta ish qoldi.
