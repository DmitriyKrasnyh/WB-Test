import fs from 'fs/promises';
import { load } from 'cheerio';

async function parseFile(filePath) {
  const html = await fs.readFile(filePath, 'utf8');
  const $ = load(html);
  const products = [];
  $('.product-card').each((_, el) => {
    let name = $(el).find('.product-card__name').text();
    name = name.replace(/^\s*\//, '').trim();
    const price = $(el).find('.price__lower-price').text().trim();
    if (name) {
      products.push({ name, price });
    }
  });
  return products;
}

async function main() {
  const filePath = process.argv[2] || 'scripts/sample.html';
  try {
    const products = await parseFile(filePath);
    await fs.writeFile('wildberries_products.json', JSON.stringify(products, null, 2));
    console.log(`Parsed ${products.length} products`);
  } catch (err) {
    console.error(err);
    process.exitCode = 1;
  }
}

main();
