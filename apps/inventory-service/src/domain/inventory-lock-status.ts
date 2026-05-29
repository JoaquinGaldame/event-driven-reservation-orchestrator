export const InventoryLockStatus = {
  Active: "ACTIVE",
  Released: "RELEASED",
  Expired: "EXPIRED",
  Cancelled: "CANCELLED",
} as const;

export type InventoryLockStatus =
  (typeof InventoryLockStatus)[keyof typeof InventoryLockStatus];

export function isTerminalInventoryLockStatus(status: InventoryLockStatus): boolean {
  return (
    status === InventoryLockStatus.Released ||
    status === InventoryLockStatus.Expired ||
    status === InventoryLockStatus.Cancelled
  );
}