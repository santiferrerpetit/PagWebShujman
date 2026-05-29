import "dotenv/config";
import express from "express";
import cors from "cors";
import authRoutes from "./modules/auth/auth.routes";
import membersRoutes from "./modules/members/members.routes";
import feesRoutes from "./modules/fees/fees.routes";
import { errorHandler } from "./middleware/errorHandler";

const app = express();

app.use(cors());
app.use(express.json());

// API Routes - montamos cada módulo en su path
app.use("/api/auth", authRoutes);
app.use("/api/members", membersRoutes);
app.use("/api/fees", feesRoutes);

// Health check
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Static files + SPA fallback (for production build)
app.use(express.static("public"));
app.get("*", (_req, res) => {
  res.sendFile("index.html", { root: "public" });
});

// Global error handler - SIEMPRE al final
app.use(errorHandler);

const PORT = Number(process.env.PORT) || 3001;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`API corriendo en puerto ${PORT}`);
});
