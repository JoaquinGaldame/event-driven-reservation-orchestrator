export type ReservationStatus =
  | 'confirmed'
  | 'pending'
  | 'rejected'
  | 'failed'
  | 'compensated'
  | 'cancelled';

export type PaymentStatus =
  | 'paid'
  | 'pending'
  | 'failed'
  | 'refunded'
  | 'not_required';

export type InventoryLockStatus =
  | 'active'
  | 'released'
  | 'rejected'
  | 'expired';

export type ReservationWorkflowEvent = {
  id: string;
  type: string;
  title: string;
  description: string;
  service: string;
  timestamp: string;
  status: 'completed' | 'failed' | 'pending';
  technicalPayload?: Record<string, unknown>;
};

export type Reservation = {
  id: string;
  publicId: string;
  guestName: string;
  channel: string;
  propertyName: string;
  unitName: string;
  checkIn: string;
  checkOut: string;
  amount: number;
  currency: string;
  reservationStatus: ReservationStatus;
  paymentStatus: PaymentStatus;
  inventoryLockStatus: InventoryLockStatus;
  correlationId: string;
  idempotencyKey: string;
  createdAt: string;
  workflow: ReservationWorkflowEvent[];
};