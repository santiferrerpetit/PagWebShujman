import { Router } from "express";
import { authenticateToken } from "../../middleware/auth";
import { requireAdmin } from "../../middleware/admin";
import { validate } from "../../middleware/validate";
import { memberAccount, summary } from "./account.controller";
import { accountMemberIdSchema } from "./account.schema";

const router = Router();

router.use(authenticateToken, requireAdmin);

router.get("/summary", summary);
router.get("/member/:memberId", validate(accountMemberIdSchema, "params"), memberAccount);

export default router;
