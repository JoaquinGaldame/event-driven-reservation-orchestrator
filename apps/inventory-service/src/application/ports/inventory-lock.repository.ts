import { LockInventoryCommand } from "../commands/lock-inventory.command.js";


export type CreatedInventoryLock = {
  id: number;
  reservationId: number;
  propertyId: number;
  unitId: number;
  lockTypeCode: string;
  status: string;
  checkIn: string;
  checkOut: string;
};

export type LockInventoryResult = {
  outcome: "LOCKED" | "REJECTED";
  inventoryLock: CreatedInventoryLock | null;
  rejectionReason: "UNIT_NOT_AVAILABLE" | null;
  pendingResultOutboxEventId: number | null;
};

export interface InventoryLockRepository {
  lockInventory(command: LockInventoryCommand): Promise<LockInventoryResult>;
}
