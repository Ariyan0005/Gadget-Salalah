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

    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      res.status(400).json({ error: "name, email and password are required" });
      return;
    }
    if (password.length < 6) {
      res.status(400).json({ error: "Password must be at least 6 characters" });
      return;
    }

    const hashed = await bcrypt.hash(password, 10);
    const [user] = await db.insert(usersTable).values({
      name,
      email,
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
