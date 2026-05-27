import { Paper, Typography } from '@mui/material';
import type { EChartsOption } from 'echarts';
import { EChart } from '../../../shared/charts/EChart';
import type { InventoryPressureItem } from '../types';

type Props = {
  data: InventoryPressureItem[];
};

export function InventoryPressureChart({ data }: Props) {
  const option: EChartsOption = {
    tooltip: { trigger: 'axis' },
    grid: {
      left: 120,
      right: 24,
      top: 16,
      bottom: 24,
    },
    xAxis: {
      type: 'value',
      max: 100,
    },
    yAxis: {
      type: 'category',
      data: data.map((item) => item.propertyName),
    },
    series: [
      {
        name: 'Occupancy %',
        type: 'bar',
        data: data.map((item) => item.occupancyPercent),
      },
    ],
  };

  return (
    <Paper variant="outlined" sx={{ p: 2, borderRadius: 3 }}>
      <Typography variant="h6" sx={{ fontWeight: 800, mb: 2 }}>
        Inventory pressure by property
      </Typography>

      <EChart option={option} height={320} />
    </Paper>
  );
}