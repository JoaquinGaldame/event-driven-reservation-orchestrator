import { Box } from '@mui/material';
import { MetricCard } from '../../../shared/components';
import type { DashboardKpi } from '../types';

type Props = {
  items: DashboardKpi[];
};

export function DashboardKpiGrid({ items }: Props) {
  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: {
          xs: '1fr',
          sm: 'repeat(2, minmax(0, 1fr))',
          lg: 'repeat(4, minmax(0, 1fr))',
        },
        gap: 2,
      }}
    >
      {items.map((item) => (
        <MetricCard
          key={item.id}
          title={item.title}
          value={item.value}
          subtitle={item.subtitle}
          trend={item.trend}
        />
      ))}
    </Box>
  );
}