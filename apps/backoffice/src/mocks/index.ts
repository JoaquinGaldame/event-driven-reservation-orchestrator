// Realistic mock data for the reservation orchestration platform
export type Channel = "Airbnb" | "Booking.com" | "Vrbo" | "Direct" | "Admin";
export type ReservationStatus =
  | "Confirmed"
  | "Pending"
  | "Rejected"
  | "Failed"
  | "Compensated"
  | "Cancelled";
export type PaymentStatus = "Paid" | "Pending" | "Failed" | "Refunded" | "N/A";
export type LockStatus = "Active" | "Released" | "Expired" | "Rejected" | "None";
export type OpStatus = "healthy" | "warning" | "critical";
export type EventType =
  | "ReservationRequested"
  | "InventoryLockRequested"
  | "InventoryLocked"
  | "InventoryLockRejected"
  | "PaymentRequested"
  | "PaymentConfirmed"
  | "PaymentFailed"
  | "NotificationRequested"
  | "NotificationSent"
  | "NotificationFailed"
  | "ReservationConfirmed"
  | "ReservationRejected"
  | "CompensationStarted"
  | "InventoryReleased"
  | "PaymentRefunded";

export interface Reservation {
  reservationId: string;
  publicId: string;
  channel: Channel;
  guestName: string;
  propertyName: string;
  unitName: string;
  checkIn: string;
  checkOut: string;
  reservationStatus: ReservationStatus;
  inventoryLockStatus: LockStatus;
  paymentStatus: PaymentStatus;
  correlationId: string;
  idempotencyKey: string;
  retryCount: number;
  failureReason?: string;
  createdAt: string;
  amount: number;
}

const channels: Channel[] = ["Airbnb", "Booking.com", "Vrbo", "Direct", "Admin"];
const guests = [
  "Marta Sánchez", "Liam O'Connor", "Yuki Tanaka", "Noah Schmidt", "Aisha Khan",
  "Diego Ramírez", "Sofia Rossi", "Chen Wei", "Olivia Brown", "Mateusz Kowalski",
  "Fatima Al-Hassan", "Hugo Martin", "Emma Larsson", "Rohan Patel", "Isabela Costa",
  "Jonas Becker", "Léa Dubois", "Hiroshi Sato", "Anna Novak", "Carlos Mendes",
];

export interface Property {
  id: string;
  name: string;
  city: string;
  country: string;
  ownerId: string;
  units: string[];
  channels: Channel[];
}

const properties: Property[] = [
  { id: "prop_01", name: "Casa del Mar — Barcelona", city: "Barcelona", country: "ES",
    ownerId: "own_vidal", units: ["Suite Atlántico", "Loft Marina", "Studio Born"],
    channels: ["Airbnb", "Booking.com", "Direct"] },
  { id: "prop_02", name: "Alpine Lodge — Zermatt", city: "Zermatt", country: "CH",
    ownerId: "own_berger", units: ["Chalet Matterhorn", "Suite Glacier", "Room Edelweiss"],
    channels: ["Booking.com", "Vrbo", "Direct"] },
  { id: "prop_03", name: "Kyoto Machiya — Gion", city: "Kyoto", country: "JP",
    ownerId: "own_watanabe", units: ["Tatami Suite", "Garden Room", "Tea House"],
    channels: ["Airbnb", "Direct"] },
  { id: "prop_04", name: "Brooklyn Heights Brownstone", city: "New York", country: "US",
    ownerId: "own_vidal", units: ["Parlor Floor", "Garden Apt", "Top Floor"],
    channels: ["Airbnb", "Vrbo", "Direct"] },
  { id: "prop_05", name: "Riad Yasmine — Marrakech", city: "Marrakech", country: "MA",
    ownerId: "own_benali", units: ["Patio Suite", "Rooftop Room", "Hammam Suite"],
    channels: ["Booking.com", "Airbnb"] },
  { id: "prop_06", name: "Lisbon Tile House", city: "Lisbon", country: "PT",
    ownerId: "own_benali", units: ["Azulejo 1", "Azulejo 2", "Tejo View"],
    channels: ["Airbnb", "Booking.com", "Vrbo", "Direct"] },
];

const failures = [
  "Payment gateway timeout (Stripe 504)",
  "Inventory lock conflict — overlapping dates",
  "Notification webhook 502 from provider",
  "Idempotency key collision — duplicate request",
  "Downstream consumer lag exceeded SLA",
  "Saga compensation triggered — rollback complete",
];

