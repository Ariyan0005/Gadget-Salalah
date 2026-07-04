import { type Request, type Response, type NextFunction } from "express";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.SESSION_SECRET || "techshop-secret-key";

export interface AuthRequest extends Request {
  userId?: number;
  userRole?: string;
}

export function authenticate(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const token = authHeader.slice(7);
  try {
    const payload = jwt.verify(token, JWT_SECRET) as { userId: number; role: string };
    req.userId = payload.userId;
    req.userRole = payload.role;
    next();
  } catch {
    res.status(401).json({ error: "Invalid token" });
  }
}

export function optionalAuth(req: AuthRequest, _res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith("Bearer ")) {
    const token = authHeader.slice(7);
    try {
      const payload = jwt.verify(token, JWT_SECRET) as { userId: number; role: string };
      req.userId = payload.userId;
      req.userRole = payload.role;
    } catch {
      // ignore
    }
  }
  next();
}

export function requireAdmin(req: AuthRequest, res: Response, next: NextFunction) {
  if (req.userRole !== "admin") {
    res.status(403).json({ error: "Forbidden" });
    return;
  }
  next();
}

export function signToken(userId: number, role: string) {
  return jwt.sign({ userId, role }, JWT_SECRET, { expiresIn: "7d" });
}
