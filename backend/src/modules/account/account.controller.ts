import type { Request, Response } from "express";
import { asyncHandler } from "../../middleware/asyncHandler";
import { getAccountsSummary, getMemberAccount } from "./account.service";

export const summary = asyncHandler(async (_req: Request, res: Response) => {
  res.json(await getAccountsSummary());
});

export const memberAccount = asyncHandler(async (req: Request, res: Response) => {
  res.json(await getMemberAccount(Number(req.params.memberId)));
});
