import type { FastifyInstance } from "fastify";

export async function healthController(server: FastifyInstance) {
  server.get("/", async () => {
    return {
      status: "ok",
      service: "gateway-api",
      timestamp: new Date().toISOString(),
    };
  });
}