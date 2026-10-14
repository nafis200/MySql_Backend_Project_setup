import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status";
import { ZodError } from "zod";
import { Prisma } from "../../generated/prisma/client";
import config from "../config";
import ApiError from "../errors/ApiError";
import logger from "../../shared/logger";

const globalErrorHandler = (err: unknown, req: Request, res: Response, _next: NextFunction) => {
  let statusCode: number = httpStatus.INTERNAL_SERVER_ERROR;
  let message = "Something went wrong!";
  let errorDetails: unknown;

  if (err instanceof ApiError) {
    statusCode = err.statusCode;
    message = err.message;
  } else if (err instanceof ZodError) {
    statusCode = httpStatus.BAD_REQUEST;
    message = "Validation Error";
    errorDetails = err.issues.map((issue) => ({
      path: issue.path.join(".") || "unknown",
      message: issue.message,
    }));
  } else if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === "P2002") {
      statusCode = httpStatus.CONFLICT;
      message = "Duplicate value";
      errorDetails = err.meta;
    } else if (err.code === "P2025") {
      statusCode = httpStatus.NOT_FOUND;
      message = "Record not found";
    } else if (err.code === "P2003") {
      statusCode = httpStatus.BAD_REQUEST;
      message = "Related record does not exist";
    }
  } else if (err instanceof Prisma.PrismaClientValidationError) {
    statusCode = httpStatus.BAD_REQUEST;
    message = "Invalid database query";
  } else if (err instanceof SyntaxError && "body" in err) {
    statusCode = httpStatus.BAD_REQUEST;
    message = "Malformed JSON body";
  }

  if (statusCode >= 500) {
    logger.error("Unhandled error", {
      requestId: res.locals.requestId,
      method: req.method,
      url: req.originalUrl,
      error: err,
    });
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(errorDetails !== undefined && { errorDetails }),
    ...(!config.isProduction && err instanceof Error && { stack: err.stack }),
  });
};

export default globalErrorHandler;
