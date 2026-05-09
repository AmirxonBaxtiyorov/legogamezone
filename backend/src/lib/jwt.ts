// JWT helperlar.

import jwt from "jsonwebtoken";
import { env } from "../config/env";

export interface JwtPayload {
  userId: number;
}

export function signToken(userId: number, remember = false): string {
  return jwt.sign({ userId }, env.JWT_SECRET, {
    expiresIn: remember ? env.JWT_EXPIRES_IN_REMEMBER : env.JWT_EXPIRES_IN,
  } as jwt.SignOptions);
}

export function verifyToken(token: string): number | null {
  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as JwtPayload;
    return typeof decoded.userId === "number" ? decoded.userId : null;
  } catch {
    return null;
  }
}
