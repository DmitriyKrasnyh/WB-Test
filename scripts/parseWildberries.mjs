import fs from 'fs/promises';
import { load } from 'cheerio';
import UserAgent from 'user-agents';

const url = 'https://www.wildberries.ru/';

async function fetchPage() {
  const ua = new UserAgent().toString();
  const response = await fetch(url, {
    headers: {
      'User-Agent': ua,
      'Accept-Language': 'ru-RU,ru;q=0.9,en-US;q=0.8,en;q=0.7'
    }
  });
  if (!response.ok) {
    throw new Error(`Failed to fetch page: ${response.status}`);
  }
  return await response.text();
}

async function parse(html) {
  const $ = load(html);
  const products = [];
  $('.product-card').each((_, el) => {
    const name = $(el).find('.product-card__name').text().trim();
    const priceText = $(el).find('.price__lower-price').text().trim();
    if (name) {
      products.push({ name, price: priceText });
    }
  });
  return products;
}

async function main() {
  try {
    const html = await fetchPage();
    const products = await parse(html);
    await fs.writeFile('wildberries_products.json', JSON.stringify(products, null, 2));
    console.log(`Parsed ${products.length} products`);
  } catch (err) {
    console.error(err);
  }
}

main();
