import type {
  AttentionItem,
  ChannelDistributionItem,
  DashboardKpi,
  InventoryPressureItem,
  ReservationTrendPoint,
} from '../types';

export const dashboardKpis: DashboardKpi[] = [
  {
    id: 'received',
    title: 'Received',
    value: 1284,
    subtitle: 'Reservations received in the last 24h',
    trend: { label: '+8.2% vs yesterday', tone: 'positive' },
  },
  {
    id: 'confirmed',
    title: 'Confirmed',
    value: 1041,
    subtitle: '81.1% conversion rate',
    trend: { label: '+3.1% conversion', tone: 'positive' },
  },
  {
    id: 'pending',
    title: 'Pending',
    value: 87,
    subtitle: 'In-flight workflows',
    trend: { label: 'Requires monitoring', tone: 'neutral' },
  },
  {
    id: 'rejected',
    title: 'Rejected',
    value: 92,
    subtitle: 'Overlaps, invalid requests or fraud signals',
    trend: { label: '-1.4% vs yesterday', tone: 'neutral' },
  },
  {
    id: 'failed',
    title: 'Failed',
    value: 34,
    subtitle: 'Technical failures requiring recovery',
    trend: { label: '+4 since last hour', tone: 'negative' },
  },
  {
    id: 'compensated',
    title: 'Compensated',
    value: 30,
    subtitle: 'Saga rollback / compensation completed',
    trend: { label: 'Stable', tone: 'neutral' },
  },
  {
    id: 'prevented-overbookings',
    title: 'Prevented overbookings',
    value: 47,
    subtitle: 'Conflicts blocked by inventory locks',
    trend: { label: '+12 prevented today', tone: 'positive' },
  },
  {
    id: 'duplicates-ignored',
    title: 'Duplicates ignored',
    value: 213,
    subtitle: 'Idempotency-key deduplication',
    trend: { label: 'No state duplicated', tone: 'positive' },
  },
];

export const reservationTrend: ReservationTrendPoint[] = [
  { day: 'D-6', received: 72, confirmed: 58, failed: 3 },
  { day: 'D-5', received: 88, confirmed: 70, failed: 4 },
  { day: 'D-4', received: 95, confirmed: 82, failed: 5 },
  { day: 'D-3', received: 80, confirmed: 67, failed: 2 },
  { day: 'D-2', received: 101, confirmed: 84, failed: 6 },
  { day: 'D-1', received: 93, confirmed: 78, failed: 5 },
  { day: 'Today', received: 112, confirmed: 91, failed: 7 },
];

export const channelDistribution: ChannelDistributionItem[] = [
  { channel: 'Airbnb', value: 512 },
  { channel: 'Booking.com', value: 387 },
  { channel: 'Vrbo', value: 198 },
  { channel: 'Direct', value: 142 },
  { channel: 'Admin', value: 45 },
];

export const inventoryPressure: InventoryPressureItem[] = [
  { propertyName: 'Casa del Mar — Barcelona', occupancyPercent: 55, activeLocks: 2 },
  { propertyName: 'Alpine Lodge — Zermatt', occupancyPercent: 66, activeLocks: 3 },
  { propertyName: 'Kyoto Machiya — Gion', occupancyPercent: 77, activeLocks: 4 },
  { propertyName: 'Brooklyn Heights Brownstone', occupancyPercent: 88, activeLocks: 5 },
  { propertyName: 'Riad Yasmine — Marrakech', occupancyPercent: 59, activeLocks: 6 },
  { propertyName: 'Lisbon Tile House', occupancyPercent: 70, activeLocks: 7 },
];

export const needsAttention: AttentionItem[] = [
  {
    id: 'stuck-payment',
    title: 'Workflow stuck at PaymentRequested',
    description: 'corr_34197500 · 8m',
    severity: 'warning',
  },
  {
    id: 'inventory-lag',
    title: 'inventory-svc consumer lag',
    description: '184 messages · p99 312ms',
    severity: 'warning',
  },
  {
    id: 'payment-failures',
    title: '34 reservations awaiting compensation',
    description: 'payments-svc · last 24h',
    severity: 'critical',
  },
  {
    id: 'dlq-events',
    title: '8 events in DLQ',
    description: 'oldest 34m',
    severity: 'critical',
  },
];