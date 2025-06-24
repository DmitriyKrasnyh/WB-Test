# Wildberries Analytics Dashboard

Полноценная **SPA-платформа** для быстрой аналитики товаров Wildberries: удобная таблица, продвинутая фильтрация, интерактивные графики и тёмная / светлая тема.  
Проект развёртывается одним `docker compose up –d` — поднимает MongoDB, API и frontend.

---

## ⚙️ Стек

| Слой           | Технологии | Ключевые фичи |
|----------------|------------|---------------|
| **Frontend**   | React 18 · Vite · MUI v6 · Tailwind 4 · React Query · Recharts | адаптивная таблица, URL-state, графики, тёмная тема |
| **Backend**    | Node 20 · Express 4 · Mongoose 8 · Zod · LRU-cache | парсер Wildberries, REST API, прокси / кеш картинок |
| **Data**       | MongoDB 6  | индексы под все фильтры |
| **DevOps**     | Docker · Docker-Compose | единая сборка, hot-reload в dev |

---

## 🚀 Возможности

* Интерактивная **таблица** с сортировкой, пагинацией и быстрым поиском  
* **Фильтры**: цена ↔ слайдер, рейтинг, отзывы, поиск, сброс одним кликом  
* **Графики**: гистограмма цен, scatter «скидка vs рейтинг» (реактивно обновляются)  
* **Тёмная/светлая тема**, запоминается в `localStorage`  
* **Кеш картинок** `/images/:id` — избавляет от CORS и ускоряет загрузку  
* Парсер WB (до 100 × N страниц) сохраняет данные в Mongo и доступен через `/api/refresh`  
* Полная **Docker-ориентированная** конфигурация: `frontend` + `api` + `mongo`

---

## 📦 Быстрый старт

```bash
# 1. клон + .env (необязательно, всё по умолчанию)
https://github.com/DmitriyKrasnyh/WB-Test.git
cd WB-Test

# 2. продакшен в 3 контейнера
docker compose up -d         # http://localhost:5173

# 3. парсим 5 страниц “кроссовки”
curl "http://localhost:3001/api/refresh?query=кроссовки&pages=5"
```

### Локальная разработка

```bash
# backend (hot-reload)
cd backend
pnpm i
MONGO_URI=mongodb://localhost:27017/wb pnpm dev   # localhost:3001

# frontend (HMR + Tailwind JIT)
cd ../frontend
pnpm i
pnpm dev                                # http://localhost:5173
```

---

## 🗄️ Структура репозитория

```
wildberries-dashboard
├─ backend
│  ├─ server/          # Express API
│  ├─ scripts/         # WB parser
│  └─ Dockerfile
├─ frontend
│  ├─ src/
│  ├─ tailwind.config.ts
│  └─ Dockerfile
├─ docker-compose.yml
└─ README.md
```

---

## 🔌 REST API

**`GET /api/products`**  
Параметры | Тип | Описание
-----------|-----|---------
`min_price, max_price` | number | диапазон цен
`min_rating` | number | ≥ 0 … 5 (step 0.1)
`min_reviews` | number | минимум отзывов
`ordering` | string | поле сортировки, `-` = DESC
`search` | string | подстрока в `name`
`page, page_size` | number | пагинация (default 1/20)

**`GET /api/refresh?query=часы&pages=3`** — парсит ⨉ pages * 100 и кладёт/апсёртит в Mongo.

**`GET /images/:id`** — прокси-кеш картинки WB (LRU ≈ 1000 шт, TTL 24 ч).

---

## 🛠 Разработческие команды

Frontend | Backend
---------|---------
`pnpm dev` &nbsp;– HMR + ESLint | `pnpm dev` – nodemon + tsx
`pnpm build` – vite build → `dist/` | `pnpm start` – prod-режим
`pnpm preview` – статика на 5173 | `pnpm parse "кроссовки" 5`
`pnpm test` – unit (Jest) | (тесты по желанию)

---

## 🌐 Деплой (пример CI)

```yaml
name: Deploy
on: push
jobs:
  docker:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: docker/setup-buildx-action@v3
      - uses: docker/build-push-action@v5
        with:
          push: true
          tags: ghcr.io/<you>/wb-frontend:latest, ghcr.io/<you>/wb-api:latest
```

---

## 📄 Лицензия

[MIT](LICENSE)

---

> _Помоги проекту! PR‑ы и issues приветствуются._ 🚀
