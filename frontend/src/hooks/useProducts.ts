// src/hooks/useProducts.ts
import { useQuery } from '@tanstack/react-query';
import { ProductFilters, ProductsResponse } from '../types/product';

const API_BASE_URL = 'http://localhost:3001';

export const useProducts = (
  filters: ProductFilters,
  page = 1,
  pageSize = 20
) => {
  const queryParams = new URLSearchParams();
  /* … построение queryParams … */
  queryParams.set('page', page.toString());
  queryParams.set('page_size', pageSize.toString());

  return useQuery<ProductsResponse>({
    queryKey: ['products', { filters, page, pageSize }],
    queryFn: async () => {
      const res = await fetch(`${API_BASE_URL}/api/products?${queryParams}`);
      if (!res.ok) throw new Error('Failed to fetch products');
      return res.json();
    },
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    placeholderData: (prev) => prev,          // аналог keepPreviousData
  });
};
