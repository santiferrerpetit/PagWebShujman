import type { Request, Response } from "express";
import {
  getAllSocialFees,
  getSocialFeeById,
  createSocialFee,
  updateSocialFee,
  deleteSocialFee,
  getMemberSocialFees,
  toggleSocialFeePaid,
  generateMonthFees,
} from "./social-fees.service";
import { asyncHandler } from "../../middleware/asyncHandler";

export const listSocialFees = asyncHandler(async (_req: Request, res: Response) => {
  const fees = await getAllSocialFees();
  res.json(fees);
});

export const getSocialFee = asyncHandler(async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const fee = await getSocialFeeById(id);
  if (!fee) {
    res.status(404).json({ message: "Cuota social no encontrada" });
    return;
  }
  res.json(fee);
});

export const create = asyncHandler(async (req: Request, res: Response) => {
  const fee = await createSocialFee(req.body);
  res.status(201).json(fee);
});

export const update = asyncHandler(async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const fee = await updateSocialFee(id, req.body);
  res.json(fee);
});

export const remove = asyncHandler(async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  await deleteSocialFee(id);
  res.status(204).send();
});

export const listMemberSocialFees = asyncHandler(async (req: Request, res: Response) => {
  const memberId = Number(req.params.memberId);
  const fees = await getMemberSocialFees(memberId);
  res.json(fees);
});

export const togglePaid = asyncHandler(async (req: Request, res: Response) => {
  const updated = await toggleSocialFeePaid(req.body);
  res.json(updated);
});

export const generateMonth = asyncHandler(async (req: Request, res: Response) => {
  const result = await generateMonthFees(req.body);
  res.json(result);
});
