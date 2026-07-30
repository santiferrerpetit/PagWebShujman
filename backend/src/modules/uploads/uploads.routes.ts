import { Router } from "express";
import { authenticateToken } from "../../middleware/auth";
import { uploadLimiter } from "../../middleware/rateLimiter";
import { upload } from "../../middleware/upload";
import { validate } from "../../middleware/validate";
import { uploadFiles, list, remove } from "./uploads.controller";
import { uploadParamsSchema, listQuerySchema, deleteFileSchema } from "./uploads.schema";

const router = Router();

router.use(authenticateToken);

router.post("/:module", uploadLimiter, validate(uploadParamsSchema, "params"), upload.array("files", 5), uploadFiles);
router.post("/", uploadLimiter, upload.array("files", 5), uploadFiles);

router.get("/", validate(listQuerySchema, "query"), list);
router.delete("/:id", validate(deleteFileSchema, "params"), remove);

export default router;
