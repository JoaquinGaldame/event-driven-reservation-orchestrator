import "dotenv/config";
import { config } from "./config.js";
import { buildServer } from "./interfaces/http/server.js";


async function bootstrap() {
  const server = await buildServer();

  try {
    await server.listen({
      port: config.port,
      host: "0.0.0.0",
    });

    server.log.info(`gateway-api listening on port ${config.port}`);
  } catch (error) {
    server.log.error(error, "failed to start gateway-api");
    process.exit(1);
  }
}

bootstrap();