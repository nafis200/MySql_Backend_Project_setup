import compression from "compression";
import cors from "cors";
import express, { Application, Request, Response } from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import httpStatus from "http-status";
import config from "./app/config";
import globalErrorHandler from "./app/middlewares/globalErrorHandler";
import notFound from "./app/middlewares/not-found";
import requestLogger from "./app/middlewares/requestLogger";
import router from "./app/routes";
import prisma from "./shared/prisma";

const app: Application = express();

// Behind a reverse proxy / load balancer, so req.ip is the real client IP.
app.set("trust proxy", 1);
app.disable("x-powered-by");

app.use(helmet());
app.use(cors({ origin: config.corsOrigins, credentials: true }));
app.use(compression());
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));
app.use(requestLogger);

app.get("/", (_req: Request, res: Response) => {
  res.json({ success: true, message: "Godevs E-Learning API" });
});

app.get("/health", async (_req: Request, res: Response) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ success: true, status: "ok", database: "up", uptime: process.uptime() });
  } catch {
    res.status(httpStatus.SERVICE_UNAVAILABLE).json({ success: false, status: "degraded", database: "down" });
  }
});

app.use(
  "/api/v1",
  rateLimit({ windowMs: 60_000, limit: 300, standardHeaders: "draft-8", legacyHeaders: false }),
  router,
);

app.use(notFound);
app.use(globalErrorHandler);

export default app;
