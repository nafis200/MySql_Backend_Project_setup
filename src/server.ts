import { Server } from "http";
import app from "./app";
import config from "./app/config";
import logger from "./shared/logger";
import prisma from "./shared/prisma";

let server: Server | undefined;

const shutdown = async (signal: string, exitCode = 0) => {
  logger.info(`${signal} received, shutting down gracefully`);

  const forceExit = setTimeout(() => {
    logger.error("Forced shutdown after timeout");
    process.exit(1);
  }, 10_000);
  forceExit.unref();

  if (server) {
    await new Promise<void>((resolve) => server!.close(() => resolve()));
  }
  await prisma.$disconnect();
  process.exit(exitCode);
};

async function main() {
  await prisma.$connect();
  logger.info("Database connected");

  server = app.listen(config.port, () => {
    logger.info(`Server listening on port ${config.port}`, { env: config.env });
  });
}

process.on("SIGTERM", () => void shutdown("SIGTERM"));
process.on("SIGINT", () => void shutdown("SIGINT"));
process.on("unhandledRejection", (reason) => {
  logger.error("Unhandled promise rejection", { error: reason });
  void shutdown("unhandledRejection", 1);
});
process.on("uncaughtException", (error) => {
  logger.error("Uncaught exception", { error });
  void shutdown("uncaughtException", 1);
});

main().catch((error) => {
  logger.error("Failed to start server", { error });
  process.exit(1);
});