function rand<T>(arr: T[], i: number): T {
  return arr[i % arr.length];
}
function pid(prefix: string, n: number): string {
  return `${prefix}_${(n * 9301 + 49297) % 233280}${n}`.toLowerCase();
}
function isoDaysFromNow(d: number): string {
  return new Date(Date.now() + d * 86400000).toISOString();
}

export const reservations: Reservation[] = Array.from({ length: 64 }, (_, i) => {
  const prop = rand(properties, i * 3);
  const unit = rand(prop.units, i);
  const channel = rand(channels, i + 1);
  const status: ReservationStatus = rand(
    ["Confirmed", "Confirmed", "Confirmed", "Pending", "Failed", "Rejected", "Compensated", "Cancelled"],
    i + 2,
  );
  const payment: PaymentStatus =
    status === "Confirmed" ? "Paid"
    : status === "Pending" ? "Pending"
    : status === "Failed" ? "Failed"
    : status === "Compensated" ? "Refunded"
    : status === "Rejected" ? "N/A"
    : "Refunded";
  const lock: LockStatus =
    status === "Confirmed" ? "Active"
    : status === "Pending" ? "Active"
    : status === "Failed" ? "Released"
    : status === "Rejected" ? "Rejected"
    : "Released";
  return {
    reservationId: `res_${(1000000 + i).toString(36)}`,
    publicId: `RSV-${String(2024100 + i)}`,
    channel,
    guestName: rand(guests, i),
    propertyName: prop.name,
    unitName: unit,
    checkIn: isoDaysFromNow(i - 5),
    checkOut: isoDaysFromNow(i - 5 + ((i % 6) + 2)),
    reservationStatus: status,
    inventoryLockStatus: lock,
    paymentStatus: payment,
    correlationId: pid("corr", i),
    idempotencyKey: pid("idem", i + 7),
    retryCount: status === "Failed" ? (i % 4) + 1 : 0,
    failureReason: status === "Failed" || status === "Compensated" ? rand(failures, i) : undefined,
    createdAt: isoDaysFromNow(-i * 0.3),
    amount: 120 + ((i * 37) % 880),
  };
});

export const kpis = {
  received: 1284,
  confirmed: 1041,
  pending: 87,
  rejected: 92,
  failed: 34,
  compensated: 30,
  preventedOverbookings: 47,
  duplicatesIgnored: 213,
  paymentFailureRate: 3.2,
};

export const channelDistribution = [
  { channel: "Airbnb", count: 512, color: "var(--color-chart-1)" },
  { channel: "Booking.com", count: 387, color: "var(--color-chart-2)" },
  { channel: "Vrbo", count: 198, color: "var(--color-chart-3)" },
  { channel: "Direct", count: 142, color: "var(--color-chart-4)" },
  { channel: "Admin", count: 45, color: "var(--color-chart-5)" },
];

export const reservationsTrend = Array.from({ length: 14 }, (_, i) => ({
  day: `D-${13 - i}`,
  received: 60 + ((i * 17) % 50),
  confirmed: 45 + ((i * 13) % 40),
  failed: ((i * 7) % 8),
}));

export interface PropertyOps {
  propertyId: string;
  property: string;
  city: string;
  country: string;
  ownerId: string;
  units: number;
  channels: Channel[];
  occupancy: number;
  activeLocks: number;
  rejectedOverlaps: number;
  status: OpStatus;
  pressure: "Low" | "Medium" | "High" | "Critical";
}

export const propertyOps: PropertyOps[] = properties.map((p, i) => {
  const pressure = (["Low", "Medium", "High", "Critical"] as const)[i % 4];
  const status: OpStatus =
    pressure === "Critical" ? "critical" : pressure === "High" ? "warning" : "healthy";
  return {
    propertyId: p.id,
    property: p.name,
    city: p.city,
    country: p.country,
    ownerId: p.ownerId,
    units: p.units.length,
    channels: p.channels,
    occupancy: 55 + ((i * 11) % 40),
    activeLocks: 2 + (i % 7),
    rejectedOverlaps: (i * 3) % 9,
    status,
    pressure,
  };
});

// Kept for back-compat with existing imports
export const inventoryPressure = propertyOps;

export interface TimelineEvent {
  eventType: EventType;
  serviceName: string;
  timestamp: string;
  status: "ok" | "error" | "pending" | "warn";
  payload?: Record<string, unknown>;
  retry?: number;
  note?: string;
}

