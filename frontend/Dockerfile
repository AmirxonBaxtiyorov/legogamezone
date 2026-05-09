# ============================================================
# Game Zone Qarz — frontend (Vite static + nginx)
# ============================================================
FROM node:20-alpine AS build
WORKDIR /app

# Vite build vaqtida o'qiydi: VITE_API_URL=https://api.legogamezone.uz
# Railway: Variables → VITE_API_URL ni qo'shing.
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

COPY package.json package-lock.json* ./
COPY backend/package.json ./backend/
COPY frontend ./frontend
RUN npm install --workspace=frontend
RUN cd frontend && npm run build

# ---- Runtime ----
FROM nginx:alpine AS runtime
COPY --from=build /app/frontend/dist /usr/share/nginx/html
COPY frontend/nginx-railway.conf /etc/nginx/conf.d/default.conf
# Railway $PORT'ga listen qiladi (oldin 80 edi)
ENV PORT=8080
EXPOSE 8080
CMD ["sh", "-c", "envsubst '$PORT' < /etc/nginx/conf.d/default.conf > /tmp/default.conf && mv /tmp/default.conf /etc/nginx/conf.d/default.conf && nginx -g 'daemon off;'"]
