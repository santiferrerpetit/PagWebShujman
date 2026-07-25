import type { Request, Response } from "express";
import { asyncHandler } from "../../middleware/asyncHandler";
import {
  getAllDisciplines,
  createDiscipline,
  updateDiscipline,
  deleteDiscipline,
} from "./disciplines.service";

export const listDisciplines = asyncHandler(async (_req: Request, res: Response) => {
  const list = await getAllDisciplines();
  res.json(list);
});

export const create = asyncHandler(async (req: Request, res: Response) => {
  const data = req.body;
  const newDiscipline = await createDiscipline(data);
  res.status(201).json(newDiscipline);
});

export const update = asyncHandler(async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const data = req.body;
  const updated = await updateDiscipline(id, data);
  res.json(updated);
});

export const remove = asyncHandler(async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  await deleteDiscipline(id);
  res.json({ message: "Disciplina eliminada correctamente" });
});