export function timelineFor(r: Reservation): TimelineEvent[] {
  const base = new Date(r.createdAt).getTime();
  const t = (m: number) => new Date(base + m * 60000).toISOString();
  const ok: TimelineEvent[] = [
    { eventType: "ReservationRequested", serviceName: "ingress-gateway", timestamp: t(0), status: "ok",
      payload: { channel: r.channel, idempotencyKey: r.idempotencyKey } },
    { eventType: "InventoryLockRequested", serviceName: "inventory-svc", timestamp: t(0.2), status: "ok" },
    { eventType: "InventoryLocked", serviceName: "inventory-svc", timestamp: t(0.5), status: "ok",
      payload: { lockTtl: "15m", unit: r.unitName } },
    { eventType: "PaymentRequested", serviceName: "payments-svc", timestamp: t(0.7), status: "ok" },
    { eventType: "PaymentConfirmed", serviceName: "payments-svc", timestamp: t(2.4), status: "ok",
      payload: { amount: r.amount, currency: "EUR" } },
    { eventType: "NotificationRequested", serviceName: "notify-svc", timestamp: t(2.5), status: "ok" },
    { eventType: "NotificationSent", serviceName: "notify-svc", timestamp: t(2.8), status: "ok",
      payload: { channels: ["email", "sms"] } },
    { eventType: "ReservationConfirmed", serviceName: "orchestrator", timestamp: t(3), status: "ok" },
  ];
  if (r.reservationStatus === "Confirmed") return ok;
  if (r.reservationStatus === "Pending") return ok.slice(0, 4).map((e, i) => i === 3 ? { ...e, status: "pending" } : e);
  if (r.reservationStatus === "Rejected") {
    return [
      ok[0],
      ok[1],
      { eventType: "InventoryLockRejected", serviceName: "inventory-svc", timestamp: t(0.4), status: "error",
        note: "Overlapping reservation detected for unit" },
      { eventType: "ReservationRejected", serviceName: "orchestrator", timestamp: t(0.5), status: "error" },
    ];
  }
  if (r.reservationStatus === "Failed") {
    return [
      ok[0], ok[1], ok[2], ok[3],
      { eventType: "PaymentFailed", serviceName: "payments-svc", timestamp: t(2.1), status: "error",
        retry: r.retryCount, note: r.failureReason },
      { eventType: "CompensationStarted", serviceName: "orchestrator", timestamp: t(2.3), status: "warn" },
      { eventType: "InventoryReleased", serviceName: "inventory-svc", timestamp: t(2.4), status: "ok" },
    ];
  }
  if (r.reservationStatus === "Compensated") {
    return [
      ...ok.slice(0, 7),
      { eventType: "NotificationFailed", serviceName: "notify-svc", timestamp: t(2.9), status: "error", note: r.failureReason },
      { eventType: "CompensationStarted", serviceName: "orchestrator", timestamp: t(3.1), status: "warn" },
      { eventType: "PaymentRefunded", serviceName: "payments-svc", timestamp: t(3.5), status: "ok" },
      { eventType: "InventoryReleased", serviceName: "inventory-svc", timestamp: t(3.6), status: "ok" },
    ];
  }
  return ok;
}

export interface DeadLetterEvent {
  id: string;
  eventType: EventType;
  serviceName: string;
  correlationId: string;
  reservationId: string;
  retryCount: number;
  lastError: string;
  ageMinutes: number;
  severity: "low" | "medium" | "high" | "critical";
}

export const deadLetterEvents: DeadLetterEvent[] = Array.from({ length: 8 }, (_, i) => {
  const retry = 5 + (i % 3);
  const age = 12 + i * 47;
  const severity: DeadLetterEvent["severity"] =
    retry >= 7 || age > 240 ? "critical" : retry >= 6 ? "high" : age > 60 ? "medium" : "low";
  return {
    id: `dlq_${i}`,
    eventType: rand(["PaymentConfirmed", "NotificationSent", "InventoryLocked"], i) as EventType,
    serviceName: rand(["payments-svc", "notify-svc", "inventory-svc"], i),
    correlationId: pid("corr", i + 100),
    reservationId: `res_${(2000 + i).toString(36)}`,
    retryCount: retry,
    lastError: rand(failures, i + 1),
    ageMinutes: age,
    severity,
  };
});

export interface StuckWorkflow {
  correlationId: string;
  reservationId: string;
  stuckAt: EventType;
  ageMinutes: number;
  severity: "low" | "medium" | "high" | "critical";
}

export const stuckWorkflows: StuckWorkflow[] = Array.from({ length: 5 }, (_, i) => {
  const age = 8 + i * 13;
  return {
    correlationId: pid("corr", i + 500),
    reservationId: `res_${(3000 + i).toString(36)}`,
    stuckAt: rand(["PaymentRequested", "InventoryLockRequested", "NotificationRequested"], i) as EventType,
    ageMinutes: age,
    severity: age > 50 ? "high" : age > 30 ? "medium" : "low",
  };
});

