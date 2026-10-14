import jwt, { Secret, SignOptions } from "jsonwebtoken";
import { Role } from "../../generated/prisma/client";

export type TokenPayload = {
  userId: string;
  email: string;
  role: Role;
};

const generateToken = (payload: TokenPayload, secret: Secret, expiresIn: string) =>
  jwt.sign(payload, secret, {
    algorithm: "HS256",
    expiresIn,
  } as SignOptions);

const verifyToken = (token: string, secret: Secret) =>
  jwt.verify(token, secret, { algorithms: ["HS256"] }) as TokenPayload;

export const jwtHelper = {
  generateToken,
  verifyToken,
};
