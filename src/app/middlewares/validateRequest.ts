import { NextFunction, Request, Response } from "express";
import { ZodType } from "zod";

// Validates and replaces req.body with the parsed (coerced / stripped) value.
const validateRequest =
  (schema: ZodType) => async (req: Request, _res: Response, next: NextFunction) => {
    try {
      req.body = await schema.parseAsync(req.body);
      next();
    } catch (err) {
      next(err);
    }
  };

export default validateRequest;
