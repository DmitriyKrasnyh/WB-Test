// src/context/ThemeContext.tsx
import React, { createContext, useContext, useMemo, useState } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';

type Mode = 'light' | 'dark';

interface Ctx {
  mode: Mode;
  toggleMode: () => void;
}

const ThemeModeContext = createContext<Ctx>({ mode: 'light', toggleMode: () => {} });
export const useThemeContext = () => useContext(ThemeModeContext);   // ★ новый экспорт

export const ThemeContextProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [mode, setMode] = useState<Mode>('light');
  const toggleMode = () => setMode((prev) => (prev === 'light' ? 'dark' : 'light'));

  const theme = useMemo(() => createTheme({ palette: { mode } }), [mode]);

  return (
    <ThemeModeContext.Provider value={{ mode, toggleMode }}>
      <ThemeProvider theme={theme}>{children}</ThemeProvider>
    </ThemeModeContext.Provider>
  );
};
