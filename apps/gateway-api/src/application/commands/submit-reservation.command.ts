import type { ActorContext } from "../../shared/types/actor-context.js";
import type { ChannelCode } from "@reservation/contracts";

export type SubmitReservationCommand = {
  propertyId: string;
  unitId: string;
  guestId: string;
  channelCode: ChannelCode;
  currencyCode: string;
  checkIn: string;
  checkOut: string;
  idempotencyKey: string;
  actorContext: ActorContext;
};