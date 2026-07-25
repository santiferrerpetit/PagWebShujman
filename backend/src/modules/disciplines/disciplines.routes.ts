import { Router } from "express";
import { authenticateToken } from "../../middleware/auth";
import { requireAdmin } from "../../middleware/admin";
import { validate } from "../../middleware/validate";
import {
  listDisciplines,
  create,
  update,
  remove,
} from "./disciplines.controller";
import {
  createDisciplineSchema,
  updateDisciplineSchema,
  disciplineIdSchema,
} from "./disciplines.schema";

const router = Router();

router.get("/", authenticateToken, listDisciplines);
router.post("/", authenticateToken, requireAdmin, validate(createDisciplineSchema), create);
router.put("/:id", authenticateToken, requireAdmin, validate(disciplineIdSchema, "params"), validate(updateDisciplineSchema), update);
router.delete("/:id", authenticateToken, requireAdmin, validate(disciplineIdSchema, "params"), remove);

export default router;
