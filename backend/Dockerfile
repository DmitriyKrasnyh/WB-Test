# backend/Dockerfile
FROM node:20-alpine
WORKDIR /app

COPY package.json pnpm-lock.yaml ./

# устанавливаем prod-зависимости
RUN corepack enable && pnpm install --prod

COPY . .

EXPOSE 3001
CMD ["node", "server/index.mjs"]
