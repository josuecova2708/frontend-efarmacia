FROM node:22-alpine AS builder

WORKDIR /app

RUN apk add --no-cache libc6-compat

COPY package*.json ./
RUN npm install

COPY . .

# BACKEND_URL se hornea en el bundle de Next.js durante el build
# El valor por defecto es la URL de producción del backend
ARG BACKEND_URL=https://efarmacia-back.duckdns.org
ENV BACKEND_URL=$BACKEND_URL

ARG NEXT_PUBLIC_API_URL=https://efarmacia-back.duckdns.org
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

RUN npm run build

# ============================================================
# Imagen de producción
# ============================================================
FROM node:22-alpine AS production

WORKDIR /app

RUN apk add --no-cache libc6-compat

ENV NODE_ENV=production

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
