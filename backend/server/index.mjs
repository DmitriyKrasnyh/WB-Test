import express from 'express';
import cors from 'cors';
import { execFile } from 'child_process';
import { promisify } from 'util';

import { connectDB } from './db.js';
import Product from './models/Product.js';

import imagesRouter from './imagesRouter.mjs';

import { z } from 'zod';                         // ← NEW
const execFileAsync = promisify(execFile);
await connectDB();

const app  = express();
const PORT = process.env.PORT || 3001;

await Product.syncIndexes();

app.use(cors());
app.use(imagesRouter); 

/* ----------  /api/refresh  ---------- */
app.get('/api/refresh', async (req, res) => {
  /** 1️⃣  схему описываем один раз */
  const schema = z.object({
      query: z
        .string()
        .min(2, 'query must be at least 2 chars')
        .max(80, 'query too long')
        .default('кроссовки'),
      pages: z
        .string()
        .regex(/^\d+$/, 'pages must be positive integer')
        .transform((s) => parseInt(s, 10))
        .refine((n) => n > 0 && n <= 10, 'pages 1-10')
        .default('5'),
    });
  
    /** 2️⃣  валидируем входные qs-параметры */
    const parseResult = schema.safeParse(req.query);
    if (!parseResult.success) {
      const msg = parseResult.error.issues.map((i) => i.message).join(', ');
      return res.status(400).json({ message: `Invalid params: ${msg}` });
    }
  
    const { query, pages } = parseResult.data;
  try {
    await execFileAsync('node', ['scripts/parseWildberries.mjs', query, pages]);
    const count = await Product.countDocuments();
    res.json({ message: 'Data refreshed', count });
  } catch (err) {
    console.error('Refresh failed:', err);
    res.status(500).json({ message: 'Refresh failed', error: String(err) });
  }
});

/* ----------  /api/products  ---------- */
app.get('/api/products', async (req, res) => {
  const {
    min_price, max_price,
    min_rating, min_reviews,
    ordering, search,
    page = 1, page_size = 20,
  } = req.query;

  /* 1. фильтр */
  const filter = {};
  if (min_price)      filter.price         = { $gte: +min_price };
  if (max_price)      filter.price         = { ...(filter.price || {}), $lte: +max_price };
  if (min_rating)     filter.rating        = { $gte: +min_rating };
  if (min_reviews)    filter.reviews_count = { $gte: +min_reviews };
  if (search)         filter.name          = { $regex: search, $options: 'i' };

  /* 2. сортировка */
  const sort = ordering
    ? { [ordering.replace('-', '')]: ordering.startsWith('-') ? -1 : 1 }
    : {};

  /* 3. пагинация */
  const pageNum = +page;
  const sizeNum = +page_size;
  const skip    = (pageNum - 1) * sizeNum;

  const [results, count] = await Promise.all([
    Product.find(filter).sort(sort).skip(skip).limit(sizeNum).lean(),
    Product.countDocuments(filter),
  ]);

  res.json({
    results,
    count,
    next:      skip + sizeNum < count ? `page=${pageNum + 1}` : null,
    previous:  pageNum > 1            ? `page=${pageNum - 1}` : null,
  });
});

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
