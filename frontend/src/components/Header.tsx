// src/components/Header.tsx
import React from 'react';
import { AppBar, Toolbar, Typography, IconButton, Tooltip } from '@mui/material';
import { RefreshCcw, Sun, Moon } from 'lucide-react';
import { useThemeContext } from '../context/ThemeContext';

interface HeaderProps {
  onRefresh: () => void;
  refreshing: boolean;
}

export const Header: React.FC<HeaderProps> = ({ onRefresh, refreshing }) => {
  const { mode, toggleMode } = useThemeContext();

  return (
    <AppBar position="static" color="primary" elevation={2}>
      <Toolbar sx={{ gap: 2 }}>
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          Wildberries Dashboard
        </Typography>

        {/* переключатель темы */}
        <Tooltip title={mode === 'light' ? 'Тёмная тема' : 'Светлая тема'}>
          <IconButton color="inherit" onClick={toggleMode} size="large">
            {mode === 'light' ? <Moon size={20} /> : <Sun size={20} />}
          </IconButton>
        </Tooltip>

        {/* обновление данных */}
        <Tooltip title="Обновить данные">
          <span>
            <IconButton
              color="inherit"
              onClick={onRefresh}
              disabled={refreshing}
              size="large"
              sx={{
                svg: {
                  transition: 'transform .4s linear',
                  transform: refreshing ? 'rotate(-360deg)' : 'none',
                },
              }}
            >
              <RefreshCcw size={20} />
            </IconButton>
          </span>
        </Tooltip>
      </Toolbar>
    </AppBar>
  );
};
