export const PaymentStatus = {
  Pending: "PENDING",
  Authorized: "AUTHORIZED",
  Confirmed: "CONFIRMED",
  Failed: "FAILED",
  Cancelled: "CANCELLED",
  Refunded: "REFUNDED",
  PartiallyRefunded: "PARTIALLY_REFUNDED",
  Expired: "EXPIRED"
} as const;

export type PaymentStatus = (typeof PaymentStatus) [keyof typeof PaymentStatus];

export function isTerminalPaymentStatus(status: PaymentStatus): boolean {
  return(
      status === PaymentStatus.Cancelled ||
      status === PaymentStatus.Confirmed ||
      status === PaymentStatus.Failed ||
      status === PaymentStatus.Refunded ||
      status === PaymentStatus.Expired
  );
}