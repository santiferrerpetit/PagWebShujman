import type { Request, Response } from "express";
import {
  getAllFees,
  getFeeById,
  createFee,
  updateFee,
  deleteFee,
  assignFeeToMember,
  toggleFeePaid,
  removeFeeFromMember,
  getMemberFees,
  getAllMemberFees,
} from "./fees.service";
import { asyncHandler } from "../../middleware/asyncHandler";

export const listFees = asyncHandler(async (_req: Request, res: Response) => {
  const fees = await getAllFees();
  res.json(fees);
});

export const getFee = asyncHandler(async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const fee = await getFeeById(id);
  if (!fee) {
    res.status(404).json({ message: "Arancel no encontrado" });
    return;
  }
  res.json(fee);
});

export const create = asyncHandler(async (req: Request, res: Response) => {
  const fee = await createFee(req.body);
  res.status(201).json(fee);
});

export const update = asyncHandler(async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const fee = await updateFee(id, req.body);
  res.json(fee);
});

export const remove = asyncHandler(async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  await deleteFee(id);
  res.status(204).send();
});

export const assignFee = asyncHandler(async (req: Request, res: Response) => {
  const assignment = await assignFeeToMember(req.body);
  res.status(201).json(assignment);
});

export const togglePaid = asyncHandler(async (req: Request, res: Response) => {
  const updated = await toggleFeePaid(req.body);
  res.json(updated);
});

export const unassignFee = asyncHandler(async (req: Request, res: Response) => {
  const memberId = Number(req.params.memberId);
  const feeId = Number(req.params.feeId);
  await removeFeeFromMember(memberId, feeId);
  res.status(204).send();
});

export const listMemberFees = asyncHandler(async (req: Request, res: Response) => {
  const memberId = Number(req.params.memberId);
  const fees = await getMemberFees(memberId);
  res.json(fees);
});

export const listAllMemberFees = asyncHandler(async (_req: Request, res: Response) => {
  const fees = await getAllMemberFees();
  res.json(fees);
});
