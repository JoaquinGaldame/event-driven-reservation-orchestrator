import { ThemeProvider, CssBaseline } from '@mui/material';
import { ReactNode, useMemo, useState } from 'react';
import { createAppTheme } from '../../shared/theme/muiTheme.js';
import { ThemeModeContext, ThemeMode } from '../contexts/ThemeModeContext';

type Props = {
  children: ReactNode;
};

export function MuiThemeProvider({ children }: Props) {
  const [mode, setMode] = useState<ThemeMode>('dark');

  const toggleTheme = () => {
    setMode((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const theme = useMemo(() => createAppTheme(mode), [mode]);

  return (
    <ThemeModeContext.Provider value={{ mode, toggleTheme }}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ThemeModeContext.Provider>
  );
}
