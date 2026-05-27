import { Paper, Typography } from '@mui/material';
import type { EChartsOption } from 'echarts';
import { EChart } from '../../../shared/charts/EChart';
import type { ChannelDistributionItem } from '../types';

type Props = {
  data: ChannelDistributionItem[];
};

export function ChannelDistributionChart({ data }: Props) {
  const option: EChartsOption = {
    tooltip: {
      trigger: 'item',
    },
    legend: {
      bottom: 0,
      orient: 'horizontal',
    },
    series: [
      {
        name: 'Reservations',
        type: 'pie',
        radius: ['45%', '70%'],
        center: ['50%', '45%'],
        data: data.map((item) => ({
          name: item.channel,
          value: item.value,
        })),
      },
    ],
  };

  return (
    <Paper variant="outlined" sx={{ p: 2, borderRadius: 3 }}>
      <Typography variant="h6" sx={{ fontWeight: 800, mb: 2 }}>
        Channel distribution
      </Typography>

      <EChart option={option} height={320} />
    </Paper>
  );
}