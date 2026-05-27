import type {
  InventoryLockedEvent,
  InventoryRejectedEvent,
  ReservationRequestedEvent,
} from "@reservation/contracts";

export type CreatedReservation = {
  id: number;
  code: string;
  propertyId: number;
  unitId: number;
  checkIn: string;
  checkOut: string;
};

export type CreateReservationResult = {
  reservation: CreatedReservation;
  pendingInventoryLockOutboxEventId: number | null;
};

export interface ReservationRepository {
  createFromRequestedEvent( event: ReservationRequestedEvent ): Promise<CreateReservationResult>;

  markInventoryLocked(event: InventoryLockedEvent): Promise<void>;

  markInventoryRejected(event: InventoryRejectedEvent): Promise<void>;
}
