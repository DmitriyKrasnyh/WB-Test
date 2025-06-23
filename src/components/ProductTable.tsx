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
  IconButton,
} from '@mui/material';
import { Package, TrendingUp, TrendingDown } from 'lucide-react';
import { Product, ProductFilters } from '../types/product';
import { formatPrice, formatNumber, calculateDiscount } from '../utils/dataProcessing';

interface ProductTableProps {
  products: Product[];
  total: number;
  loading: boolean;
  error: Error | null;
  filters: ProductFilters;
  onFiltersChange: (filters: ProductFilters) => void;
  page: number;
  onPageChange: (page: number) => void;
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

export const ProductTable: React.FC<ProductTableProps> = ({
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
  const handleSort = (columnId: keyof Product) => {
    const isAsc = filters.ordering === columnId;
    const newOrdering = isAsc ? `-${columnId}` : columnId;
    onFiltersChange({ ...filters, ordering: newOrdering });
  };

  const getSortDirection = (columnId: keyof Product): 'asc' | 'desc' | false => {
    if (filters.ordering === columnId) return 'asc';
    if (filters.ordering === `-${columnId}`) return 'desc';
    return false;
  };

  const LoadingSkeleton = () => (
    <>
      {Array.from({ length: 5 }).map((_, index) => (
        <TableRow key={index}>
          {columns.map((column) => (
            <TableCell key={column.id} align={column.align}>
              <Skeleton variant="text" width="80%" />
            </TableCell>
          ))}
        </TableRow>
      ))}
    </>
  );

  const EmptyState = () => (
    <TableRow>
      <TableCell colSpan={columns.length} align="center" sx={{ py: 8 }}>
        <Box display="flex" flexDirection="column" alignItems="center" gap={2}>
          <Package size={48} color="gray" />
          <Typography variant="h6" color="text.secondary">
            Товары не найдены
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Попробуйте изменить параметры фильтрации
          </Typography>
        </Box>
      </TableCell>
    </TableRow>
  );

  if (error) {
    return (
      <Card>
        <CardContent>
          <Alert severity="error">
            Ошибка загрузки данных: {error.message}
          </Alert>
        </CardContent>
      </Card>
    );
  }

  const totalPages = Math.ceil(total / pageSize);

  return (
    <Card elevation={3}>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h6" fontWeight={600}>
            Товары ({formatNumber(total)})
          </Typography>
          {!loading && products.length > 0 && (
            <Typography variant="body2" color="text.secondary">
              Страница {page} из {totalPages}
            </Typography>
          )}
        </Box>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                {columns.map((column) => (
                  <TableCell
                    key={column.id}
                    align={column.align}
                    style={{ width: column.width }}
                    sx={{ fontWeight: 600 }}
                  >
                    {column.sortable ? (
                      <TableSortLabel
                        active={!!getSortDirection(column.id)}
                        direction={getSortDirection(column.id) || 'asc'}
                        onClick={() => handleSort(column.id)}
                      >
                        {column.label}
                      </TableSortLabel>
                    ) : (
                      column.label
                    )}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <LoadingSkeleton />
              ) : products.length === 0 ? (
                <EmptyState />
              ) : (
                products.map((product) => {
                  const discount = calculateDiscount(product);
                  const discountPercent = product.sale_price 
                    ? Math.round(((product.price - product.sale_price) / product.price) * 100)
                    : 0;

                  return (
                    <TableRow 
                      key={product.id} 
                      hover
                      sx={{ 
                        '&:hover': { 
                          backgroundColor: 'action.hover',
                          transform: 'translateY(-1px)',
                          transition: 'all 0.2s ease-in-out'
                        }
                      }}
                    >
                      <TableCell>
                        <Box display="flex" alignItems="center" gap={2}>
                          <Avatar 
                            src={product.image_url} 
                            alt={product.name}
                            sx={{ width: 48, height: 48 }}
                          >
                            <Package size={24} />
                          </Avatar>
                          <Box>
                            <Tooltip title={product.name} arrow>
                              <Typography 
                                variant="body2" 
                                fontWeight={500}
                                sx={{
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  whiteSpace: 'nowrap',
                                  maxWidth: '300px'
                                }}
                              >
                                {product.name}
                              </Typography>
                            </Tooltip>
                            {product.brand && (
                              <Typography variant="caption" color="text.secondary">
                                {product.brand}
                              </Typography>
                            )}
                          </Box>
                        </Box>
                      </TableCell>
                      
                      <TableCell align="right">
                        <Typography 
                          variant="body2" 
                          fontWeight={600}
                          sx={{ 
                            textDecoration: product.sale_price ? 'line-through' : 'none',
                            color: product.sale_price ? 'text.secondary' : 'text.primary'
                          }}
                        >
                          {formatPrice(product.price)}
                        </Typography>
                      </TableCell>
                      
                      <TableCell align="right">
                        {product.sale_price ? (
                          <Box display="flex" alignItems="center" justifyContent="flex-end" gap={1}>
                            <Typography variant="body2" fontWeight={600} color="error.main">
                              {formatPrice(product.sale_price)}
                            </Typography>
                            <Chip 
                              label={`-${discountPercent}%`} 
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
                          <Rating 
                            value={product.rating} 
                            precision={0.1} 
                            readOnly 
                            size="small"
                          />
                          <Typography variant="caption" color="text.secondary">
                            {product.rating}
                          </Typography>
                        </Box>
                      </TableCell>
                      
                      <TableCell align="right">
                        <Typography variant="body2">
                          {formatNumber(product.reviews_count)}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {!loading && products.length > 0 && totalPages > 1 && (
          <Box display="flex" justifyContent="center" mt={3}>
            <Pagination
              count={totalPages}
              page={page}
              onChange={(_, newPage) => onPageChange(newPage)}
              color="primary"
              size="large"
              showFirstButton
              showLastButton
            />
          </Box>
        )}
      </CardContent>
    </Card>
  );
};