export const services = [
  { name: "ingress-gateway", status: "healthy", p99: 42, lag: 0 },
  { name: "orchestrator", status: "healthy", p99: 88, lag: 12 },
  { name: "inventory-svc", status: "degraded", p99: 312, lag: 184 },
  { name: "payments-svc", status: "healthy", p99: 156, lag: 7 },
  { name: "notify-svc", status: "degraded", p99: 540, lag: 421 },
  { name: "audit-log", status: "healthy", p99: 24, lag: 3 },
];

export interface AuditEntry {
  id: string;
  timestamp: string;
  eventType: EventType;
  serviceName: string;
  reservationId: string;
  correlationId: string;
  channel: Channel;
  status: "ok" | "error" | "warn";
  payload: Record<string, unknown>;
}

export const auditLog: AuditEntry[] = reservations.flatMap((r) =>
  timelineFor(r).map((e, i) => ({
    id: `${r.reservationId}_${i}`,
    timestamp: e.timestamp,
    eventType: e.eventType,
    serviceName: e.serviceName,
    reservationId: r.reservationId,
    correlationId: r.correlationId,
    channel: r.channel,
    status: e.status === "pending" ? "warn" : (e.status as "ok" | "error" | "warn"),
    payload: { reservationId: r.reservationId, publicId: r.publicId, ...e.payload },
  })),
).slice(0, 300);

export const propertiesList = properties;

// ---- Owners ----
export interface Owner {
  id: string;
  name: string;
  code: string;
  properties: number;
  monthlyRevenue: number;
  pendingPayouts: number;
  propertiesAtRisk: number;
  lastPayoutStatus: "Paid" | "Pending" | "Failed";
  lastPayoutDate: string;
}

export const owners: Owner[] = [
  { id: "own_vidal", name: "Mireia Vidal", code: "owner_8312",
    properties: 2, monthlyRevenue: 18420, pendingPayouts: 4210,
    propertiesAtRisk: 1, lastPayoutStatus: "Paid", lastPayoutDate: "2026-05-12" },
  { id: "own_berger", name: "Thomas Berger", code: "owner_9024",
    properties: 1, monthlyRevenue: 12860, pendingPayouts: 0,
    propertiesAtRisk: 0, lastPayoutStatus: "Paid", lastPayoutDate: "2026-05-15" },
  { id: "own_watanabe", name: "Sayuri Watanabe", code: "owner_4476",
    properties: 1, monthlyRevenue: 7440, pendingPayouts: 7440,
    propertiesAtRisk: 0, lastPayoutStatus: "Pending", lastPayoutDate: "2026-04-30" },
  { id: "own_benali", name: "Ahmed Benali", code: "owner_2218",
    properties: 2, monthlyRevenue: 22310, pendingPayouts: 1820,
    propertiesAtRisk: 2, lastPayoutStatus: "Failed", lastPayoutDate: "2026-05-09" },
];

// ---- Channels integration ----
export interface ChannelIntegration {
  name: Channel;
  enabled: boolean;
  webhookStatus: "healthy" | "degraded" | "down";
  lastEventReceived: string;
  duplicatesIgnored: number;
  failedEvents: number;
  avgLatencyMs: number;
  idempotencyPolicy: string;
  status: OpStatus;
  transport: string;
}

export const channelIntegrations: ChannelIntegration[] = [
  { name: "Airbnb", enabled: true, webhookStatus: "healthy", lastEventReceived: "2m ago",
    duplicatesIgnored: 142, failedEvents: 3, avgLatencyMs: 218,
    idempotencyPolicy: "X-Airbnb-Delivery + payload hash", status: "healthy",
    transport: "OAuth · webhook v2" },
  { name: "Booking.com", enabled: true, webhookStatus: "healthy", lastEventReceived: "11s ago",
    duplicatesIgnored: 58, failedEvents: 1, avgLatencyMs: 412,
    idempotencyPolicy: "ReservationID + version", status: "healthy",
    transport: "XML push · 5 min interval" },
  { name: "Vrbo", enabled: true, webhookStatus: "degraded", lastEventReceived: "47m ago",
    duplicatesIgnored: 9, failedEvents: 14, avgLatencyMs: 1240,
    idempotencyPolicy: "external_event_id", status: "warning",
    transport: "REST · OAuth" },
  { name: "Direct", enabled: true, webhookStatus: "healthy", lastEventReceived: "4s ago",
    duplicatesIgnored: 4, failedEvents: 0, avgLatencyMs: 92,
    idempotencyPolicy: "Client-generated UUID", status: "healthy",
    transport: "Internal API · website" },
  { name: "Admin", enabled: true, webhookStatus: "healthy", lastEventReceived: "1m ago",
    duplicatesIgnored: 0, failedEvents: 0, avgLatencyMs: 38,
    idempotencyPolicy: "Operator-audited UUID", status: "healthy",
    transport: "Internal console" },
];

