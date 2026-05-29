export const ReservationStatus = {
  Pending: "PENDING",
  InventoryLocked: "INVENTORY_LOCKED",
  PaymentRequired: "PAYMENT_REQUIRED",
  Confirmed: "CONFIRMED",
  Rejected: "REJECTED",
  Cancelled: "CANCELLED",
} as const;

export type ReservationStatus =
  (typeof ReservationStatus)[keyof typeof ReservationStatus];

export function isTerminalReservationStatus(status: ReservationStatus): boolean {
  return (
    status === ReservationStatus.Confirmed ||
    status === ReservationStatus.Rejected ||
    status === ReservationStatus.Cancelled
  );
}