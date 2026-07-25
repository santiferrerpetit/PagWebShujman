import { Router } from "express";
import { authenticateToken } from "../../middleware/auth";
import { validate } from "../../middleware/validate";
import {
  listAttendance,
  save,
  stats,
} from "./attendance.controller";
import { recordAttendanceSchema } from "./attendance.schema";

const router = Router();

router.get("/", authenticateToken, listAttendance);
router.post("/", authenticateToken, validate(recordAttendanceSchema), save);
router.get("/stats", authenticateToken, stats);

export default router;
