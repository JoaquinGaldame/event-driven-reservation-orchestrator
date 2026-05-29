type InventoryServiceConfig = {
  databaseUrl: string;
  kafka: {
    broker: string;
    clientId: string;
    groupId: string;
    service: string;
  };
  outbox: {
    batchSize: number;
  };
}

function readRequiredString(key: string, fallback?: string): string {
  const value = process.env[key] ?? fallback;

  if(!value || value.trim().length === 0){
    throw new Error(`Missing required enviroment variable: ${key}`)
  }

  return value;
}


function readPositiveInteger(key: string, fallback: number): number {
  const raw = process.env[key];

  if (raw === undefined || raw.trim() === "") {
    return fallback;
  }

  const parsed = Number(raw);

  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new Error(
      `Environment variable ${key} must be a positive integer. Received: ${raw}`,
    );
  }

  return parsed;
}


export const config: InventoryServiceConfig = {
  databaseUrl: readRequiredString(
    "DATABASE_URL",
    "postgres://reservation_user:reservation_pass@localhost:55432/reservation_orchestrator",
  ),
  kafka: {
    broker: readRequiredString("KAFKA_BROKER", "localhost:9092"),
    clientId: readRequiredString("KAFKA_CLIENT_ID", "inventory-service"),
    groupId: readRequiredString("KAFKA_GROUP_ID", "inventory-service"),
    service: "inventory-service"
  },
  outbox: {
    batchSize: readPositiveInteger("OUTBOX_BATCH_SIZE", 100),
  },
};