import type { Theme } from '@mui/material/styles';

export function getChartColors(theme: Theme) {
  return {
    text: theme.palette.text.secondary,
    grid: theme.palette.divider,
    tooltipBg: theme.palette.background.paper,
    tooltipText: theme.palette.text.primary,
    chart1: theme.palette.primary.main,
    chart2: theme.palette.success.main,
    chart3: theme.palette.warning.main,
    chart4: theme.palette.info.main,
    chart5: theme.palette.error.main,
  };
}