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
      firstName: string;
      lastName: string;
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

    const defaultRole = await prisma.role.findUnique({
      where: { name: "Professor" },
    });
    if (!defaultRole) {
      res.status(500).json({ message: "Error de configuración del servidor" });
      return;
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    const newUser = await prisma.user.create({
      data: {
        username: data.username,
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        password: hashedPassword,
        roleId: defaultRole.id,
      },
      select: {
        id: true,
        username: true,
        email: true,
        firstName: true,
        lastName: true,
        roleId: true,
        role: { select: { id: true, name: true } },
        createdAt: true,
      },
    });

    res.status(201).json(newUser);
  } catch (error) {
    console.error("[register] error:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body as { username: string; password: string };

    if (!username || !password) {
      res.status(400).json({ message: "Usuario y contraseña requeridos" });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { username },
      include: { role: { select: { id: true, name: true } } },
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
      {
        id: String(user.id),
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        roleId: user.role.id,
        roleName: user.role.name,
      },
      process.env.JWT_SECRET!,
      { expiresIn: "7d" }
    );

    const { password: _, ...userWithoutPassword } = user;

    res.json({ token, user: userWithoutPassword });
  } catch (error) {
    console.error("[login] error:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
});

router.get("/me", authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: Number(req.user!.id) },
      select: {
        id: true,
        username: true,
        email: true,
        firstName: true,
        lastName: true,
        roleId: true,
        role: { select: { id: true, name: true } },
        createdAt: true,
        updatedAt: true,
      },
    });
    if (!user) {
      res.status(404).json({ message: "Usuario no encontrado" });
      return;
    }
    res.json({ user });
  } catch (error) {
    console.error("[me] error:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
});

router.post("/logout", (_req, res) => {
  res.json({ message: "Logout exitoso" });
});

export default router;
