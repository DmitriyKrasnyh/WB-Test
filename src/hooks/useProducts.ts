import { useQuery } from '@tanstack/react-query';
import { ProductFilters, ProductsResponse } from '../types/product';

const API_BASE_URL = 'https://api.wildberries.com'; // Replace with actual API URL

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
      // Mock data for development - replace with actual API call
      const mockProducts = Array.from({ length: 100 }, (_, i) => ({
        id: i + 1,
        name: `Товар ${i + 1} - Качественный продукт для повседневного использования`,
        price: Math.floor(Math.random() * 10000) + 500,
        sale_price: Math.random() > 0.5 ? Math.floor(Math.random() * 8000) + 300 : undefined,
        rating: Number((Math.random() * 2 + 3).toFixed(1)),
        reviews_count: Math.floor(Math.random() * 1000) + 10,
        image_url: `https://picsum.photos/300/300?random=${i}`,
        brand: `Бренд ${Math.floor(Math.random() * 20) + 1}`,
        category: ['Одежда', 'Обувь', 'Аксессуары', 'Электроника'][Math.floor(Math.random() * 4)]
      }));

      // Apply filters to mock data
      let filteredProducts = mockProducts.filter(product => {
        if (filters.min_price && product.price < filters.min_price) return false;
        if (filters.max_price && product.price > filters.max_price) return false;
        if (filters.min_rating && product.rating < filters.min_rating) return false;
        if (filters.min_reviews && product.reviews_count < filters.min_reviews) return false;
        if (filters.search && !product.name.toLowerCase().includes(filters.search.toLowerCase())) return false;
        return true;
      });

      // Apply sorting
      if (filters.ordering) {
        const [field, direction] = filters.ordering.startsWith('-') 
          ? [filters.ordering.slice(1), 'desc'] 
          : [filters.ordering, 'asc'];
        
        filteredProducts.sort((a, b) => {
          let aVal = a[field as keyof typeof a];
          let bVal = b[field as keyof typeof b];
          
          if (typeof aVal === 'string') aVal = aVal.toLowerCase();
          if (typeof bVal === 'string') bVal = bVal.toLowerCase();
          
          if (direction === 'desc') [aVal, bVal] = [bVal, aVal];
          
          return aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
        });
      }

      // Pagination
      const startIndex = (page - 1) * pageSize;
      const endIndex = startIndex + pageSize;
      const paginatedProducts = filteredProducts.slice(startIndex, endIndex);

      return {
        results: paginatedProducts,
        count: filteredProducts.length,
        next: endIndex < filteredProducts.length ? `page=${page + 1}` : undefined,
        previous: page > 1 ? `page=${page - 1}` : undefined
      };
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });
};