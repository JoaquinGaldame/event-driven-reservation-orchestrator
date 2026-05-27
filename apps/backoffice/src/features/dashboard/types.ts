export type KpiTone = 'positive' | 'negative' | 'neutral';

export type DashboardKpi = {
  id: string;
  title: string;
  value: string | number;
  subtitle: string;
  trend?: {
    label: string;
    tone: KpiTone;
  };
};

export type ChannelDistributionItem = {
  channel: string;
  value: number;
};

export type ReservationTrendPoint = {
  day: string;
  received: number;
  confirmed: number;
  failed: number;
};

export type InventoryPressureItem = {
  propertyName: string;
  occupancyPercent: number;
  activeLocks: number;
};

export type AttentionItem = {
  id: string;
  title: string;
  description: string;
  severity: 'warning' | 'critical' | 'info';
};