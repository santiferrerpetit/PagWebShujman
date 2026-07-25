import { Router } from "express";
import { authenticateToken } from "../../middleware/auth";
import { requireAdmin } from "../../middleware/admin";
import { validate } from "../../middleware/validate";
import {
  listClasses,
  get,
  create,
  update,
  remove,
  enroll,
  unenroll,
} from "./classes.controller";
import {
  createClassSchema,
  updateClassSchema,
  classIdSchema,
  enrollMemberSchema,
} from "./classes.schema";

const router = Router();

router.get("/", authenticateToken, listClasses);
router.get("/:id", authenticateToken, validate(classIdSchema, "params"), get);
router.post("/", authenticateToken, requireAdmin, validate(createClassSchema), create);
router.put("/:id", authenticateToken, requireAdmin, validate(classIdSchema, "params"), validate(updateClassSchema), update);
router.delete("/:id", authenticateToken, requireAdmin, validate(classIdSchema, "params"), remove);
router.post("/:id/enroll", authenticateToken, validate(classIdSchema, "params"), validate(enrollMemberSchema), enroll);
router.post("/:id/unenroll", authenticateToken, validate(classIdSchema, "params"), validate(enrollMemberSchema), unenroll);

export default router;
