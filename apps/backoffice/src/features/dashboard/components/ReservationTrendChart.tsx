import { Paper, Typography } from '@mui/material';
import type { EChartsOption } from 'echarts';
import { EChart } from '../../../shared/charts/EChart';
import type { ReservationTrendPoint } from '../types';

type Props = {
  data: ReservationTrendPoint[];
};

export function ReservationTrendChart({ data }: Props) {
  const option: EChartsOption = {
    tooltip: { trigger: 'axis' },
    legend: {
      top: 0,
      data: ['Received', 'Confirmed', 'Failed'],
    },
    grid: {
      left: 32,
      right: 16,
      top: 48,
      bottom: 24,
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      data: data.map((item) => item.day),
    },
    yAxis: {
      type: 'value',
    },
    series: [
      {
        name: 'Received',
        type: 'line',
        smooth: true,
        data: data.map((item) => item.received),
      },
      {
        name: 'Confirmed',
        type: 'line',
        smooth: true,
        data: data.map((item) => item.confirmed),
      },
      {
        name: 'Failed',
        type: 'line',
        smooth: true,
        data: data.map((item) => item.failed),
      },
    ],
  };

  return (
    <Paper variant="outlined" sx={{ p: 2, borderRadius: 3 }}>
      <Typography variant="h6" sx={{ fontWeight: 800, mb: 2 }}>
        Reservation flow trend
      </Typography>

      <EChart option={option} height={320} />
    </Paper>
  );
}