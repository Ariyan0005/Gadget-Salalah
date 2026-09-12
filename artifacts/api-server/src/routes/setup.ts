import { Router } from "express";
import { db, usersTable } from "@workspace/db";
import { eq, sql } from "drizzle-orm";
import bcrypt from "bcryptjs";

const router = Router();

// GET /api/setup/status — check if any admin exists
router.get("/setup/status", async (req, res) => {
  try {
    const [{ count }] = await db
      .select({ count: sql<number>`count(*)` })
      .from(usersTable)
      .where(eq(usersTable.role, "admin"));
    res.json({ adminExists: Number(count) > 0 });
  } catch {
    res.json({ adminExists: false });
  }
});

// POST /api/setup — create first admin (blocked after first use)
router.post("/setup", async (req, res) => {
  try {
    const [{ count }] = await db
      .select({ count: sql<number>`count(*)` })
      .from(usersTable)
      .where(eq(usersTable.role, "admin"));

    if (Number(count) > 0) {
      res.status(403).json({ error: "Setup already complete. Admin already exists." });
      return;
    }

    const { name, email, password } = req.body as {
      name?: unknown;
      email?: unknown;
      password?: unknown;
    };
    const normalizedName = typeof name === "string" ? name.trim() : "";
    const normalizedEmail = typeof email === "string" ? email.trim().toLowerCase() : "";
    if (!normalizedName || !normalizedEmail || typeof password !== "string") {
      res.status(400).json({ error: "name, email and password are required" });
      return;
    }
    if (normalizedName.length > 80 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      res.status(400).json({ error: "Please provide a valid name and email address" });
      return;
    }
    if (password.length < 10) {
      res.status(400).json({ error: "Password must be at least 10 characters" });
      return;
    }

    const hashed = await bcrypt.hash(password, 10);
    const [user] = await db.insert(usersTable).values({
      name: normalizedName,
      email: normalizedEmail,
      password: hashed,
      role: "admin",
    }).returning({ id: usersTable.id, name: usersTable.name, email: usersTable.email, role: usersTable.role });

    res.status(201).json({ message: "Admin created successfully", user });
  } catch (err: any) {
    if (err?.code === "23505") {
      res.status(409).json({ error: "Email already in use" });
      return;
    }
    res.status(500).json({ error: "Setup failed" });
  }
});

export default router;
