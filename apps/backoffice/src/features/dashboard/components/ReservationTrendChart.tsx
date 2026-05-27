import { Paper, Typography, useTheme } from '@mui/material';
import type { EChartsOption } from 'echarts';
import { EChart } from '../../../shared/charts';
import { getChartColors } from '../../../shared/charts/chartTheme';
import type { ReservationTrendPoint } from '../types';

type Props = {
  data: ReservationTrendPoint[];
};

export function ReservationTrendChart({ data }: Props) {
  const theme = useTheme();
  const c = getChartColors(theme);

  const option: EChartsOption = {
    color: [c.chart1, c.chart2, c.chart5],
    tooltip: {
      trigger: 'axis',
      backgroundColor: c.tooltipBg,
      borderColor: c.grid,
      textStyle: { color: c.tooltipText, fontSize: 12 },
    },
    legend: {
      top: 0,
      right: 0,
      textStyle: { color: c.text, fontSize: 11 },
      data: ['Received', 'Confirmed', 'Failed'],
    },
    grid: {
      left: 8,
      right: 16,
      top: 42,
      bottom: 8,
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: data.map((item) => item.day),
      axisLine: { lineStyle: { color: c.grid } },
      axisTick: { show: false },
      axisLabel: { color: c.text, fontSize: 11 },
    },
    yAxis: {
      type: 'value',
      splitLine: {
        lineStyle: {
          color: c.grid,
          type: 'dashed',
          opacity: 0.6,
        },
      },
      axisLabel: { color: c.text, fontSize: 11 },
    },
    series: [
      {
        name: 'Received',
        type: 'line',
        smooth: true,
        symbol: 'circle',
        symbolSize: 5,
        lineStyle: { width: 2 },
        areaStyle: {
          opacity: 0.18,
          color: c.chart1,
        },
        data: data.map((item) => item.received),
      },
      {
        name: 'Confirmed',
        type: 'line',
        smooth: true,
        symbol: 'circle',
        symbolSize: 5,
        lineStyle: { width: 2 },
        areaStyle: {
          opacity: 0.14,
          color: c.chart2,
        },
        data: data.map((item) => item.confirmed),
      },
      {
        name: 'Failed',
        type: 'line',
        smooth: true,
        symbol: 'circle',
        symbolSize: 4,
        lineStyle: { width: 2 },
        data: data.map((item) => item.failed),
      },
    ],
  };

  return (
    <Paper variant="outlined" sx={{ p: 2, borderRadius: 3, minHeight: 360 }}>
      <Typography variant="h6" sx={{ fontSize: 15, fontWeight: 800, mb: 2 }}>
        Reservation flow — 7 days
      </Typography>

      <EChart option={option} height={300} />
    </Paper>
  );
}