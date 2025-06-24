/**
 * Парсер Wildberries — качает товары JSON-API и сразу апсертит их в MongoDB.
 *
 * Запуск:
 *   node scripts/parseWildberries.mjs "кроссовки" 5   # 5 страниц × 100 = 500 товаров
 */

import mongoose from 'mongoose';
import got from 'got';
import UserAgent from 'user-agents';
import { z } from 'zod';

import { connectDB } from '../server/db.js'; 
import Product from '../server/models/Product.js';

const PER_PAGE = 100;                        // макс. лимит WB

async function fetchProducts(query, pages = 3) {
  const ua = new UserAgent().toString();
  const all = [];

  for (let page = 1; page <= pages; page++) {
    const url =
      'https://search.wb.ru/exactmatch/ru/common/v4/search' +
      `?query=${encodeURIComponent(query)}` +
      `&page=${page}` +
      `&limit=${PER_PAGE}` +
      '&resultset=catalog' +                  // обязателен, иначе пусто
      '&appType=1&curr=rub&dest=-1257786';

    const body = await got(url, {
      headers: { 'user-agent': ua },
      timeout: { request: 15_000 },
    }).json();

    const products = body?.data?.products ?? [];
    if (!products.length) break;  
    const makeImgUrl = (id) =>
      `https://basket-0${id % 10}.wb.ru/vol${String(id).slice(0, -3)}/part${String(id).slice(0, -3)}/${id}/images/c516x688/1.jpg`;

    // страниц больше нет
    all.push(...products);
  }

  return all.map((p) => ({
    _id: p.id,                               // станет PK в Mongo
    name: p.name,
    price: p.priceU / 100,
    sale_price: p.salePriceU ? p.salePriceU / 100 : undefined,
    rating: +(p.reviewRating ?? 0).toFixed(1),
    reviews_count: p.feedbacks ?? 0,
    image_url: makeImgUrl(p.id),   
    brand: p.brand,
    category: p.subject,
  }));
}

async function main() {
    /** validate CLI args */
  const Args = z.tuple([
    z.string().min(2).max(80).default('кроссовки'),
    z
      .string()
      .regex(/^\d+$/)
      .transform((s) => parseInt(s, 10))
      .refine((n) => n > 0 && n <= 10, { message: 'pages must be 1-10' })
      .default('5'),
  ]);

  const parse = Args.safeParse(process.argv.slice(2));
  if (!parse.success) {
    console.error('Args error:', parse.error.issues.map((i) => i.message).join(', '));
    process.exit(1);
  }
  const [query, pages] = parse.data;  

  console.time('parse');
  const products = await fetchProducts(query, pages);
  console.timeEnd('parse');

  if (!products.length) {
    console.log('Nothing to upsert — WB вернул 0 товаров');
    return;
  }

  await connectDB();

  await Product.bulkWrite(
    products.map((p) => ({
      updateOne: {
        filter: { _id: p._id },
        update: p,
        upsert: true,
      },
    }))
  );

  console.log(`Upserted ${products.length} products for "${query}"`);
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error('parser failed:', err);
  process.exit(1);
});
