import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Box,
  Tooltip,
  useMediaQuery,
  useTheme as useMuiTheme,
} from '@mui/material';
import { Sun, Moon, BarChart3 } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export const Header: React.FC = () => {
  const { isDarkMode, toggleTheme } = useTheme();
  const muiTheme = useMuiTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down('sm'));

  return (
    <AppBar position="static" elevation={2}>
      <Toolbar>
        <Box display="flex" alignItems="center" gap={1}>
          <BarChart3 size={28} />
          <Typography variant="h6" component="div" fontWeight={700}>
            {isMobile ? 'WB Analytics' : 'Wildberries Analytics'}
          </Typography>
        </Box>
        
        <Box sx={{ flexGrow: 1 }} />
        
        <Tooltip title={isDarkMode ? 'Светлая тема' : 'Тёмная тема'}>
          <IconButton
            color="inherit"
            onClick={toggleTheme}
            sx={{
              transition: 'transform 0.2s ease-in-out',
              '&:hover': {
                transform: 'rotate(180deg)',
              },
            }}
          >
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
          </IconButton>
        </Tooltip>
      </Toolbar>
    </AppBar>
  );
};