// ---- Users & roles ----
export type Role = "Support Agent" | "Operations Engineer" | "Business Analyst" | "Platform Admin";

export interface UserAccount {
  id: string;
  name: string;
  role: Role;
  mfa: boolean;
  lastLogin: string;
  email: string;
}

export const userAccounts: UserAccount[] = [
  { id: "u_01", name: "Elena Bauer", role: "Platform Admin", mfa: true,
    lastLogin: "12 min ago", email: "elena.bauer@resona.io" },
  { id: "u_02", name: "Marcus Chen", role: "Operations Engineer", mfa: true,
    lastLogin: "1h ago", email: "marcus.chen@resona.io" },
  { id: "u_03", name: "Aïcha Tahar", role: "Operations Engineer", mfa: true,
    lastLogin: "3h ago", email: "aicha.tahar@resona.io" },
  { id: "u_04", name: "Lucas Pereira", role: "Support Agent", mfa: false,
    lastLogin: "26 min ago", email: "lucas.pereira@resona.io" },
  { id: "u_05", name: "Priya Anand", role: "Support Agent", mfa: true,
    lastLogin: "8 min ago", email: "priya.anand@resona.io" },
  { id: "u_06", name: "Felix Vogel", role: "Business Analyst", mfa: true,
    lastLogin: "yesterday", email: "felix.vogel@resona.io" },
];

export const rolePermissions: { permission: string; roles: Record<Role, boolean> }[] = [
  { permission: "View reservations",
    roles: { "Support Agent": true,  "Operations Engineer": true, "Business Analyst": true, "Platform Admin": true } },
  { permission: "Retry events",
    roles: { "Support Agent": false, "Operations Engineer": true, "Business Analyst": false, "Platform Admin": true } },
  { permission: "View audit",
    roles: { "Support Agent": true,  "Operations Engineer": true, "Business Analyst": true, "Platform Admin": true } },
  { permission: "Manage inventory",
    roles: { "Support Agent": false, "Operations Engineer": true, "Business Analyst": false, "Platform Admin": true } },
  { permission: "Trigger compensation",
    roles: { "Support Agent": false, "Operations Engineer": true, "Business Analyst": false, "Platform Admin": true } },
  { permission: "Manage users",
    roles: { "Support Agent": false, "Operations Engineer": false, "Business Analyst": false, "Platform Admin": true } },
];

export const rolePermissionSummary: Record<Role, string> = {
  "Support Agent": "Read-only · can search reservations and view audit trail",
  "Operations Engineer": "Retry events, manage inventory locks, trigger compensation",
  "Business Analyst": "Read access to dashboards, audit and financial summaries",
  "Platform Admin": "Full access including user management and channel configuration",
};

// ---- Units (operational view) ----
export interface UnitOps {
  id: string;
  unit: string;
  property: string;
  city: string;
  capacity: number;
  availability: "available" | "booked" | "locked" | "conflict";
  activeLocks: number;
  nextCheckIn?: string;
  nextCheckOut?: string;
  lastConflict?: string;
  status: OpStatus;
}

export const unitsOps: UnitOps[] = properties.flatMap((p, pi) =>
  p.units.map((u, ui) => {
    const idx = pi * 4 + ui;
    const avail = (["available", "booked", "locked", "conflict"] as const)[idx % 4];
    const status: OpStatus =
      avail === "conflict" ? "critical" : avail === "locked" && idx % 5 === 0 ? "warning" : "healthy";
    return {
      id: `${p.id}_u${ui}`,
      unit: u,
      property: p.name,
      city: p.city,
      capacity: 2 + (idx % 4),
      availability: avail,
      activeLocks: avail === "available" ? 0 : 1 + (idx % 3),
      nextCheckIn: isoDaysFromNow(idx % 7 + 1),
      nextCheckOut: isoDaysFromNow(idx % 7 + 4),
      lastConflict: idx % 3 === 0 ? `${idx + 2}h ago — overlap with Airbnb` : undefined,
      status,
    };
  }),
);
