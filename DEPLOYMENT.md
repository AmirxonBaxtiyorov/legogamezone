# Deployment runbook — Game Zone Qarz

## 1. Talablar

- Linux server (Ubuntu 22.04+ tavsiya etiladi)
- Docker 24+ va Docker Compose v2
- Public domen (HTTPS uchun) — masalan `qarz.example.uz`
- (Ixtiyoriy) Telegram bot va owner Telegram ID

## 2. Tezkor deploy

```bash
# Loyihani klonlash
git clone <repo> /opt/gamezone-qarz
cd /opt/gamezone-qarz

# Production env tayyorlash (alohida fayl, sirli o'zgaruvchilar)
cat > .env <<'EOF'
JWT_SECRET=<openssl rand -base64 64 yordamida yarating>
DB_USER=gamezone
DB_PASSWORD=<kuchli parol>
DB_NAME=gamezone
TELEGRAM_BOT_TOKEN=<bot token>
TELEGRAM_OWNER_ID=<numeric tg id>
CORS_ORIGIN=https://qarz.example.uz
EOF
chmod 600 .env

# Build va ishga tushirish
docker compose --env-file .env up -d --build

# Birinchi marta — DB migratsiya
docker compose exec backend npx prisma migrate deploy
docker compose exec backend npm run db:seed   # Faqat birinchi marta!

# Status
docker compose ps
docker compose logs -f backend
```

## 3. SSL (Nginx + Let's Encrypt)

`docker-compose.yml` ichidagi `frontend` xizmati 80-portni listenladi.
HTTPS uchun reverse proxy — host nginx yoki Caddy:

```nginx
# /etc/nginx/sites-available/qarz.example.uz
server {
  listen 80;
  server_name qarz.example.uz;
  return 301 https://$host$request_uri;
}

server {
  listen 443 ssl http2;
  server_name qarz.example.uz;

  ssl_certificate /etc/letsencrypt/live/qarz.example.uz/fullchain.pem;
  ssl_certificate_key /etc/letsencrypt/live/qarz.example.uz/privkey.pem;

  location / {
    proxy_pass http://localhost:80;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
  }
}
```

```bash
sudo certbot --nginx -d qarz.example.uz
```

## 4. Backup / Restore

### Avtomatik PostgreSQL backup (cron)

```bash
# /etc/cron.d/gamezone-backup
0 3 * * * root docker compose -f /opt/gamezone-qarz/docker-compose.yml exec -T postgres \
  pg_dump -U gamezone gamezone | gzip > /var/backups/gamezone-$(date +\%Y\%m\%d).sql.gz
```

### Restore

```bash
gunzip -c /var/backups/gamezone-2026-05-08.sql.gz | \
  docker compose exec -T postgres psql -U gamezone gamezone
```

## 5. Yangilanish (rolling deploy)

```bash
cd /opt/gamezone-qarz
git pull
docker compose --env-file .env up -d --build
docker compose exec backend npx prisma migrate deploy
docker compose ps
```

## 6. Monitoring va kuzatuv

- Backend healthcheck: `GET /api/health` → `{ ok: true }`
- Logs (JSON, pino): `docker compose logs -f backend`
- DB statistika: `docker compose exec postgres psql -U gamezone -c "SELECT count(*) FROM \"User\";"`

## 7. Xavfsizlik checklist (production'ga chiqishdan oldin)

- [ ] `JWT_SECRET` ≥ 64 belgili tasodifiy string
- [ ] `DB_PASSWORD` kuchli, takrorlanmaydigan
- [ ] `CORS_ORIGIN` faqat production domenni o'z ichiga oladi
- [ ] `NODE_ENV=production`
- [ ] Server firewall: faqat 22/tcp, 80/tcp, 443/tcp ochiq
- [ ] PostgreSQL portini (5432) faqat localhost'ga cheklash (compose'da port bind olib tashlang yoki firewall)
- [ ] `.env` fayli `chmod 600`, git'ga kiritilmagan
- [ ] Default `owner123` / `admin123` parollarini birinchi loginda o'zgartirish
- [ ] Telegram bot 2FA owner uchun yoqilgan (`AppSetting twoFactorOwner=1`)
- [ ] Avtomatik backup ishlayotgani
- [ ] HTTPS ishlayapti (sertifikat yangilanyapti)

## 8. Muammolarni bartaraf etish

### Backend ishga tushmayapti

```bash
docker compose logs backend
# JWT_SECRET zaif bo'lsa: env xatosi chiqadi — kuchli secret bering
```

### "EPERM rename query_engine.dll" (Windows dev)

Dev server ishlab turganda Prisma generate ishlamaydi. Avval `tsx watch` jarayonini to'xtating, keyin `npx prisma generate`.

### Telegram bot ishlamayapti

`TELEGRAM_BOT_TOKEN` to'g'ri bo'lsin. Bot token'ni @BotFather orqali oling. `TELEGRAM_OWNER_ID` — owner Telegramning numeric ID'si (@userinfobot orqali).
