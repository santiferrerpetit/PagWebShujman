import type { Request, Response } from "express";
import { asyncHandler } from "../../middleware/asyncHandler";
import {
  getAllClasses,
  getClassDetails,
  createClass,
  updateClass,
  deleteClass,
  enrollMember,
  unenrollMember,
} from "./classes.service";

export const listClasses = asyncHandler(async (req: Request, res: Response) => {
  const filters: { userId?: number } = {};
  const loggedUser = (req as any).user;

  if (loggedUser?.roleName === "Professor") {
    filters.userId = Number(loggedUser.id);
  } else if (req.query.userId) {
    filters.userId = Number(req.query.userId);
  }

  const list = await getAllClasses(filters);
  res.json(list);
});

export const get = asyncHandler(async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const details = await getClassDetails(id);

  // Security check: if the user is a Professor, they should only be able to view their own class details
  const loggedUser = (req as any).user;
  if (loggedUser?.roleName === "Professor" && details.userId !== Number(loggedUser.id)) {
    res.status(403).json({ message: "Acceso denegado. No enseñas esta clase." });
    return;
  }

  res.json(details);
});

export const create = asyncHandler(async (req: Request, res: Response) => {
  const data = req.body;
  const newClass = await createClass(data);
  res.status(201).json(newClass);
});

export const update = asyncHandler(async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const data = req.body;
  const updated = await updateClass(id, data);
  res.json(updated);
});

export const remove = asyncHandler(async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  await deleteClass(id);
  res.json({ message: "Clase eliminada correctamente" });
});

export const enroll = asyncHandler(async (req: Request, res: Response) => {
  const classId = Number(req.params.id);
  const { memberId } = req.body;
  
  // Security check: if the user is a Professor, they should only enroll members in their own classes
  const loggedUser = (req as any).user;
  if (loggedUser?.roleName === "Professor") {
    const details = await getClassDetails(classId);
    if (details.userId !== Number(loggedUser.id)) {
      res.status(403).json({ message: "Acceso denegado. No puedes inscribir en una clase que no enseñas." });
      return;
    }
  }

  const enrollment = await enrollMember(classId, Number(memberId));
  res.status(201).json(enrollment);
});

export const unenroll = asyncHandler(async (req: Request, res: Response) => {
  const classId = Number(req.params.id);
  const { memberId } = req.body;

  // Security check: if the user is a Professor, they should only unenroll members from their own classes
  const loggedUser = (req as any).user;
  if (loggedUser?.roleName === "Professor") {
    const details = await getClassDetails(classId);
    if (details.userId !== Number(loggedUser.id)) {
      res.status(403).json({ message: "Acceso denegado. No puedes desinscribir en una clase que no enseñas." });
      return;
    }
  }

  await unenrollMember(classId, Number(memberId));
  res.json({ message: "Socio desinscripto correctamente de la clase" });
});
