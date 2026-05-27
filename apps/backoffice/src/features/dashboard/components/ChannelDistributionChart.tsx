import { Box, Paper, Typography, useTheme } from '@mui/material';
import type { EChartsOption } from 'echarts';
import { EChart } from '../../../shared/charts';
import { getChartColors } from '../../../shared/charts/chartTheme';
import type { ChannelDistributionItem } from '../types';

type Props = {
  data: ChannelDistributionItem[];
};

export function ChannelDistributionChart({ data }: Props) {
  const theme = useTheme();
  const c = getChartColors(theme);

  const chartColors = [c.chart1, c.chart2, c.chart3, c.chart4, c.chart5];

  const option: EChartsOption = {
    color: chartColors,
    tooltip: {
      trigger: 'item',
      backgroundColor: c.tooltipBg,
      borderColor: c.grid,
      textStyle: { color: c.tooltipText, fontSize: 12 },
    },
    series: [
      {
        name: 'Reservations',
        type: 'pie',
        radius: ['48%', '72%'],
        center: ['50%', '45%'],
        avoidLabelOverlap: true,
        itemStyle: {
          borderRadius: 4,
          borderColor: theme.palette.background.paper,
          borderWidth: 2,
        },
        label: { show: false },
        data: data.map((item) => ({
          name: item.channel,
          value: item.value,
        })),
      },
    ],
  };

  return (
    <Paper variant="outlined" sx={{ p: 2, borderRadius: 3, minHeight: 360 }}>
      <Typography variant="h6" sx={{ fontSize: 15, fontWeight: 800, mb: 1 }}>
        Channel distribution
      </Typography>

      <EChart option={option} height={220} />

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75, mt: 1 }}>
        {data.map((item, index) => (
          <Box
            key={item.channel}
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: 12,
              color: 'text.secondary',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: 999,
                  bgcolor: chartColors[index],
                }}
              />
              <span>{item.channel}</span>
            </Box>

            <Box
              component="span"
              sx={{
                fontFamily: 'JetBrains Mono, ui-monospace, monospace',
                color: 'text.secondary',
              }}
            >
              {item.value}
            </Box>
          </Box>
        ))}
      </Box>
    </Paper>
  );
}