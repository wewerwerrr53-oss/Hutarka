# Этап 1: Сборка Vite-приложения
FROM node:18 AS builder

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

# Этап 2: Запуск Express-сервера
FROM node:18

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# Копируем сборку
COPY --from=builder /app/dist ./dist
COPY server.js ./

# Устанавливаем переменные окружения
ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

CMD ["node", "server.js"]