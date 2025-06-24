FROM node:20-alpine AS build
WORKDIR /app

# ① копируем манифесты
COPY package.json pnpm-lock.yaml ./

# ② ставим ВСЕ зависимости, а не только prod
RUN corepack enable && \
    PNPM_ALLOW_SCRIPTS="esbuild" pnpm install --frozen-lockfile

# ③ копируем исходники и собираем
COPY . .
RUN pnpm run build          # vite build ⇒ dist/

# ——— runtime-слой ———
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
