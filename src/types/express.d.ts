import { TokenPayload } from "../app/helper/jwtHelper";

declare global {
  namespace Express {
    interface Request {
      user?: TokenPayload;
    }
  }
}

export {};
