// utils/getImageUrl.ts
import type { Product } from '../types/product';

// принимаем любой объект, где есть _id или id или image_url
export const getImageUrl = (
  p: Partial<Product> & { _id?: number | string }
): string | undefined => {
  if (p.image_url) return p.image_url;        // уже готовый url
  const numId = typeof p.id === 'number' ? p.id
             : typeof p._id === 'number' ? p._id
             : Number(p._id);                 // строковый ObjectId → NaN
  return Number.isFinite(numId)
    ? `http://localhost:3001/images/${numId}`
    : undefined;
};