import { Router } from "express";
import { authenticateToken } from "../../middleware/auth";
import { validate } from "../../middleware/validate";
import {
  listAttendance,
  report,
  save,
  stats,
} from "./attendance.controller";
import { requireRoles } from "../../middleware/roles";
import { getAttendanceSchema, recordAttendanceSchema, reportQuerySchema } from "./attendance.schema";

const router = Router();

router.use(authenticateToken, requireRoles("Administrator", "Professor"));

router.get("/", validate(getAttendanceSchema, "query"), listAttendance);
router.post("/", validate(recordAttendanceSchema), save);
router.get("/stats", stats);
router.get("/report", validate(reportQuerySchema, "query"), report);

export default router;
