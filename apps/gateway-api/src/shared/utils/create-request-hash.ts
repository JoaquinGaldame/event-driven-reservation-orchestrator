import crypto from "node:crypto";

export function createRequestHash(value: unknown): string {
  const normalized = JSON.stringify(value, Object.keys(value as object).sort());

  return crypto.createHash("sha256").update(normalized).digest("hex");
}