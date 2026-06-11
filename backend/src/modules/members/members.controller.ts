import type { Request, Response } from "express";
import {
  getAllMembers,
  getMemberById,
  createMember,
  updateMember,
  deleteMember,
  toggleMemberActive,
} from "./members.service";
import { asyncHandler } from "../../middleware/asyncHandler";

export const listMembers = asyncHandler(async (_req: Request, res: Response) => {
  const members = await getAllMembers();
  res.json(members);
});

export const getMember = asyncHandler(async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const member = await getMemberById(id);
  if (!member) {
    res.status(404).json({ message: "Socio no encontrado" });
    return;
  }
  res.json(member);
});

export const create = asyncHandler(async (req: Request, res: Response) => {
  const member = await createMember(req.body);
  res.status(201).json(member);
});

export const update = asyncHandler(async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const member = await updateMember(id, req.body);
  res.json(member);
});

export const remove = asyncHandler(async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  await deleteMember(id);
  res.status(204).send();
});

export const toggleActive = asyncHandler(async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const member = await toggleMemberActive(id);
  res.json(member);
});
