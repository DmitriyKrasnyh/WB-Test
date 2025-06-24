import React, { useState, useMemo } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Slider,
  TextField,
  Button,
  Box,
  InputAdornment,
  Chip,
  Grid,
} from '@mui/material';
import { Search, Filter, RotateCcw } from 'lucide-react';
import { ProductFilters } from '../types/product';
import { debounce } from '../utils/dataProcessing';

interface FilterPanelProps {
  filters: ProductFilters;
  onFiltersChange: (filters: ProductFilters) => void;
  onReset: () => void;
}

export const FilterPanel: React.FC<FilterPanelProps> = ({
  filters,
  onFiltersChange,
  onReset,
}) => {
  const [localPriceRange, setLocalPriceRange] = useState<number[]>([
    filters.min_price || 0,
    filters.max_price || 50000,
  ]);
  const [localMinReviews, setLocalMinReviews] = useState(filters.min_reviews?.toString() || '');

  const debouncedPriceChange = useMemo(
    () =>
      debounce((value: number[]) => {
        onFiltersChange({
          ...filters,
          min_price: value[0] || undefined,
          max_price: value[1] || undefined,
        });
      }, 300),
    [filters, onFiltersChange]
  );

  const handlePriceChange = (_: Event, newValue: number | number[]) => {
    const range = newValue as number[];
    setLocalPriceRange(range);
    debouncedPriceChange(range);
  };

  const handleRatingChange = (_: Event, newValue: number | number[]) => {
    onFiltersChange({
      ...filters,
      min_rating: newValue as number,
    });
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onFiltersChange({
      ...filters,
      search: event.target.value || undefined,
    });
  };

  const handleMinReviewsSubmit = () => {
    const value = parseInt(localMinReviews);
    onFiltersChange({
      ...filters,
      min_reviews: isNaN(value) ? undefined : value,
    });
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      handleMinReviewsSubmit();
    }
  };

  const activeFiltersCount = Object.values(filters).filter(v => v !== undefined && v !== '').length;

  return (
    <Card elevation={3}>
      <CardContent>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
          <Box display="flex" alignItems="center" gap={1}>
            <Filter size={20} />
            <Typography variant="h6" fontWeight={600}>
              Фильтры
            </Typography>
            {activeFiltersCount > 0 && (
              <Chip 
                label={activeFiltersCount} 
                size="small" 
                color="primary" 
                sx={{ ml: 1 }}
              />
            )}
          </Box>
          <Button
            variant="outlined"
            size="small"
            startIcon={<RotateCcw size={16} />}
            onClick={onReset}
            disabled={activeFiltersCount === 0}
          >
            Сбросить
          </Button>
        </Box>

        <Grid container spacing={3}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              placeholder="Поиск товаров..."
              value={filters.search || ''}
              onChange={handleSearchChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search size={20} />
                  </InputAdornment>
                ),
              }}
              sx={{ mb: 2 }}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" fontWeight={600} gutterBottom>
              Диапазон цен
            </Typography>
            <Box px={2}>
              <Slider
                value={localPriceRange}
                onChange={handlePriceChange}
                valueLabelDisplay="auto"
                min={0}
                max={50000}
                step={100}
                valueLabelFormat={(value) => `${value}₽`}
                sx={{ mb: 2 }}
              />
              <Box display="flex" justifyContent="space-between" color="text.secondary">
                <Typography variant="caption">{localPriceRange[0]}₽</Typography>
                <Typography variant="caption">{localPriceRange[1]}₽</Typography>
              </Box>
            </Box>
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" fontWeight={600} gutterBottom>
              Минимальный рейтинг: {filters.min_rating || 0}
            </Typography>
            <Box px={2}>
              <Slider
                value={filters.min_rating || 0}
                onChange={handleRatingChange}
                valueLabelDisplay="auto"
                min={0}
                max={5}
                step={0.1}
                marks={[
                  { value: 0, label: '0' },
                  { value: 2.5, label: '2.5' },
                  { value: 5, label: '5' },
                ]}
                sx={{ mb: 2 }}
              />
            </Box>
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" fontWeight={600} gutterBottom>
              Минимальное количество отзывов
            </Typography>
            <Box display="flex" gap={1}>
              <TextField
                type="number"
                value={localMinReviews}
                onChange={(e) => setLocalMinReviews(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Введите число"
                size="small"
                fullWidth
                inputProps={{ min: 0 }}
              />
              <Button
                variant="contained"
                onClick={handleMinReviewsSubmit}
                sx={{ minWidth: 'auto', px: 3 }}
              >
                ОК
              </Button>
            </Box>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};