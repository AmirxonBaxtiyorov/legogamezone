# Changelog

## [Unreleased] — 2026-05-08 — Hardening + Frontend bootstrap

### Backend xavfsizlik (P0)

- **Olib tashlandi:** `?asUser=N` query fallback — autentifikatsiyani aylanib o'tish ehtimoli yopildi (`getViewer` faqat JWT ishlatadi)
- **Qo'shildi:** `helmet()` security headers
- **Qo'shildi:** `cors()` allowlist (`CORS_ORIGIN`, vergul bilan ajratilgan ro'yxat)
- **Qo'shildi:** `express-rate-limit` — login 5/daqiqa, umumiy API 100/daqiqa (sozlanadigan)
- **Qo'shildi:** Markazlashgan env validatsiyasi (Zod). Production muhitida `JWT_SECRET ≥ 64 belgi` va default qiymatlar rad etiladi
- **Qo'shildi:** `OtpCode` jadvali. 2FA va Telegram link kodlari endi DB'da (bcrypt hash, 5 daqiqa TTL, `attempts` cheklov, har 30 daqiqada eski yozuvlar tozalanadi)
- **Qo'shildi:** Login va 2FA endpointlarida Zod validatsiya
- **Qo'shildi:** Login (lastLoginAt + audit) atomic `prisma.$transaction` orqali
- **Qo'shildi:** Global error handler (`errorHandler`), `HttpError`, Zod va Prisma xatolarini chiroyli JSON ga aylantiradi
- **Qo'shildi:** Pino structured logging (production: JSON; dev: pretty), parol/kod/Authorization redaction

### Backend modulli foundation (P1 boshlandi)

- `src/config/env.ts` — Zod orqali markazlashgan env validatsiyasi
- `src/config/prisma.ts` — singleton + graceful shutdown
- `src/lib/{jwt,bcrypt,decimal,logger,otp}.ts` — qayta foydalanadigan helperlar
- `src/middleware/{auth,rbac,branchScope,rateLimit,errorHandler,validate,audit}.ts`
- `src/schemas/{common,auth,client,debt,branch,admin,settings}.ts` — Zod schemalar
- `src/types/express.d.ts` — `req.viewer` typing
- preview-server.ts hozircha asosiy entry sifatida ishlaydi; routes/services'ga to'liq ko'chirish keyingi sessiya rejasida

### Schema

- **Yangi:** `OtpCode` model (id, userId?, purpose, codeHash, expiresAt, consumedAt, attempts) + migratsiya `add_otp_codes`

### Frontend (P2 — bootstrap)

- **Yangi:** Vite 6 + React 18 + TypeScript skeleton
- **Yangi:** TailwindCSS 3 + shadcn/ui asoslari (Button, Input, Label, Card)
- **Yangi:** React Router v6 (`/login`, `/dashboard`, `/clients`, `/debts`, `/payments`, `/reports`, `/audit`, `/settings`, `/branches`, `/admins`)
- **Yangi:** React Query (`@tanstack/react-query`), Zustand auth store, Axios + JWT interceptor + 401 logout
- **Yangi:** React Hook Form + Zod resolver (Login formasi)
- **Yangi:** ThemeProvider (light/dark/system, localStorage persist)
- **Yangi:** Sonner toast bildirishnomalar
- **Yangi:** lucide-react ikonlari, AppLayout (sidebar + mobile header)
- **Sahifalar:** LoginPage (2FA bilan), DashboardPage (stat kartalar, status taqsimoti), qolganlari placeholder

### DevOps (P4 boshlandi)

- **Yangi:** Backend multi-stage Dockerfile (deps → build → runtime, non-root user)
- **Yangi:** Frontend Dockerfile (Vite build → nginx alpine)
- **Yangi:** `frontend/nginx.conf` (SPA fallback, `/api` proxy → backend, statik kesh)
- **Yangi:** `docker-compose.yml` (postgres-16-alpine + backend + frontend, healthcheck'lar)
- **Yangi:** `.dockerignore`

### Hujjatlar

- README to'liq qayta yozildi
- DEPLOYMENT.md — production runbook (SSL, backup, monitoring, xavfsizlik checklist)
- CHANGELOG.md (bu fayl)

### Bog'liqliklar (qo'shilgan)

Backend:
- helmet ^8
- cors ^2.8 (+ @types/cors)
- express-rate-limit ^7
- pino ^9
- pino-http ^10
- pino-pretty (dev)

Frontend (yangi):
- react ^18.3, react-dom, react-router-dom ^6.28
- @tanstack/react-query ^5.62
- zustand ^5
- react-hook-form ^7.54, @hookform/resolvers ^3.9, zod ^3.24
- axios ^1.7
- lucide-react ^0.469
- sonner ^1.7
- tailwindcss ^3.4, autoprefixer, postcss
- @radix-ui/* (Dialog, Dropdown, Label, Popover, Select, Separator, Slot, Tabs, Toast)
- class-variance-authority, clsx, tailwind-merge, tailwindcss-animate
- recharts ^2.15, date-fns ^4

### Migratsiyalar

- `20260508110246_add_otp_codes` — OtpCode jadvali, indekslar (userId+purpose, expiresAt, consumedAt)

### Buzilgan / E'tibor talab qiladigan o'zgarishlar

- `?asUser=N` ishlatuvchi har qanday eski integratsiya endi 401 oladi. Yagona to'g'ri usul — `Authorization: Bearer <jwt>`
- `tokenStore.consume(code)` endi async (`Promise<number | null>`). Bot va boshqa har qanday foydalanuvchi uchun `await` kerak (bot tomoni allaqachon yangilangan)
- Production'da JWT_SECRET kamida 64 belgi bo'lishi va `change-me|dev-only|please-change|secret123|test|example` kabi naqshlardan bo'sh bo'lishi kerak — aks holda server ishga tushmaydi

### Hali ishlangan emas (keyingi sessiyalar uchun)

- P0-2 to'liq: qolgan endpointlar (qarz, to'lov, mijoz, filial, admin) uchun Zod validatsiya
- P0-9: barcha endpointlar bo'yicha soft-delete filtri auditi
- P0-10: Decimal → string response, BigInt yoki tiyin saqlash strategiyasi
- P1-11..14, 17, 18: preview-server.ts → routes/services to'liq modulli refactor
- P2-26 to'liq: 11 ta sahifa CRUD batafsil (hozir faqat Login va Dashboard funksional)
- P2-27, 29: Recharts integratsiya, mobile responsive polishing
- P3: Vitest, Playwright, ESLint+Prettier, Husky, Swagger/OpenAPI
- P4: PostgreSQL bilan integratsiya testi, GitHub Actions CI/CD, Nginx host proxy, PM2/systemd
- P5: PWA, mijoz fotosi, kreditlimit, drag-to-refresh, sozlanadigan widgetlar, xarita, soliq hisoboti, mijoz tarixi grafigi
