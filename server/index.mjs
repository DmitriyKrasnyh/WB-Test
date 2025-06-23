import express from 'express';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());

const generateMockProducts = () => {
  return Array.from({ length: 100 }, (_, i) => {
    const price = Math.floor(Math.random() * 10000) + 500;
    const salePrice = Math.random() > 0.5 ? Math.floor(Math.random() * 8000) + 300 : null;
    return {
      id: i + 1,
      name: `Товар ${i + 1} - Качественный продукт для повседневного использования`,
      price,
      sale_price: salePrice || undefined,
      rating: Number((Math.random() * 2 + 3).toFixed(1)),
      reviews_count: Math.floor(Math.random() * 1000) + 10,
      image_url: `https://picsum.photos/300/300?random=${i}`,
      brand: `Бренд ${Math.floor(Math.random() * 20) + 1}`,
      category: ['Одежда', 'Обувь', 'Аксессуары', 'Электроника'][Math.floor(Math.random() * 4)]
    };
  });
};

let products = generateMockProducts();

app.get('/api/refresh', (_req, res) => {
  products = generateMockProducts();
  res.json({ message: 'Data refreshed', count: products.length });
});

app.get('/api/products', (req, res) => {
  const {
    min_price,
    max_price,
    min_rating,
    min_reviews,
    ordering,
    search,
    page = 1,
    page_size = 20,
  } = req.query;

  let filtered = products.slice();

  if (min_price) filtered = filtered.filter(p => p.price >= Number(min_price));
  if (max_price) filtered = filtered.filter(p => p.price <= Number(max_price));
  if (min_rating) filtered = filtered.filter(p => p.rating >= Number(min_rating));
  if (min_reviews) filtered = filtered.filter(p => p.reviews_count >= Number(min_reviews));
  if (search) filtered = filtered.filter(p => p.name.toLowerCase().includes(String(search).toLowerCase()));

  if (ordering) {
    const desc = String(ordering).startsWith('-');
    const field = desc ? String(ordering).slice(1) : String(ordering);
    filtered.sort((a, b) => {
      let aVal = a[field];
      let bVal = b[field];
      if (typeof aVal === 'string') aVal = aVal.toLowerCase();
      if (typeof bVal === 'string') bVal = bVal.toLowerCase();
      if (desc) [aVal, bVal] = [bVal, aVal];
      return aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
    });
  }

  const pageNum = Number(page) || 1;
  const sizeNum = Number(page_size) || 20;
  const start = (pageNum - 1) * sizeNum;
  const end = start + sizeNum;

  const result = filtered.slice(start, end);
  res.json({
    results: result,
    count: filtered.length,
    next: end < filtered.length ? `page=${pageNum + 1}` : null,
    previous: pageNum > 1 ? `page=${pageNum - 1}` : null
  });
});

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
