import { Router } from "express";
import { authenticateToken } from "../../middleware/auth";
import { requireAdmin } from "../../middleware/admin";
import { validate } from "../../middleware/validate";
import {
  listMembers,
  getMember,
  create,
  update,
  remove,
  toggleActive,
} from "./members.controller";
import { createMemberSchema, updateMemberSchema, memberIdSchema } from "./members.schema";

const router = Router();

router.get("/", authenticateToken, requireAdmin, listMembers);
router.get("/:id", authenticateToken, requireAdmin, validate(memberIdSchema, "params"), getMember);
router.post("/", authenticateToken, requireAdmin, validate(createMemberSchema), create);
router.put("/:id", authenticateToken, requireAdmin, validate(memberIdSchema, "params"), validate(updateMemberSchema), update);
router.delete("/:id", authenticateToken, requireAdmin, validate(memberIdSchema, "params"), remove);
router.post("/:id/toggle-active", authenticateToken, requireAdmin, validate(memberIdSchema, "params"), toggleActive);

export default router;
