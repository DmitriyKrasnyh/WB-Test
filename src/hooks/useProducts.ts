import { useQuery } from '@tanstack/react-query';
import { ProductFilters, ProductsResponse } from '../types/product';

// Base URL for API requests. By default uses local test server
const API_BASE_URL = 'http://localhost:3001';

export const useProducts = (filters: ProductFilters, page: number = 1, pageSize: number = 20) => {
  const queryParams = new URLSearchParams();
  
  if (filters.min_price) queryParams.set('min_price', filters.min_price.toString());
  if (filters.max_price) queryParams.set('max_price', filters.max_price.toString());
  if (filters.min_rating) queryParams.set('min_rating', filters.min_rating.toString());
  if (filters.min_reviews) queryParams.set('min_reviews', filters.min_reviews.toString());
  if (filters.ordering) queryParams.set('ordering', filters.ordering);
  if (filters.search) queryParams.set('search', filters.search);
  
  queryParams.set('page', page.toString());
  queryParams.set('page_size', pageSize.toString());

  return useQuery({
    queryKey: ['products', filters, page, pageSize],
    queryFn: async (): Promise<ProductsResponse> => {
      const response = await fetch(`${API_BASE_URL}/api/products?${queryParams.toString()}`);
      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }
      return response.json() as Promise<ProductsResponse>;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });
};