import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    username: string;
    email: string;
    firstName: string;
    lastName: string;
    roleId: number;
    roleName: string;
  };
}

export function authenticateToken(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    res.status(401).json({ message: "Token requerido" });
    return;
  }

  jwt.verify(token, process.env.JWT_SECRET!, (err, decoded) => {
    if (err) {
      res.status(403).json({ message: "Token inválido o expirado" });
      return;
    }

    const payload = decoded as {
      id: string;
      username: string;
      email: string;
      firstName: string;
      lastName: string;
      roleId: number;
      roleName: string;
    };

    req.user = {
      id: payload.id,
      username: payload.username,
      email: payload.email,
      firstName: payload.firstName,
      lastName: payload.lastName,
      roleId: payload.roleId,
      roleName: payload.roleName,
    };

    next();
  });
}
