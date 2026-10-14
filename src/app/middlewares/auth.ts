import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status";
import { Role } from "../../generated/prisma/client";
import config from "../config";
import ApiError from "../errors/ApiError";
import { jwtHelper } from "../helper/jwtHelper";

// Usage: router.post("/", auth(Role.ADMIN, Role.INSTRUCTOR), controller)
const auth =
  (...roles: Role[]) =>
  (req: Request, _res: Response, next: NextFunction) => {
    try {
      const token = req.headers.authorization?.split(" ")[1];
      if (!token) {
        throw new ApiError(httpStatus.UNAUTHORIZED, "You are not authorized!");
      }

      const user = jwtHelper.verifyToken(token, config.jwt.accessSecret);
      req.user = user;

      if (roles.length && !roles.includes(user.role)) {
        throw new ApiError(httpStatus.FORBIDDEN, "Forbidden!");
      }
      next();
    } catch (err) {
      next(err instanceof ApiError ? err : new ApiError(httpStatus.UNAUTHORIZED, "Invalid or expired token"));
    }
  };

export default auth;
