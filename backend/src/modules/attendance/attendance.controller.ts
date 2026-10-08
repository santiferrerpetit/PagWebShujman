import type { Request, Response } from "express";
import { asyncHandler } from "../../middleware/asyncHandler";
import { getGroupById } from "../disciplines/disciplines.service";
import {
  getAttendanceList,
  saveAttendance,
  getAttendanceStats,
  getAttendanceReport,
} from "./attendance.service";

export const listAttendance = asyncHandler(async (req: Request, res: Response) => {
  const groupClassId = Number(req.query.groupClassId);
  const dateString = req.query.date as string | undefined;

  if (isNaN(groupClassId)) {
    res.status(400).json({ message: "ID de clase inválido", code: "INVALID_CLASS_ID" });
    return;
  }

  // Security check: if the user is a Professor, they must teach this class
  const loggedUser = (req as any).user;
  if (loggedUser?.roleName === "Professor") {
    const groupDetails = await getGroupById(groupClassId);
    if (groupDetails?.userId !== Number(loggedUser.id)) {
      res.status(403).json({ message: "Acceso denegado. No enseñas esta clase." });
      return;
    }
  }

  const list = await getAttendanceList(groupClassId, dateString);
  res.json(list);
});

export const save = asyncHandler(async (req: Request, res: Response) => {
  const { groupClassId, date, records } = req.body;

  // Security check: if the user is a Professor, they must teach this class
  const loggedUser = (req as any).user;
  if (loggedUser?.roleName === "Professor") {
    const groupDetails = await getGroupById(groupClassId);
    if (groupDetails?.userId !== Number(loggedUser.id)) {
      res.status(403).json({ message: "Acceso denegado. No puedes registrar asistencia en una clase que no enseñas." });
      return;
    }
  }

  const result = await saveAttendance(groupClassId, date, records);
  res.json(result);
});

// Los profesores solo ven los datos de sus propias clases
function professorScope(req: Request): number | undefined {
  const loggedUser = (req as any).user;
  return loggedUser?.roleName === "Professor" ? Number(loggedUser.id) : undefined;
}

export const stats = asyncHandler(async (req: Request, res: Response) => {
  const list = await getAttendanceStats(professorScope(req));
  res.json(list);
});

export const report = asyncHandler(async (req: Request, res: Response) => {
  const data = await getAttendanceReport({ ...(req.query as any), professorId: professorScope(req) });
  res.json(data);
});
