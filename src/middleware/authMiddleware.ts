import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { JWTPayload } from "../types/user";

declare global {
  namespace Express {
    interface Request {
      user?: JWTPayload;
    }
  }
}

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Token manquant ou invalide" });
  }

  const token = authHeader.substring(7);

  try {
    const secret = process.env.JWT_SECRET || "your-secret-key";
    const decoded = jwt.verify(token, secret) as JWTPayload;
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ error: "Token invalide ou expiré" });
  }
}
