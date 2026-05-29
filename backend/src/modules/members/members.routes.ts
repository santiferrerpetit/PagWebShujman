import { Router } from "express";
import { authenticateToken } from "../../middleware/auth";
import { validate } from "../../middleware/validate";
import {
  listMembers,
  getMember,
  create,
  update,
  remove,
} from "./members.controller";
import { createMemberSchema, updateMemberSchema, memberIdSchema } from "./members.schema";

const router = Router();

router.get("/", authenticateToken, listMembers);
router.get("/:id", authenticateToken, validate(memberIdSchema, "params"), getMember);
router.post("/", authenticateToken, validate(createMemberSchema), create);
router.put("/:id", authenticateToken, validate(memberIdSchema, "params"), validate(updateMemberSchema), update);
router.delete("/:id", authenticateToken, validate(memberIdSchema, "params"), remove);

export default router;
