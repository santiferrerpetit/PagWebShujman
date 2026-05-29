import { Router } from "express";
import { register, login, me, logout } from "./auth.controller";
import { authenticateToken } from "../../middleware/auth";
import { validate } from "../../middleware/validate";
import { registerSchema, loginSchema } from "./auth.schema";

const router = Router();

router.post("/register", validate(registerSchema), register);
router.post("/login", validate(loginSchema), login);
router.get("/me", authenticateToken, me);
router.post("/logout", logout);

export default router;
