export type EventEnvelope<TType extends string, TPayload> = {
  eventId: string;
  eventType: TType;
  occurredAt: string;
  correlationId: string;
  causationId?: string;
  payload: TPayload;
};