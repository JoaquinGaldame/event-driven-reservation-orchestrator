import { z } from "zod";

export const ChannelReservationSchema = z.object({
  propertyId: z.string().min(1),
  unitId: z.string().min(1),
  guestId: z.string().min(1),
  currencyCode: z.string().min(1).default("USD"),
  checkIn: z.string().date(),
  checkOut: z.string().date(),
  idempotencyKey: z.string().min(1),
});

export type ChannelReservationBody = z.infer<typeof ChannelReservationSchema>;