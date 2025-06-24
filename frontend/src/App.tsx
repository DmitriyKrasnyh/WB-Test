import React, { useState, useEffect, useCallback } from 'react';
import { BrowserRouter as Router, useSearchParams } from 'react-router-dom';
import { Container, Box, Stack, Snackbar, Alert } from '@mui/material';
import { QueryClient, QueryClientProvider, useQueryClient } from '@tanstack/react-query';

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
      // ⚠️ keepPreviousData убрали
    },
  },
});

/* ---------- Dashboard inner component ---------- */
const Dashboard: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [page, setPage] = useState(1);
  const pageSize = 20;
  const queryClientReact = useQueryClient();

  /* 1. Загружаем фильтры из URL либо из localStorage */
  const initialFilters: ProductFilters = (() => {
    // из URL
    const urlFilters: ProductFilters = {
      min_price: searchParams.get('min_price')
        ? Number(searchParams.get('min_price'))
        : undefined,
      max_price: searchParams.get('max_price')
        ? Number(searchParams.get('max_price'))
        : undefined,
      min_rating: searchParams.get('min_rating')
        ? Number(searchParams.get('min_rating'))
        : undefined,
      min_reviews: searchParams.get('min_reviews')
        ? Number(searchParams.get('min_reviews'))
        : undefined,
      ordering: searchParams.get('ordering') || undefined,
      search: searchParams.get('search') || undefined,
    };

    // если URL пустой, пробуем localStorage
    if (
      Object.values(urlFilters).every(
        (v) => v === undefined || v === '' || Number.isNaN(v)
      )
    ) {
      try {
        const stored = localStorage.getItem('wb-filters');
        if (stored) return JSON.parse(stored) as ProductFilters;
      } catch {
        /* ignore */
      }
    }
    return urlFilters;
  })();

  const [filters, setFilters] = useState<ProductFilters>(initialFilters);

  /* 2. Синхронизация фильтров с URL + localStorage */
  useEffect(() => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([k, v]) => {
      if (v !== undefined && v !== '') params.set(k, v.toString());
    });
    if (page > 1) params.set('page', page.toString());
    setSearchParams(params, { replace: true });

    // persist in localStorage
    localStorage.setItem('wb-filters', JSON.stringify(filters));
  }, [filters, page, setSearchParams]);

  /* reset page when filters change */
  useEffect(() => setPage(1), [filters]);

  const {
    data,
    isLoading,
    error,
  } = useProducts(filters, page, pageSize);

  /* авто-коррекция страницы, если после фильтрации мы оказались «за пределами» */
  useEffect(() => {
    if (!isLoading && data) {
      const totalPages = Math.max(1, Math.ceil(data.count / pageSize));
      if (page > totalPages) setPage(totalPages);
    }
  }, [data, page, pageSize, isLoading]);

  /* ----------- refresh handler ----------- */
  const [refreshing, setRefreshing] = useState(false);
  const [snackbar, setSnackbar] = useState<string | null>(null);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      const params = new URLSearchParams();
      if (filters.search) params.set('query', filters.search);
      params.set('pages', '5');

      const res = await fetch(
        `http://localhost:3001/api/refresh?${params.toString()}`
      );
      if (!res.ok) throw new Error('Server error');
      const json = await res.json();
      setSnackbar(`Обновлено! Всего товаров: ${json.count}`);
      // сбрасываем кэш products
      queryClientReact.invalidateQueries({ queryKey: ['products'] });
    } catch (err) {
      setSnackbar('Не удалось обновить данные');
      console.error(err);
    } finally {
      setRefreshing(false);
    }
  }, [filters.search, queryClientReact]);

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <Header onRefresh={handleRefresh} refreshing={refreshing} />

      <Container maxWidth="xl" sx={{ py: 3 }}>
        <Stack spacing={3}>
          <FilterPanel
            filters={filters}
            onFiltersChange={setFilters}
            onReset={() => setFilters({})}
          />

          <Charts products={data?.results || []} loading={isLoading} />

          <ProductTable
            products={data?.results || []}
            total={data?.count || 0}
            loading={isLoading}
            error={error}
            filters={filters}
            onFiltersChange={setFilters}
            page={page}
            onPageChange={setPage}
            pageSize={pageSize}
          />
        </Stack>
      </Container>

      {/* Snackbar уведомление */}
      <Snackbar
        open={!!snackbar}
        autoHideDuration={4000}
        onClose={() => setSnackbar(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbar(null)}
          severity="info"
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbar}
        </Alert>
      </Snackbar>
    </Box>
  );
};

/* ---------- Top-level App ---------- */
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
