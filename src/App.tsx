import React, { useState, useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter as Router, useSearchParams } from 'react-router-dom';
import { Container, Box, Stack } from '@mui/material';
import { ThemeContextProvider } from './context/ThemeContext';
import { Header } from './components/Header';
import { FilterPanel } from './components/FilterPanel';
import { ProductTable } from './components/ProductTable';
import { Charts } from './components/Charts';
import { useProducts } from './hooks/useProducts';
import { ProductFilters } from './types/product';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000,
    },
  },
});

const Dashboard: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [page, setPage] = useState(1);
  const pageSize = 20;

  // Initialize filters from URL
  const [filters, setFilters] = useState<ProductFilters>(() => ({
    min_price: searchParams.get('min_price') ? Number(searchParams.get('min_price')) : undefined,
    max_price: searchParams.get('max_price') ? Number(searchParams.get('max_price')) : undefined,
    min_rating: searchParams.get('min_rating') ? Number(searchParams.get('min_rating')) : undefined,
    min_reviews: searchParams.get('min_reviews') ? Number(searchParams.get('min_reviews')) : undefined,
    ordering: searchParams.get('ordering') || undefined,
    search: searchParams.get('search') || undefined,
  }));

  // Sync filters with URL
  useEffect(() => {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        params.set(key, value.toString());
      }
    });
    
    if (page > 1) {
      params.set('page', page.toString());
    }

    setSearchParams(params, { replace: true });
  }, [filters, page, setSearchParams]);

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [filters]);

  const { data, isLoading, error } = useProducts(filters, page, pageSize);

  const handleFiltersChange = (newFilters: ProductFilters) => {
    setFilters(newFilters);
  };

  const handleReset = () => {
    setFilters({});
    setPage(1);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: 'background.default' }}>
      <Header />
      
      <Container maxWidth="xl" sx={{ py: 3 }}>
        <Stack spacing={3}>
          <FilterPanel
            filters={filters}
            onFiltersChange={handleFiltersChange}
            onReset={handleReset}
          />
          
          <Charts 
            products={data?.results || []} 
            loading={isLoading}
          />
          
          <ProductTable
            products={data?.results || []}
            total={data?.count || 0}
            loading={isLoading}
            error={error}
            filters={filters}
            onFiltersChange={handleFiltersChange}
            page={page}
            onPageChange={handlePageChange}
            pageSize={pageSize}
          />
        </Stack>
      </Container>
    </Box>
  );
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeContextProvider>
        <Router>
          <Dashboard />
        </Router>
      </ThemeContextProvider>
    </QueryClientProvider>
  );
}

export default App;