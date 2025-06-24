import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Container, Box, Stack, Snackbar, Alert } from '@mui/material';
import { useQueryClient } from '@tanstack/react-query';

import { Header } from './components/Header';
import { FilterPanel } from './components/FilterPanel';
import { ProductTable } from './components/ProductTable';
import { Charts } from './components/Charts';
import { useProducts } from './hooks/useProducts';
import { useNProgress } from './hooks/useNProgress';
import { ProductFilters } from './types/product';

const pageSize = 20;

const Dashboard: React.FC = () => {
  useNProgress();                    /* ← progress-bar */

  const [searchParams, setSearchParams] = useSearchParams();
  const [page, setPage] = useState(1);
  const queryClient = useQueryClient();

  /* --- filters --- */
  const [filters, setFilters] = useState<ProductFilters>(() => ({
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
  }));

  /* sync url */
  useEffect(() => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([k, v]) => {
      if (v !== undefined && v !== '') params.set(k, v.toString());
    });
    if (page > 1) params.set('page', page.toString());
    setSearchParams(params, { replace: true });
  }, [filters, page, setSearchParams]);

  useEffect(() => setPage(1), [filters]);

  /* --- data --- */
  const { data, isLoading, error } = useProducts(filters, page, pageSize);

  useEffect(() => {
    if (data) {
      const totalPages = Math.max(1, Math.ceil(data.count / pageSize));
      if (page > totalPages) setPage(totalPages);
    }
  }, [data, page]);

  /* --- refresh --- */
  const [refreshing, setRefreshing] = useState(false);
  const [snack, setSnack] = useState<string | null>(null);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      const res = await fetch('http://localhost:3001/api/refresh');
      if (!res.ok) throw new Error();
      const json = await res.json();
      setSnack(`Обновлено! Всего: ${json.count}`);
      queryClient.invalidateQueries({ queryKey: ['products'] });
    } catch {
      setSnack('Не удалось обновить данные');
    } finally {
      setRefreshing(false);
    }
  }, [queryClient]);

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

          <Charts products={data?.results ?? []} loading={isLoading} />

          <ProductTable
            products={data?.results ?? []}
            total={data?.count ?? 0}
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

      {/* snackbar */}
      <Snackbar
        open={!!snack}
        autoHideDuration={4000}
        onClose={() => setSnack(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert variant="filled" severity="info" onClose={() => setSnack(null)}>
          {snack}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Dashboard;
