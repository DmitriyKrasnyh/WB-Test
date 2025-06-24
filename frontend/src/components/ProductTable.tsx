import React, { useState } from 'react';
import {
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  Pagination,
  Typography,
  Box,
  Rating,
  Chip,
  Avatar,
  Tooltip,
  Skeleton,
  Alert,
} from '@mui/material';
import { Package, TrendingDown } from 'lucide-react';
import { Product, ProductFilters } from '../types/product';
import { formatPrice, formatNumber } from '../utils/dataProcessing';
import { ProductDialog } from './ProductDialog';
import { getImageUrl } from '../utils/getImageUrl';

/* ---------- локальный тип, принимающий и id, и _id ---------- */
type ProductRow = Product & { _id?: number | string };

interface Props {
  products: ProductRow[];
  total: number;
  loading: boolean;
  error: Error | null;
  filters: ProductFilters;
  onFiltersChange: (f: ProductFilters) => void;
  page: number;
  onPageChange: (n: number) => void;
  pageSize: number;
}

interface Column {
  id: keyof Product;
  label: string;
  sortable: boolean;
  width?: string;
  align?: 'left' | 'right' | 'center';
}

const columns: Column[] = [
  { id: 'name', label: 'Товар', sortable: true },
  { id: 'price', label: 'Цена', sortable: true, width: '120px', align: 'right' },
  { id: 'sale_price', label: 'Цена со скидкой', sortable: false, width: '140px', align: 'right' },
  { id: 'rating', label: 'Рейтинг', sortable: true, width: '120px', align: 'center' },
  { id: 'reviews_count', label: 'Отзывов', sortable: true, width: '100px', align: 'right' },
];

export const ProductTable: React.FC<Props> = ({
  products,
  total,
  loading,
  error,
  filters,
  onFiltersChange,
  page,
  onPageChange,
  pageSize,
}) => {
  /* ---------- сортировка ---------- */
  const handleSort = (id: keyof Product) => {
    const asc = filters.ordering === id;
    onFiltersChange({ ...filters, ordering: asc ? `-${id}` : id });
  };
  const sortDir = (id: keyof Product) =>
    filters.ordering === id ? 'asc' : filters.ordering === `-${id}` ? 'desc' : false;

  /* ---------- модалка ---------- */
  const [selected, setSelected] = useState<ProductRow | null>(null);

  const totalPages = Math.ceil(total / pageSize);

  /* ---------- заглушки ---------- */
  const LoadingRows = () =>
    Array.from({ length: 5 }).map((_, i) => (
      <TableRow key={i}>
        {columns.map((c) => (
          <TableCell key={c.id}>
            <Skeleton variant="text" width="80%" />
          </TableCell>
        ))}
      </TableRow>
    ));

  /* ---------- рендер ---------- */
  if (error) {
    return (
      <Card>
        <CardContent>
          <Alert severity="error">Ошибка: {error.message}</Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card elevation={3}>
      <CardContent>
        {/* верхняя полоска */}
        <Box display="flex" justifyContent="space-between" mb={3}>
          <Typography variant="h6" fontWeight={600}>
            Товары ({formatNumber(total)})
          </Typography>
          {!loading && products.length > 0 && (
            <Typography variant="body2" color="text.secondary">
              Страница {page} из {totalPages}
            </Typography>
          )}
        </Box>

        {/* таблица */}
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                {columns.map((c) => (
                  <TableCell
                    key={c.id}
                    align={c.align}
                    style={{ width: c.width }}
                    sx={{ fontWeight: 600 }}
                  >
                    {c.sortable ? (
                      <TableSortLabel
                        active={!!sortDir(c.id)}
                        direction={sortDir(c.id) || 'asc'}
                        onClick={() => handleSort(c.id)}
                      >
                        {c.label}
                      </TableSortLabel>
                    ) : (
                      c.label
                    )}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <LoadingRows />
              ) : products.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={columns.length} align="center" sx={{ py: 8 }}>
                    <Typography color="text.secondary">Ничего не найдено</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                products.map((p) => {
                  const discount = p.sale_price
                    ? Math.round(((p.price - p.sale_price) / p.price) * 100)
                    : 0;

                  const key = (p as any)._id ?? p.id; // основной ключ

                  return (
                    <TableRow
                      key={key}
                      hover
                      onClick={() => setSelected(p)}
                      sx={{
                        cursor: 'pointer',
                        '&:hover': {
                          backgroundColor: 'action.hover',
                          transform: 'translateY(-1px)',
                          transition: 'all .2s',
                        },
                      }}
                    >
                      {/* ------- колонки ------- */}
                      <TableCell>
                      <Box display="flex" alignItems="center" gap={2}>
                        <Avatar
                          src={getImageUrl(p)}           // передаём весь объект
                          alt={p.name}
                          sx={{ width: 48, height: 48 }}
                        >
                          {!getImageUrl(p) && <Package size={24} />}
                        </Avatar>

                          <Box>
                            <Tooltip title={p.name} arrow>
                              <Typography
                                variant="body2"
                                fontWeight={500}
                                sx={{
                                  maxWidth: 260,
                                  whiteSpace: 'nowrap',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                }}
                              >
                                {p.name}
                              </Typography>
                            </Tooltip>
                            <Typography variant="caption" color="text.secondary">
                              {p.brand || '—'}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>

                      <TableCell align="right">
                        <Typography
                          variant="body2"
                          fontWeight={600}
                          sx={{
                            textDecoration: p.sale_price ? 'line-through' : 'none',
                            color: p.sale_price ? 'text.secondary' : 'text.primary',
                          }}
                        >
                          {formatPrice(p.price)}
                        </Typography>
                      </TableCell>

                      <TableCell align="right">
                        {p.sale_price ? (
                          <Box display="flex" alignItems="center" justifyContent="flex-end" gap={1}>
                            <Typography variant="body2" fontWeight={600} color="error.main">
                              {formatPrice(p.sale_price)}
                            </Typography>
                            <Chip
                              label={`-${discount}%`}
                              size="small"
                              color="error"
                              icon={<TrendingDown size={14} />}
                            />
                          </Box>
                        ) : (
                          <Typography variant="body2" color="text.secondary">
                            —
                          </Typography>
                        )}
                      </TableCell>

                      <TableCell align="center">
                        <Box display="flex" alignItems="center" justifyContent="center" gap={1}>
                          <Rating value={p.rating} precision={0.1} readOnly size="small" />
                          <Typography variant="caption" color="text.secondary">
                            {p.rating}
                          </Typography>
                        </Box>
                      </TableCell>

                      <TableCell align="right">
                        <Typography variant="body2">{formatNumber(p.reviews_count)}</Typography>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* пагинация */}
        {!loading && products.length > 0 && totalPages > 1 && (
          <Box display="flex" justifyContent="center" mt={3}>
            <Pagination
              count={totalPages}
              page={page}
              onChange={(_, n) => onPageChange(n)}
              color="primary"
              showFirstButton
              showLastButton
            />
          </Box>
        )}
      </CardContent>

      {/* диалог карточки */}
      <ProductDialog
        open={!!selected}
        product={selected as Product}
        onClose={() => setSelected(null)}
      />
    </Card>
  );
};
