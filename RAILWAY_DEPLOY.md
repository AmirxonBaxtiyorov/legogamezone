# 🚂 Railway Deploy — to'liq qo'llanma (yangilangan)

> **Muhim:** Railway endi **Railpack** builder ishlatadi (Nixpacks o'rniga). Loyihaning `package.json` script'lari Railpack bilan ham, Dockerfile bilan ham mos.

---

## ⚡ Tezkor xulosa

| Element | Qiymat |
|---|---|
| Backend builder | Railpack (avtomatik) yoki Dockerfile |
| Frontend builder | Dockerfile (nginx static) |
| Database | Railway Postgres plugin |
| Frontend domen | `legogamezone.uz` |
| Backend domen | `api.legogamezone.uz` |

---

## 1️⃣ GitHub'ga code push (lokal'da bir marta)

```powershell
cd c:\lego_game_zone_qarz
git add -A
git commit -m "Production: PostgreSQL schema, Railpack-compatible build"
git push origin main
```

> Agar GitHub repo mavjud bo'lmasa: GitHub'da yangi repo yarating va `git remote add origin ...` qo'shing.

---

## 2️⃣ Railway loyiha yaratish

1. https://railway.com → **Login with GitHub**
2. **New Project** → **Deploy from GitHub repo** → loyihangizni tanlang
3. Railway avtomatik bitta service yaratadi (`backend` deb nomlang)

---

## 3️⃣ PostgreSQL plugin qo'shish

1. Loyiha ichida **+ New** → **Database** → **Add PostgreSQL**
2. Postgres service yaratiladi, avtomatik sozlanadi
3. Boshqa hech narsa qilmang

---

## 4️⃣ Backend service sozlash

### Settings → Build:
- **Builder**: `Railpack` (default — qoldirib qo'ying) yoki `Dockerfile`
- Agar Dockerfile tanlasangiz: **Dockerfile Path**: `backend/Dockerfile`
- **Root Directory**: `/` (bo'sh qoldiring)

### Settings → Deploy:
- **Start Command** (ixtiyoriy, agar Railpack avtomatik aniqlamasa):
  ```
  npm run start --workspace=backend
  ```

### Settings → Networking:
- **Generate Domain** bosing
- **Custom Domain** qo'shish: `api.legogamezone.uz`

### Variables → quyidagilarni 1-1 ga nusxa oling:

```env
NODE_ENV=production
TZ=Asia/Tashkent
LOG_LEVEL=info

DATABASE_URL=${{Postgres.DATABASE_URL}}

JWT_SECRET=zhtP81t5AhnO5Mu3F7aX1Re0vZU9duOmtfwjYwrgkUCYxbuMBe/CoWCS0vbeK2Hn
JWT_EXPIRES_IN=1d
JWT_EXPIRES_IN_REMEMBER=30d

BCRYPT_SALT_ROUNDS=12

CORS_ORIGIN=https://legogamezone.uz,https://www.legogamezone.uz

TELEGRAM_BOT_TOKEN=8574320819:AAFqDjgtZiLIrD40pKaa-TZ6UbGquVcOHL8
TELEGRAM_OWNER_ID=6295164527

RATE_LIMIT_LOGIN_PER_MINUTE=5
RATE_LIMIT_API_PER_MINUTE=120

BACKUP_DIR=/tmp/backups
BACKUP_RETENTION_DAYS=7

SEED_OWNER_USERNAME=owner
SEED_OWNER_PASSWORD=Amirxon2026!
SEED_OWNER_FULLNAME=Amirxon
SEED_BRANCH_NAME=Asosiy filial
```

> ⚠️ **PORT'ni QO'L BILAN BERMANG** — Railway o'zi avtomatik beradi.
> ⚠️ JWT_SECRET yuqorida sizga maxsus yaratilgan — uni boshqa hech kim bilmasin.
> ⚠️ SEED_OWNER_PASSWORD ni birinchi loginda darhol o'zgartiring.

---

## 5️⃣ Frontend service yaratish

1. Backend service ishga tushgandan keyin: loyiha sahifasida **+ Create** → **GitHub Repo** → **bir xil repo'ni qayta tanlang**
2. Yangi service nomini `frontend` qilib qo'ying

### Settings → Build:
- **Builder**: `Dockerfile`
- **Dockerfile Path**: `frontend/Dockerfile`
- **Root Directory**: `/` (bo'sh)

### Settings → Networking:
- **Generate Domain** bosing
- **Custom Domain** qo'shish: `legogamezone.uz` va alohida `www.legogamezone.uz`

### Variables → 1 ta o'zgaruvchi:

```env
VITE_API_URL=https://api.legogamezone.uz
```

> Build vaqtida o'qiladi — har o'zgartirishdan keyin **Redeploy** kerak.

---

## 6️⃣ DNS yozuvlar (`legogamezone.uz` panelida)

Custom Domain qo'shilganda Railway sizga aniq target hostnameni beradi (`xxxx.up.railway.app` yoki `proxy.rlwy.net`). Shuni nusxa olib DNS panelingizga qo'ying:

| Type | Name | Value | TTL |
|---|---|---|---|
| CNAME | `@` (apex) | `<frontend>.up.railway.app` | 600 |
| CNAME | `www` | `<frontend>.up.railway.app` | 600 |
| CNAME | `api` | `<backend>.up.railway.app` | 600 |

> Apex domain (`@`) ba'zi DNS provayderlar `CNAME` ni qabul qilmaydi. U holda `A`/`AAAA` IP yozuvi (Railway target IP) yoki `ALIAS`/`CNAME flattening` ishlating.
>
> SSL avtomatik yaratiladi (Let's Encrypt, Railway tomonidan). 5-10 daqiqa kuting.

---

## 7️⃣ Birinchi seed (owner foydalanuvchini yaratish)

Backend service ishga tushgandan keyin (`/api/health` 200 qaytaradi), Railway dashboard'da:

**Backend service → ⋮ (uch nuqta) → Run Command:**

```bash
npx tsx prisma/seed-production.ts
```

Bu **faqat** owner foydalanuvchi va asosiy filialni yaratadi (test ma'lumotsiz). `SEED_OWNER_*` env'lardan foydalanadi.

Logda ko'rasiz:
```
✅ Owner yaratildi: owner / Amirxon2026!
✅ Filial yaratildi: Asosiy filial
✅ Default sozlamalar joylashtirildi
```

---

## 8️⃣ Tekshirish

1. **Health**: https://api.legogamezone.uz/api/health → `{"ok":true,...}`
2. **Login**: https://legogamezone.uz → `owner / Amirxon2026!` bilan kiring
3. **Sozlamalar** → tizim nomi, logo, rang, 2FA → saqlash
4. **Adminlar** → o'zingiz uchun parolni o'zgartiring (yoki yangi admin yarating)
5. **Telegram bot** → `@legogamezonebot` ga `/start` yuboring (owner sifatida tanilasiz)
6. **2FA yoqing** (Sozlamalar → Xavfsizlik → 2FA owner) — keyingi loginda Telegramga kod keladi

---

## 🔄 Yangilash

Code o'zgarsa:
```powershell
git add -A
git commit -m "..."
git push
```

Railway avtomatik **rebuild + redeploy** qiladi. Schema o'zgartirsangiz, Backend `start` script avtomatik `prisma db push` qiladi (yangi maydonlar/jadvallar qo'shiladi).

---

## 🔐 Xavfsizlik checklist

- [x] `JWT_SECRET` ≥ 64 belgili tasodifiy
- [ ] `SEED_OWNER_PASSWORD` deploy keyin Sozlamalar/Adminlar'dan o'zgartirilgan
- [x] `CORS_ORIGIN` faqat sizning frontend domenlari
- [x] `NODE_ENV=production` (zaif default'lar tekshiriladi)
- [x] Telegram 2FA yoqilishi mumkin (Sozlamalar)
- [x] PostgreSQL Railway tarmog'idan ulanadi (xavfsiz)
- [x] HTTPS faol (Railway Let's Encrypt avtomatik)

---

## 🆘 Muammolarni hal etish

### Build xatosi: `Namespace 'Prisma' has no exported member 'Decimal'`
✅ **Hal qilindi** — `package.json` build script'ida `prisma generate && tsc` chaqiriladi.

### Build xatosi: `Cannot find module 'prisma'`
✅ **Hal qilindi** — `prisma`, `tsx`, `typescript` endi `dependencies`'da (devDependencies emas), shuning uchun `npm ci --omit=dev` ham ularni o'rnatadi.

### Backend ishga tushmaydi: "Konfiguratsiya xatosi: JWT_SECRET..."
- `JWT_SECRET` < 64 belgi yoki `change-me/dev-only` so'zlari
- Yangi yarating: `node -e "console.log(require('crypto').randomBytes(48).toString('base64'))"`

### Frontend "Network Error"
- `VITE_API_URL=https://api.legogamezone.uz` o'rnatilganmi
- Frontend service **Redeploy** qilinganmi (env build vaqtida o'qiladi)
- Backend `CORS_ORIGIN`da frontend domeni borligi

### Database connection error
- `DATABASE_URL=${{Postgres.DATABASE_URL}}` aynan shu yozilganmi (curly braces ikki marta)
- Postgres plugin bir loyihada ekanmi
- Postgres plugin ishlamayotgan bo'lsa: Postgres service → Settings → Restart

### Telegram bot ishlamaydi
- `TELEGRAM_BOT_TOKEN` to'g'ri (BotFather'dan)
- `TELEGRAM_OWNER_ID` numeric (masalan `6295164527`, `@username` emas)
- Bot yoqilgan: BotFather → `/mybots` → token'ni qayta tekshiring

---

## 📋 Lokal dev (PostgreSQL bilan)

Loyiha endi PostgreSQL bilan ishlaydi (SQLite emas). Lokal dev uchun:

### Variant A: Docker compose (eng oson)
```powershell
cd c:\lego_game_zone_qarz
docker compose up -d postgres
```

### Variant B: Lokal PostgreSQL o'rnatish
PostgreSQL 16 ni https://www.postgresql.org dan yuklab oling, `gamezone` deb nomlangan DB yarating.

### Lokal `backend/.env` yangilash:

```env
DATABASE_URL="postgresql://gamezone:changeme@localhost:5432/gamezone?schema=public"
NODE_ENV=development
PORT=4000
TZ=Asia/Tashkent
JWT_SECRET=dev-only-secret-at-least-64-chars-long-aaaa-bbbb-cccc-dddd-eeee-ffff-gggg
JWT_EXPIRES_IN=1d
JWT_EXPIRES_IN_REMEMBER=30d
BCRYPT_SALT_ROUNDS=10
CORS_ORIGIN=http://localhost:5173,http://localhost:4000
TELEGRAM_BOT_TOKEN=8574320819:AAFqDjgtZiLIrD40pKaa-TZ6UbGquVcOHL8
TELEGRAM_OWNER_ID=6295164527
```

### Birinchi marta:
```powershell
cd c:\lego_game_zone_qarz
npm install
npm run db:push --workspace=backend         # schemani DB ga uradi
npm run db:seed:prod --workspace=backend    # 1 owner + 1 filial (production seed)
npm run dev:backend                          # boshqa terminalda
npm run dev:frontend                         # boshqa terminalda
```

> Test ma'lumotlar bilan seed: `npm run db:seed --workspace=backend` (3 admin, 9 qarz, mijozlar)

---

## 📞 Qo'shimcha yordam

- Railway loglar: dashboard → service → **Deployments** → so'nggi → **View Logs**
- Backend healthcheck: `curl https://api.legogamezone.uz/api/health`
- Frontend status: brauzer F12 → Console → xato xabarlari
