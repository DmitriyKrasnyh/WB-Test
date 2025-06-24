// backend/server/imagesRouter.mjs
import { Router } from 'express';
import got from 'got';
import { LRUCache } from 'lru-cache';

const router = Router();

const cache = new LRUCache({
      maxSize: 80 * 1024 * 1024,      // байты, новый ключ
      ttl: 1000 * 60 * 60,            // время в мс
      sizeCalculation: (buf) => buf.length,
    });
    

router.get('/images/:id', async (req, res) => {
  const { id } = req.params;

  // проверяем кэш
  const cached = cache.get(id);
  if (cached) {
    res.set('Content-Type', 'image/jpeg');
    return res.send(cached);
  }

  // генерим url WB (формула как в парсере)
  const wbUrl = `https://basket-0${id % 10}.wb.ru/vol${String(id).slice(0, -3)}/part${String(id).slice(0, -3)}/${id}/images/c516x688/1.jpg`;

  try {
    const imgBuffer = await got(wbUrl, { timeout: { request: 10_000 } }).buffer();

    // кладём в кэш
    cache.set(id, imgBuffer);

    res.set({
      'Content-Type': 'image/jpeg',
      // браузеры могут держать локально 30 мин
      'Cache-Control': 'public, max-age=1800',
    });
    res.send(imgBuffer);
  } catch (err) {
    console.error('img proxy error', err.message);
    res.sendStatus(502);
  }
});

export default router;
