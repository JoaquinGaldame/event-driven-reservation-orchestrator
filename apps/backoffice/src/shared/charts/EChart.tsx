import ReactECharts from 'echarts-for-react';
import type { EChartsOption } from 'echarts';

type EChartProps = {
  option: EChartsOption;
  height?: number | string;
};

export function EChart({ option, height = 320 }: EChartProps) {
  return (
    <ReactECharts
      option={option}
      style={{ height, width: '100%' }}
      notMerge
      lazyUpdate
    />
  );
}