# Game Zone Qarz — boshqaruv tizimi

Game zone tarmog'i uchun mijozlar qarzini boshqarish tizimi (multi-branch, RBAC).

## Texnologiyalar

- **Backend:** Node.js 20 + Express + Prisma + PostgreSQL + JWT + Zod + Helmet
- **Frontend:** React 18 + Vite + TypeScript + Tailwind + shadcn/ui + TanStack Query
- **Deploy:** Railway (Dockerfile asosida) — `legogamezone.uz`

## Loyiha tuzilishi

```
backend/      Express API + Prisma
frontend/     React SPA (Vite + Tailwind)
backend/Dockerfile     backend image
frontend/Dockerfile    frontend image (Nginx static)
docker-compose.yml     lokal Postgres + backend + frontend
railway.json           Railway DOCKERFILE builder konfiguratsiyasi
```

## Lokal ishga tushirish

### 1. Postgres
Docker bilan:
```bash
docker compose up -d db
```

### 2. Backend
```bash
cp backend/.env.example backend/.env
# DATABASE_URL ni Postgres ga to'g'rilang
npm install
npm run db:push --workspace=backend           # schema ni DB ga uradi
npm run db:seed:prod --workspace=backend      # owner + 1 filial yaratadi
npm run dev:backend
```
Backend: <http://localhost:4000>

### 3. Frontend
Yangi terminalda:
```bash
npm run dev:frontend
```
Frontend: <http://localhost:5173>

## Production deploy (Railway)

1. **GitHub'ga push qiling** (`git push origin main`)
2. **Railway'da 3 ta service yarating:**
   - **Postgres** (Database plugin)
   - **backend** (GitHub repo, Dockerfile=`backend/Dockerfile`)
   - **frontend** (GitHub repo, Dockerfile=`frontend/Dockerfile`)

3. **Backend Variables:**
   ```
   DATABASE_URL=${{Postgres.DATABASE_URL}}
   JWT_SECRET=<kamida 64 belgili tasodifiy string>
   CORS_ORIGIN=https://legogamezone.uz,https://www.legogamezone.uz
   NODE_ENV=production
   TZ=Asia/Tashkent
   ```

4. **Frontend Variables (build time):**
   ```
   VITE_API_URL=https://api.legogamezone.uz
   ```

5. **Custom domain:**
   - `frontend` service'ga `www.legogamezone.uz` qo'shing → Railway CNAME beradi
   - `backend` service'ga `api.legogamezone.uz` qo'shing → Railway CNAME beradi
   - A-host DNS-da ikki CNAME yozing va root `legogamezone.uz` ni `www`ga redirect qiling

6. **Birinchi deploy:**
   - Postgres bo'sh DB beradi
   - Backend `prisma db push` qilib jadvallarni yaratadi
   - Owner uchun: Railway shell'da `npx tsx prisma/seed-production.ts` ishga tushiring

## Asosiy xususiyatlar

- 🔐 **Login + JWT** (rate-limit, parol bcrypt)
- 👥 **RBAC** — owner / admin (filialga yopishgan)
- 🏢 **Multi-branch** — har bir filial alohida mijozlar/qarzlar
- 💰 **Qarz va to'lov** — active / partial / paid / overdue / cancelled
- 📊 **Dashboard** — statistika, grafiklar (recharts)
- 🔔 **Bildirishnomalar** — frontend'da kechikkan/bugun/ertaga muddatli qarzlar (har 60s yangilanadi)
- 📋 **Audit log** — har bir mutatsiya yoziladi
- 📁 **Eksport** — Excel va PDF (qarzdorlar / to'lovlar)
- 🎨 **Brending** — tizim nomi, logo, asosiy rang sozlanadi
- 🧹 **Soft delete** — qarzlar va mijozlar arxivlanadi

## Default kirish

Birinchi seed'dan keyin:
- Username: `owner`
- Parol: `owner123` *(birinchi loginda o'zgartiring!)*
