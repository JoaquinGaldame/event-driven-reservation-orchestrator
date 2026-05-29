export const EventTypes = {
  ReservationRequested: "ReservationRequested",
  ReservationInventoryLocked: "ReservationInventoryLocked",
  ReservationRejected: "ReservationRejected",
  ReservationConfirmed: "ReservationConfirmed",
  ReservationCancelled: "ReservationCancelled",

  InventoryLockRequested: "InventoryLockRequested",
  InventoryLocked: "InventoryLocked",
  InventoryRejected: "InventoryRejected",
  InventoryReleased: "InventoryReleased",

  PaymentRequested: "PaymentRequested",
  PaymentAuthorized: "PaymentAuthorized",
  PaymentCaptured: "PaymentCaptured",
  PaymentFailed: "PaymentFailed",
  PaymentExpired: "PaymentExpired",
  PaymentRefunded: "PaymentRefunded",

  NotificationRequested: "NotificationRequested",
  NotificationSent: "NotificationSent",
  NotificationFailed: "NotificationFailed",
} as const;