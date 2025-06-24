export interface Product {
  id: number;
  name: string;
  price: number;
  sale_price?: number;
  rating: number;
  reviews_count: number;
  image_url?: string;
  brand?: string;
  category?: string;
}

export interface ProductFilters {
  min_price?: number;
  max_price?: number;
  min_rating?: number;
  min_reviews?: number;
  ordering?: string;
  search?: string;
}

export interface ProductsResponse {
  results: Product[];
  count: number;
  next?: string;
  previous?: string;
}

export interface PriceBin {
  range: string;
  count: number;
  min: number;
  max: number;
}