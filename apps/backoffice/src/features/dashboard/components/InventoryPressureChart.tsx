import { Paper, Typography, useTheme } from '@mui/material';
import type { EChartsOption } from 'echarts';
import { EChart } from '../../../shared/charts';
import { getChartColors } from '../../../shared/charts/chartTheme';
import type { InventoryPressureItem } from '../types';

type Props = {
  data: InventoryPressureItem[];
};

export function InventoryPressureChart({ data }: Props) {
  const theme = useTheme();
  const c = getChartColors(theme);

  const option: EChartsOption = {
    tooltip: {
      trigger: 'axis',
      backgroundColor: c.tooltipBg,
      borderColor: c.grid,
      textStyle: { color: c.tooltipText, fontSize: 12 },
      axisPointer: { type: 'shadow' },
    },
    grid: {
      left: 150,
      right: 16,
      top: 12,
      bottom: 8,
    },
    xAxis: {
      type: 'value',
      max: 100,
      splitLine: {
        lineStyle: {
          color: c.grid,
          type: 'dashed',
          opacity: 0.6,
        },
      },
      axisLabel: { color: c.text, fontSize: 11 },
    },
    yAxis: {
      type: 'category',
      data: data.map((item) => item.propertyName),
      axisTick: { show: false },
      axisLine: { show: false },
      axisLabel: {
        color: c.text,
        fontSize: 10,
        width: 140,
        overflow: 'truncate',
      },
    },
    series: [
      {
        name: 'Occupancy %',
        type: 'bar',
        barWidth: 16,
        data: data.map((item) => ({
          value: item.occupancyPercent,
          itemStyle: {
            color:
              item.occupancyPercent >= 85
                ? c.chart5
                : item.occupancyPercent >= 75
                  ? c.chart3
                  : item.occupancyPercent >= 65
                    ? c.chart1
                    : c.chart2,
            borderRadius: [0, 5, 5, 0],
          },
        })),
      },
    ],
  };

  return (
    <Paper variant="outlined" sx={{ p: 2, borderRadius: 3, minHeight: 340 }}>
      <Typography variant="h6" sx={{ fontSize: 15, fontWeight: 800, mb: 2 }}>
        Inventory pressure by property
      </Typography>

      <EChart option={option} height={270} />
    </Paper>
  );
}