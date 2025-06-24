// src/components/ProductDialog.tsx
import React from 'react';
import {
  Dialog, DialogTitle, DialogContent,
  Typography, Box, Rating, Chip
} from '@mui/material';
import { Product } from '../types/product';
import { formatPrice, formatNumber } from '../utils/dataProcessing';

interface Props {
  open: boolean;
  onClose: () => void;
  product: Product | null;
}

export const ProductDialog: React.FC<Props> = ({ open, onClose, product }) => {
  if (!product) return null;

  const discount =
    product.sale_price
      ? Math.round(((product.price - product.sale_price) / product.price) * 100)
      : 0;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{product.name}</DialogTitle>
      <DialogContent dividers>
        <Box display="flex" gap={3} flexDirection={{ xs: 'column', sm: 'row' }}>
          {/* Изображение */}
          {product.image_url && (
            <Box
              component="img"
              src={product.image_url}
              alt={product.name}
              sx={{
                width: { xs: '100%', sm: 200 },
                borderRadius: 2,
                objectFit: 'cover',
              }}
            />
          )}

          {/* Данные */}
          <Box flex={1}>
            <Typography variant="subtitle2" color="text.secondary">
              Бренд: {product.brand || '—'}
            </Typography>
            <Box mt={1} display="flex" alignItems="center" gap={1}>
              <Rating value={product.rating} precision={0.1} readOnly />
              <Typography variant="body2">{product.rating}</Typography>
            </Box>

            <Box mt={2}>
              {product.sale_price ? (
                <>
                  <Typography variant="h6" component="span" fontWeight={600}>
                    {formatPrice(product.sale_price)}
                  </Typography>
                  <Chip
                    label={`-${discount}%`}
                    color="error"
                    size="small"
                    sx={{ ml: 1 }}
                  />
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ textDecoration: 'line-through' }}
                  >
                    {formatPrice(product.price)}
                  </Typography>
                </>
              ) : (
                <Typography variant="h6" fontWeight={600}>
                  {formatPrice(product.price)}
                </Typography>
              )}
            </Box>

            <Typography variant="body2" mt={2}>
              Отзывов: {formatNumber(product.reviews_count)}
            </Typography>
            {product.category && (
              <Typography variant="body2">
                Категория: {product.category}
              </Typography>
            )}
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  );
};
