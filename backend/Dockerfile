# ============================================================
# Game Zone Qarz — backend (Railway / Docker uchun, multi-stage)
# ============================================================
# Build:  docker build -f backend/Dockerfile -t gamezone-backend .
# Run:    docker run -p 4000:4000 --env-file backend/.env gamezone-backend
# ============================================================

# ---- Build stage ----
FROM node:20-alpine AS build
WORKDIR /app
RUN apk add --no-cache openssl python3 make g++

# Workspace fayllari (build cache uchun)
COPY package.json package-lock.json* ./
COPY backend/package.json ./backend/
COPY frontend/package.json ./frontend/

# Backend bog'liqliklari (devDeps + deps; build uchun barchasi kerak)
ENV NPM_CONFIG_PRODUCTION=false
RUN npm install --workspace=backend --include-workspace-root --no-audit --no-fund

# Manba va prisma schema
COPY backend ./backend

# Prisma client + TS build (build script o'zi prisma generate qiladi)
RUN cd backend && npx prisma generate
RUN cd backend && npm run build

# ---- Runtime stage ----
FROM node:20-alpine AS runtime
ENV NODE_ENV=production
ENV TZ=Asia/Tashkent
RUN apk add --no-cache tzdata openssl wget && rm -rf /var/cache/apk/*
WORKDIR /app

COPY package.json package-lock.json* ./
COPY backend/package.json ./backend/
COPY frontend/package.json ./frontend/

# Production install (devDependencies tushiriladi)
ENV NPM_CONFIG_PRODUCTION=true
RUN npm install --workspace=backend --omit=dev --include-workspace-root --no-audit --no-fund && \
    npm cache clean --force

# Build artifaktlari + prisma schema + public
COPY --from=build /app/backend/dist ./backend/dist
COPY --from=build /app/backend/prisma ./backend/prisma
COPY --from=build /app/backend/public ./backend/public
COPY --from=build /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=build /app/node_modules/.prisma ./node_modules/.prisma

# Non-root user
RUN addgroup -S app && adduser -S app -G app && chown -R app:app /app
USER app

EXPOSE 4000

HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:${PORT:-4000}/api/health || exit 1

# db push schemani DB ga uradi (migrationsiz). Birinchi deploy'da hammasini yaratadi.
# Keyingi deploylarda yangi maydonlar/jadvallar avtomatik qo'shiladi.
CMD ["npm", "run", "start", "--workspace=backend"]
