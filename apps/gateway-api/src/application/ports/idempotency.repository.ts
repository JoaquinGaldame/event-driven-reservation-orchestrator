export type IdempotencyRecord<TResponse> = {
  key: string;
  scope: string;
  requestHash: string;
  responsePayload: TResponse;
  status: "COMPLETED";
};

export interface IdempotencyRepository {
  findCompleted<TResponse>(
    scope: string,
    key: string,
  ): Promise<IdempotencyRecord<TResponse> | null>;

  saveCompleted<TResponse>(params: {
    scope: string;
    key: string;
    requestHash: string;
    responsePayload: TResponse;
  }): Promise<void>;
}