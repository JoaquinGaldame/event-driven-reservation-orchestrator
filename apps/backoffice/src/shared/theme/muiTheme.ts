import { createTheme } from '@mui/material/styles';
import { appTokens } from './tokens';

export function createAppTheme(mode: 'light' | 'dark') {
  const t = appTokens[mode];

  return createTheme({
    palette: {
      mode,
      primary: { main: t.primary },
      success: { main: t.success },
      warning: { main: t.warning },
      error: { main: t.error },
      info: { main: t.info },
      background: {
        default: t.background,
        paper: t.paper,
      },
      text: {
        primary: t.textPrimary,
        secondary: t.textSecondary,
      },
      divider: t.border,
    },
    typography: {
      fontFamily: [
        'Inter',
        'ui-sans-serif',
        'system-ui',
        'Segoe UI',
        'Roboto',
        'Arial',
        'sans-serif',
      ].join(','),
      h4: {
        fontWeight: 800,
        letterSpacing: '-0.03em',
      },
      h6: {
        fontWeight: 800,
        letterSpacing: '-0.02em',
      },
      body2: {
        fontSize: '0.875rem',
      },
      caption: {
        fontSize: '0.72rem',
        letterSpacing: '0.06em',
      },
    },
    shape: {
      borderRadius: 8,
    },
    components: {
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
            borderColor: t.borderSoft,
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: 'none',
            fontWeight: 700,
            borderRadius: 10,
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            fontWeight: 700,
          },
        },
      },
    },
  });
}