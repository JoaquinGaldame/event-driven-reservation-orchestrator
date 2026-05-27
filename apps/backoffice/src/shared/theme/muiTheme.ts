import { createTheme } from '@mui/material/styles';
import { colors } from './tokens.js';

export function createAppTheme(mode: 'light' | 'dark') {
  const palette = colors[mode];

  return createTheme({
    palette: {
      mode,
      background: {
        default: palette.background,
        paper: palette.paper,
      },
      text: {
        primary: palette.textPrimary,
        secondary: palette.textSecondary,
      },
      divider: palette.border,
    },
    shape: {
      borderRadius: 12,
    },
  });
}