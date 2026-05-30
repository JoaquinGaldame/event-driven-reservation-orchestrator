import type { IdempotencyRepository } from "../../application/ports/idempotency.repository.js";
import { idempotencyKeys, eq, and,  type Database, } from "@reservation/database";

export class DrizzleIdempotencyRepository implements IdempotencyRepository {
  
  constructor(private readonly db: Database) {}

  async findCompleted<TResponse>(
    scope: string,
    key: string,
  ) {
    const [record] = await this.db
      .select()
      .from(idempotencyKeys)
      .where(
        and(
          eq(idempotencyKeys.scope, scope),
          eq(idempotencyKeys.idempotencyKey, key),
          eq(idempotencyKeys.status, "COMPLETED"),
        ),
      )
      .limit(1);

    if (!record) return null;

    return {
      key: record.idempotencyKey,
      scope: record.scope,
      requestHash: record.requestHash,
      responsePayload: record.responsePayload as TResponse,
      status: "COMPLETED" as const,
    };
  }

  async saveCompleted<TResponse>(params: {
    scope: string;
    key: string;
    requestHash: string;
    responsePayload: TResponse;
  }): Promise<void> {
    await this.db.insert(idempotencyKeys).values({
      scope: params.scope,
      idempotencyKey: params.key,
      requestHash: params.requestHash,
      responsePayload: params.responsePayload,
      status: "COMPLETED",
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    });
  }
}