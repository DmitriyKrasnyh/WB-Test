import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Grid,
  useTheme,
  alpha,
} from '@mui/material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  ReferenceLine,
} from 'recharts';
import { TrendingUp, BarChart3 } from 'lucide-react';
import { Product } from '../types/product';
import { createPriceBins, calculateDiscount, formatPrice } from '../utils/dataProcessing';

interface ChartsProps {
  products: Product[];
  loading: boolean;
}

export const Charts: React.FC<ChartsProps> = ({ products, loading }) => {
  const theme = useTheme();

  const priceBins = createPriceBins(products, 10);
  
  const scatterData = products.map(product => ({
    x: product.rating,
    y: calculateDiscount(product),
    name: product.name,
    price: product.price,
    sale_price: product.sale_price,
  })).filter(item => item.y > 0);

  interface BarTooltipProps {
    active?: boolean;
    payload?: { value: number }[];
    label?: string;
  }

  const CustomTooltip = ({ active, payload, label }: BarTooltipProps) => {
    if (active && payload && payload.length) {
      return (
        <Box
          sx={{
            backgroundColor: theme.palette.background.paper,
            border: `1px solid ${theme.palette.divider}`,
            borderRadius: 1,
            p: 1.5,
            boxShadow: theme.shadows[4],
          }}
        >
          <Typography variant="body2" fontWeight={600}>
            {label}
          </Typography>
          <Typography variant="body2" color="primary">
            Товаров: {payload[0].value}
          </Typography>
        </Box>
      );
    }
    return null;
  };

  interface ScatterTooltipProps {
    active?: boolean;
    payload?: { payload: { name: string; x: number; y: number; price: number; sale_price?: number } }[];
  }

  const ScatterTooltip = ({ active, payload }: ScatterTooltipProps) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <Box
          sx={{
            backgroundColor: theme.palette.background.paper,
            border: `1px solid ${theme.palette.divider}`,
            borderRadius: 1,
            p: 1.5,
            boxShadow: theme.shadows[4],
            maxWidth: 250,
          }}
        >
          <Typography variant="body2" fontWeight={600} noWrap>
            {data.name}
          </Typography>
          <Typography variant="body2">
            Рейтинг: {data.x}
          </Typography>
          <Typography variant="body2">
            Скидка: {formatPrice(data.y)}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {formatPrice(data.price)} → {formatPrice(data.sale_price)}
          </Typography>
        </Box>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <Grid container spacing={3}>
        <Grid item xs={12} lg={6}>
          <Card>
            <CardContent>
              <Box height={300} display="flex" alignItems="center" justifyContent="center">
                <Typography color="text.secondary">Загрузка графика...</Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} lg={6}>
          <Card>
            <CardContent>
              <Box height={300} display="flex" alignItems="center" justifyContent="center">
                <Typography color="text.secondary">Загрузка графика...</Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    );
  }

  return (
    <Grid container spacing={3}>
      <Grid item xs={12} lg={6}>
        <Card elevation={3}>
          <CardContent>
            <Box display="flex" alignItems="center" gap={1} mb={3}>
              <BarChart3 size={20} />
              <Typography variant="h6" fontWeight={600}>
                Распределение по ценам
              </Typography>
            </Box>
            <Box height={300}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={priceBins} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={alpha(theme.palette.text.secondary, 0.2)} />
                  <XAxis 
                    dataKey="range" 
                    tick={{ fontSize: 12 }}
                    angle={-45}
                    textAnchor="end"
                    height={80}
                    stroke={theme.palette.text.secondary}
                  />
                  <YAxis 
                    tick={{ fontSize: 12 }}
                    stroke={theme.palette.text.secondary}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar 
                    dataKey="count" 
                    fill={theme.palette.primary.main}
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} lg={6}>
        <Card elevation={3}>
          <CardContent>
            <Box display="flex" alignItems="center" gap={1} mb={3}>
              <TrendingUp size={20} />
              <Typography variant="h6" fontWeight={600}>
                Скидка vs Рейтинг
              </Typography>
            </Box>
            <Box height={300}>
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={alpha(theme.palette.text.secondary, 0.2)} />
                  <XAxis 
                    type="number" 
                    dataKey="x" 
                    domain={[0, 5]}
                    tick={{ fontSize: 12 }}
                    stroke={theme.palette.text.secondary}
                    name="Рейтинг"
                  />
                  <YAxis 
                    type="number" 
                    dataKey="y"
                    tick={{ fontSize: 12 }}
                    stroke={theme.palette.text.secondary}
                    name="Скидка"
                  />
                  <Tooltip content={<ScatterTooltip />} />
                  <ReferenceLine x={4} stroke={theme.palette.warning.main} strokeDasharray="2 2" />
                  <Scatter 
                    name="Товары" 
                    data={scatterData} 
                    fill={theme.palette.secondary.main}
                    fillOpacity={0.7}
                  />
                </ScatterChart>
              </ResponsiveContainer>
            </Box>
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
              Пунктирная линия показывает рейтинг 4.0
            </Typography>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};