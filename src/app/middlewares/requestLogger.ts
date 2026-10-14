import { randomUUID } from "crypto";
import { NextFunction, Request, Response } from "express";
import logger from "../../shared/logger";

const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const requestId = (req.headers["x-request-id"] as string) || randomUUID();
  const start = process.hrtime.bigint();

  res.locals.requestId = requestId;
  res.setHeader("X-Request-Id", requestId);

  logger.debug("Incoming request", {
    requestId,
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
  });

  res.on("finish", () => {
    const durationMs = Number(process.hrtime.bigint() - start) / 1e6;
    const meta = {
      requestId,
      method: req.method,
      url: req.originalUrl,
      status: res.statusCode,
      durationMs: Math.round(durationMs * 100) / 100,
      contentLength: res.getHeader("content-length"),
      userAgent: req.get("user-agent"),
    };
    const message = `${req.method} ${req.originalUrl} ${res.statusCode} ${meta.durationMs}ms`;

    if (res.statusCode >= 500) logger.error(message, meta);
    else if (res.statusCode >= 400) logger.warn(message, meta);
    else logger.info(message, meta);
  });

  next();
};

export default requestLogger;
