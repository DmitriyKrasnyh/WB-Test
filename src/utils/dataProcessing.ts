import { Product, PriceBin } from '../types/product';

export const createPriceBins = (products: Product[], binCount: number = 10): PriceBin[] => {
  if (products.length === 0) return [];

  const prices = products.map(p => p.price);
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  const binSize = (max - min) / binCount;

  const bins: PriceBin[] = [];
  
  for (let i = 0; i < binCount; i++) {
    const binMin = min + i * binSize;
    const binMax = i === binCount - 1 ? max : binMin + binSize;
    
    const count = products.filter(p => p.price >= binMin && p.price <= binMax).length;
    
    bins.push({
      range: `${Math.round(binMin)}₽-${Math.round(binMax)}₽`,
      count,
      min: binMin,
      max: binMax
    });
  }

  return bins;
};

export const calculateDiscount = (product: Product): number => {
  if (!product.sale_price) return 0;
  return product.price - product.sale_price;
};

export const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
};

export const formatNumber = (num: number): string => {
  return new Intl.NumberFormat('ru-RU').format(num);
};

export const debounce = <T extends (...args: any[]) => void>(
  func: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let timeoutId: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};