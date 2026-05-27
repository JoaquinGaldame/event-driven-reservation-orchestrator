import { Box, Paper, Typography } from '@mui/material';
import type { ReactNode } from 'react';

type MetricCardProps = {
  title: string;
  value: string | number;
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

export function MetricCard({
  title,
  value,
  subtitle,
  icon,
  trend,
}: MetricCardProps) {
  return (
    <Paper
      variant="outlined"
      sx={{
        p: 2.5,
        borderRadius: 3,
        height: '100%',
        bgcolor: 'background.paper',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          gap: 2,
          mb: 1.5,
        }}
      >
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{
            fontWeight: 800,
            textTransform: 'uppercase',
            letterSpacing: 0.8,
          }}
        >
          {title}
        </Typography>

        {icon && (
          <Box color="text.secondary">
            {icon}
          </Box>
        )}
      </Box>

      <Typography
        variant="h4"
        sx={{ fontWeight: 900, lineHeight: 1 }}
      >
        {value}
      </Typography>

      {subtitle && (
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ mt: 1 }}
        >
          {subtitle}
        </Typography>
      )}

      {trend && (
        <Typography
          variant="body2"
          sx={{
            mt: 1,
            fontWeight: 700,
            color: trendColor[trend.tone],
          }}
        >
          {trend.label}
        </Typography>
      )}
    </Paper>
  );
}