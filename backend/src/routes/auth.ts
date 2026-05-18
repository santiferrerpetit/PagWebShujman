import { Router } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import prisma from "../lib/prisma";
import { authenticateToken, type AuthenticatedRequest } from "../middleware/auth";

const router = Router();

router.post("/register", async (req, res) => {
  try {
    const data = req.body as {
      username: string;
      email: string;
      password: string;
      confirmPassword: string;
    };

    if (data.password !== data.confirmPassword) {
      res.status(400).json({ message: "Las contraseñas no coinciden" });
      return;
    }

    const emailFound = await prisma.user.findUnique({
      where: { email: data.email },
    });
    if (emailFound) {
      res.status(400).json({ message: "El email ya está registrado" });
      return;
    }

    const usernameFound = await prisma.user.findUnique({
      where: { username: data.username },
    });
    if (usernameFound) {
      res.status(400).json({ message: "El nombre de usuario ya está registrado" });
      return;
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    const newUser = await prisma.user.create({
      data: {
        username: data.username,
        email: data.email,
        password: hashedPassword,
      },
    });

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _, ...user } = newUser;

    res.status(201).json(user);
  } catch (error) {
    console.error("[register] error:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body as { email: string; password: string };

    if (!email || !password) {
      res.status(400).json({ message: "Email y contraseña requeridos" });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      res.status(401).json({ message: "Credenciales inválidas" });
      return;
    }

    const matchPassword = await bcrypt.compare(password, user.password);
    if (!matchPassword) {
      res.status(401).json({ message: "Credenciales inválidas" });
      return;
    }

    const token = jwt.sign(
      { id: String(user.id), name: user.username, email: user.email },
      process.env.JWT_SECRET!,
      { expiresIn: "7d" }
    );

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _, ...userWithoutPassword } = user;

    res.json({ token, user: userWithoutPassword });
  } catch (error) {
    console.error("[login] error:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
});

router.get("/me", authenticateToken, (req: AuthenticatedRequest, res) => {
  res.json({ user: req.user });
});

router.post("/logout", (_req, res) => {
  // JWT es stateless; el logout se hace en el cliente borrando el token.
  res.json({ message: "Logout exitoso" });
});

export default router;
