# ============================================================
# Game Zone Qarz — frontend (Vite static + nginx)
# Self-contained — works with rootDirectory=frontend on Railway
# ============================================================
FROM node:20-alpine AS build
WORKDIR /app

# Vite build vaqtida o'qiydi: VITE_API_URL=https://api.legogamezone.uz
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

COPY package.json package-lock.json* ./
RUN npm install --no-audit --no-fund

COPY . .
RUN npm run build

# ---- Runtime ----
FROM nginx:alpine AS runtime
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx-railway.conf /etc/nginx/conf.d/default.conf
ENV PORT=8080
EXPOSE 8080
CMD ["sh", "-c", "envsubst '$PORT' < /etc/nginx/conf.d/default.conf > /tmp/default.conf && mv /tmp/default.conf /etc/nginx/conf.d/default.conf && nginx -g 'daemon off;'"]
