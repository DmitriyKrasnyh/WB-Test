/* --------------------------------------------------------------------------
   Charts.tsx
   ───────────
   • Гистограмма распределения цен
   • Scatter-диаграмма «скидка vs рейтинг»
   • Скелетоны вместо текста во время загрузки
   -------------------------------------------------------------------------- */

   import React, { useMemo } from 'react';
   import {
     Card,
     CardContent,
     Typography,
     Box,
     Grid,
     Skeleton,
     alpha,
   } from '@mui/material';
   import {
     ResponsiveContainer,
     BarChart,
     Bar,
     XAxis,
     YAxis,
     CartesianGrid,
     Tooltip as ReTooltip,
     ScatterChart,
     Scatter,
     ReferenceLine,
   } from 'recharts';
   import { TrendingUp, BarChart3 } from 'lucide-react';
   import { useTheme } from '@mui/material/styles';
   
   import { Product } from '../types/product';
   import {
     createPriceBins,
     calculateDiscount,
     formatPrice,
   } from '../utils/dataProcessing';
   
   interface ChartsProps {
     products: Product[];
     loading: boolean;
   }
   
   /* ---------- кастомные тултипы ---------- */
   const BarTooltip: React.FC<any> = ({ active, payload, label }) => {
     const theme = useTheme();
     if (active && payload && payload.length) {
       return (
         <Box
           sx={{
             p: 1.5,
             backgroundColor: theme.palette.background.paper,
             border: `1px solid ${theme.palette.divider}`,
             borderRadius: 1,
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
   
   const ScatterTooltip: React.FC<any> = ({ active, payload }) => {
     const theme = useTheme();
     if (active && payload && payload.length) {
       const d = payload[0].payload;
       return (
         <Box
           sx={{
             p: 1.5,
             backgroundColor: theme.palette.background.paper,
             border: `1px solid ${theme.palette.divider}`,
             borderRadius: 1,
             boxShadow: theme.shadows[4],
             maxWidth: 260,
           }}
         >
           <Typography variant="body2" fontWeight={600} noWrap>
             {d.name}
           </Typography>
           <Typography variant="body2">Рейтинг: {d.x}</Typography>
           <Typography variant="body2">Скидка: {formatPrice(d.y)}</Typography>
           <Typography variant="body2" color="text.secondary">
             {formatPrice(d.price)} → {formatPrice(d.sale_price)}
           </Typography>
         </Box>
       );
     }
     return null;
   };
   
   /* ---------- основной компонент ---------- */
   export const Charts: React.FC<ChartsProps> = ({ products, loading }) => {
     const theme = useTheme();
   
     /* memo-вычисления, чтобы не гонять CPU на каждом рендере */
     const priceBins = useMemo(() => createPriceBins(products, 10), [products]);
   
     const scatterData = useMemo(
       () =>
         products
           .map((p) => ({
             x: p.rating,
             y: calculateDiscount(p),
             name: p.name,
             price: p.price,
             sale_price: p.sale_price,
           }))
           .filter((d) => d.y > 0),
       [products]
     );
   
     /* ---------- loading skeleton ---------- */
     if (loading) {
       return (
         <Grid container spacing={3}>
           {[0, 1].map((i) => (
             <Grid key={i} item xs={12} lg={6}>
               <Card elevation={3}>
                 <CardContent>
                   <Skeleton variant="rectangular" width="100%" height={300} />
                 </CardContent>
               </Card>
             </Grid>
           ))}
         </Grid>
       );
     }
   
     /* ---------- charts ---------- */
     return (
       <Grid container spacing={3}>
         {/* --- Гистограмма цен --- */}
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
                     <CartesianGrid
                       strokeDasharray="3 3"
                       stroke={alpha(theme.palette.text.secondary, 0.2)}
                     />
                     <XAxis
                       dataKey="range"
                       height={80}
                       angle={-45}
                       textAnchor="end"
                       tick={{ fontSize: 12 }}
                       stroke={theme.palette.text.secondary}
                     />
                     <YAxis
                       tick={{ fontSize: 12 }}
                       stroke={theme.palette.text.secondary}
                     />
                     <ReTooltip content={<BarTooltip />} />
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
   
         {/* --- Scatter: скидка vs рейтинг --- */}
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
                     <CartesianGrid
                       strokeDasharray="3 3"
                       stroke={alpha(theme.palette.text.secondary, 0.2)}
                     />
                     <XAxis
                       type="number"
                       dataKey="x"
                       domain={[0, 5]}
                       name="Рейтинг"
                       tick={{ fontSize: 12 }}
                       stroke={theme.palette.text.secondary}
                     />
                     <YAxis
                       type="number"
                       dataKey="y"
                       name="Скидка"
                       tick={{ fontSize: 12 }}
                       stroke={theme.palette.text.secondary}
                     />
                     <ReferenceLine
                       x={4}
                       stroke={theme.palette.warning.main}
                       strokeDasharray="2 2"
                     />
                     <ReTooltip content={<ScatterTooltip />} />
                     <Scatter
                       name="Товары"
                       data={scatterData}
                       fill={theme.palette.secondary.main}
                       fillOpacity={0.7}
                     />
                   </ScatterChart>
                 </ResponsiveContainer>
               </Box>
               <Typography
                 variant="caption"
                 color="text.secondary"
                 sx={{ mt: 1, display: 'block' }}
               >
                 Пунктирная линия — рейтинг 4.0
               </Typography>
             </CardContent>
           </Card>
         </Grid>
       </Grid>
     );
   };
   