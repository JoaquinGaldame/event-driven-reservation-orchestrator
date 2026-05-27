import { Box, Paper, Typography } from '@mui/material';
import type { ReactNode } from 'react';

type MetricCardProps = {
  title: string;
  value: string | number | ReactNode;
  subtitle?: string;
  icon?: ReactNode;
  trend?: {
    label: string;
    tone: 'positive' | 'negative' | 'neutral';
  };
};

const trendColor = {
  positive: 'success.main',
  negative: 'error.main',
  neutral: 'text.secondary',
} as const;

export function MetricCard({ title, value, subtitle, icon, trend }: MetricCardProps) {
  return (
    <Paper
      variant="outlined"
      sx={{
        p: 2,
        borderRadius: 2,
        minHeight: 118,
        bgcolor: 'background.paper',
        borderColor: 'divider',
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2 }}>
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ fontWeight: 800, textTransform: 'uppercase' }}
        >
          {title}
        </Typography>

        {icon && <Box sx={{ color: 'text.secondary' }}>{icon}</Box>}
      </Box>

      <Typography
        sx={{
          mt: 1,
          fontFamily: 'JetBrains Mono, ui-monospace, monospace',
          fontSize: 28,
          fontWeight: 800,
          lineHeight: 1,
          color: 'text.primary',
        }}
      >
        {value}
      </Typography>

      {subtitle && (
        <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
          {subtitle}
        </Typography>
      )}

      {trend && (
        <Typography
          variant="caption"
          sx={{
            mt: 0.75,
            display: 'block',
            fontWeight: 800,
            color: trendColor[trend.tone],
          }}
        >
          {trend.label}
        </Typography>
      )}
    </Paper>
  );
}