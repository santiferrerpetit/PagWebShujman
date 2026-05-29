import type { Request, Response, NextFunction } from "express";
import type { AuthenticatedRequest } from "./auth";

export function requireAdmin(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  if (req.user?.roleName !== "Administrator") {
    res.status(403).json({ message: "Acceso denegado. Se requiere rol de administrador." });
    return;
  }
  next();
}
