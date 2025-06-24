// scripts/createIndexes.js
import { connectDB } from '../server/db.js';
import Product from '../server/models/Product.js';

await connectDB();
await Promise.all([
  Product.collection.createIndex({ price: 1 }),
  Product.collection.createIndex({ rating: -1 }),
  Product.collection.createIndex({ reviews_count: -1 }),
  Product.collection.createIndex({ name: 'text' }),
]);
console.log('Indexes created');
process.exit();
