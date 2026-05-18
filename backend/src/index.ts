import "dotenv/config";
import express from "express";
import cors from "cors";
import path from "path";
import authRoutes from "./routes/auth";
import someRoutes from "./routes/some";

const app = express();

app.use(cors());
app.use(express.json());

// API routes first
app.use("/api/auth", authRoutes);
app.use("/api/some", someRoutes);

// Serve static files from public/ (frontend build)
app.use(express.static(path.join(__dirname, "../public")));

// SPA fallback: serve index.html for any non-API route
app.get("*", (_req, res) => {
  res.sendFile(path.join(__dirname, "../public/index.html"));
});

const PORT = Number(process.env.PORT) || 3001;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`API corriendo en puerto ${PORT}`);
});
