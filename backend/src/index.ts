import "dotenv/config";
import express from "express";
import cors from "cors";
import authRoutes from "./modules/auth/auth.routes";
import membersRoutes from "./modules/members/members.routes";
import feesRoutes from "./modules/fees/fees.routes";
import disciplinesRoutes from "./modules/disciplines/disciplines.routes";
import socialFeesRoutes from "./modules/social-fees/social-fees.routes";
import attendanceRoutes from "./modules/attendance/attendance.routes";
import { errorHandler } from "./middleware/errorHandler";

const app = express();

app.use(cors());
app.use(express.json());

// API Routes - montamos cada módulo en su path
// Local: /api/*  |  Producción (Apache reescribe /~diez/api/* a /*): /auth, /members, etc.
app.use("/api/auth", authRoutes);
app.use("/api/members", membersRoutes);
app.use("/api/fees", feesRoutes);
app.use("/api/disciplines", disciplinesRoutes);
app.use("/api/social-fees", socialFeesRoutes);
app.use("/api/attendance", attendanceRoutes);
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Apache en producción reescribe /~diez/api/* a /* (elimina el prefijo)
// Así que también montamos sin /api para que funcione en el servidor
app.use("/auth", authRoutes);
app.use("/members", membersRoutes);
app.use("/fees", feesRoutes);
app.use("/disciplines", disciplinesRoutes);
app.use("/social-fees", socialFeesRoutes);
app.use("/attendance", attendanceRoutes);
app.get("/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Catch-all 404 for undefined API routes (does not serve frontend files)
app.use((_req, res) => {
  res.status(404).json({ message: "Ruta no encontrada", code: "NOT_FOUND" });
});

// Global error handler - SIEMPRE al final
app.use(errorHandler);

const PORT = Number(process.env.PORT) || 3001;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`API corriendo en puerto ${PORT}`);
});

