import type { Request, Response } from "express";
import {
  getAllDisciplines,
  getDisciplineById,
  createDiscipline,
  setupDiscipline,
  updateDiscipline,
  deleteDiscipline,
  getGroupsByDisciplineId,
  createGroup,
  getGroupById,
  updateGroup,
  deleteGroup,
  assignMemberToGroup,
  removeMemberFromGroup,
  getGroupsByTeacherId,
  getTeachers,
} from "./disciplines.service";
import { asyncHandler } from "../../middleware/asyncHandler";
import type { AuthenticatedRequest } from "../../middleware/auth";

export const listDisciplines = asyncHandler(async (_req: Request, res: Response) => {
  const disciplines = await getAllDisciplines();
  res.json(disciplines);
});

export const getDiscipline = asyncHandler(async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const discipline = await getDisciplineById(id);
  if (!discipline) {
    res.status(404).json({ message: "Disciplina no encontrada" });
    return;
  }
  res.json(discipline);
});

export const create = asyncHandler(async (req: Request, res: Response) => {
  const discipline = await createDiscipline(req.body);
  res.status(201).json(discipline);
});

export const setup = asyncHandler(async (req: Request, res: Response) => {
  const result = await setupDiscipline(req.body);
  res.status(201).json(result);
});

export const update = asyncHandler(async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const discipline = await updateDiscipline(id, req.body);
  res.json(discipline);
});

export const remove = asyncHandler(async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  await deleteDiscipline(id);
  res.status(204).send();
});

export const listGroups = asyncHandler(async (req: Request, res: Response) => {
  const disciplineId = Number(req.params.id);
  const groups = await getGroupsByDisciplineId(disciplineId);
  res.json(groups);
});

export const createGroupCtrl = asyncHandler(async (req: Request, res: Response) => {
  const disciplineId = Number(req.params.id);
  const group = await createGroup(disciplineId, req.body);
  res.status(201).json(group);
});

export const getGroup = asyncHandler(async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const group = await getGroupById(id);
  if (!group) {
    res.status(404).json({ message: "Grupo no encontrado" });
    return;
  }
  res.json(group);
});

export const updateGroupCtrl = asyncHandler(async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const group = await updateGroup(id, req.body);
  res.json(group);
});

export const deleteGroupCtrl = asyncHandler(async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  await deleteGroup(id);
  res.status(204).send();
});

export const assignMember = asyncHandler(async (req: Request, res: Response) => {
  const groupId = Number(req.params.id);
  const assignment = await assignMemberToGroup(groupId, req.body);
  res.status(201).json(assignment);
});

export const removeMember = asyncHandler(async (req: Request, res: Response) => {
  const groupId = Number(req.params.id);
  const memberId = Number(req.params.memberId);
  await removeMemberFromGroup(groupId, memberId);
  res.status(204).send();
});

export const listTeachers = asyncHandler(async (_req: Request, res: Response) => {
  const teachers = await getTeachers();
  res.json(teachers);
});

export const listTeacherGroups = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const teacherId = Number(req.user?.id);
  const groups = await getGroupsByTeacherId(teacherId);
  res.json(groups);
});
