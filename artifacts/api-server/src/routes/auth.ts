import { Router } from "express";
import bcrypt from "bcryptjs";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { authenticate, signToken, type AuthRequest } from "../middlewares/auth";
import { RegisterBody, LoginBody } from "@workspace/api-zod";

const router = Router();

router.post("/auth/register", async (req, res) => {
  try {
    const body = RegisterBody.parse(req.body);
    const existing = await db.select().from(usersTable).where(eq(usersTable.email, body.email));
    if (existing.length > 0) {
      res.status(400).json({ error: "Email already registered" });
      return;
    }
    const hashed = await bcrypt.hash(body.password, 10);
    const [user] = await db.insert(usersTable).values({
      name: body.name,
      email: body.email,
      password: hashed,
      phone: body.phone,
    }).returning();
    const token = signToken(user.id, user.role);
    const { password: _pw, ...safeUser } = user;
    res.status(201).json({ user: safeUser, token });
  } catch (err) {
    req.log.error(err);
    res.status(400).json({ error: "Registration failed" });
  }
});

router.post("/auth/login", async (req, res) => {
  try {
    const body = LoginBody.parse(req.body);
    const [user] = await db.select().from(usersTable).where(eq(usersTable.email, body.email));
    if (!user) {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }
    const valid = await bcrypt.compare(body.password, user.password);
    if (!valid) {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }
    if (!user.isActive) {
      res.status(403).json({ error: "Account disabled" });
      return;
    }
    const token = signToken(user.id, user.role);
    const { password: _pw, ...safeUser } = user;
    res.json({ user: safeUser, token });
  } catch (err) {
    req.log.error(err);
    res.status(400).json({ error: "Login failed" });
  }
});

router.post("/auth/logout", (_req, res) => {
  res.json({ message: "Logged out" });
});

router.get("/auth/me", authenticate, async (req: AuthRequest, res) => {
  try {
    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, req.userId!));
    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }
    const { password: _pw, ...safeUser } = user;
    res.json(safeUser);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal error" });
  }
});

export default router;
