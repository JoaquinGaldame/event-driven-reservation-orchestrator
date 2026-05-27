import { createContext, useContext } from 'react';

export type ThemeMode = 'light' | 'dark';

export type ThemeContextType = {
  mode: ThemeMode;
  toggleTheme: () => void;
};

export const ThemeModeContext = createContext<ThemeContextType | null>(null);

export function useThemeMode() {
  const context = useContext(ThemeModeContext);

  if (!context) {
    throw new Error('useThemeMode must be used inside MuiThemeProvider');
  }

  return context;
}
