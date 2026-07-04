import { Router } from "express";
import { db, usersTable } from "@workspace/db";
import { eq, ilike, or, desc, sql } from "drizzle-orm";
import { authenticate, requireAdmin, type AuthRequest } from "../middlewares/auth";
import { UpdateUserBody } from "@workspace/api-zod";

const router = Router();

router.get("/users", authenticate, requireAdmin, async (req: AuthRequest, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    const search = req.query.search as string | undefined;
    const offset = (page - 1) * limit;

    let query = db.select({
      id: usersTable.id,
      name: usersTable.name,
      email: usersTable.email,
      phone: usersTable.phone,
      address: usersTable.address,
      role: usersTable.role,
      isActive: usersTable.isActive,
      createdAt: usersTable.createdAt,
    }).from(usersTable);

    if (search) {
      query = query.where(or(
        ilike(usersTable.name, `%${search}%`),
        ilike(usersTable.email, `%${search}%`),
      )) as typeof query;
    }

    const users = await query.orderBy(desc(usersTable.createdAt)).limit(limit).offset(offset);
    const [{ count }] = await db.select({ count: sql<number>`count(*)` }).from(usersTable);

    res.json({ users, total: Number(count), page, limit });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal error" });
  }
});

router.get("/users/:id", authenticate, async (req: AuthRequest, res) => {
  try {
    const id = Number(req.params.id);
    if (req.userId !== id && req.userRole !== "admin") {
      res.status(403).json({ error: "Forbidden" });
      return;
    }
    const [user] = await db.select({
      id: usersTable.id,
      name: usersTable.name,
      email: usersTable.email,
      phone: usersTable.phone,
      address: usersTable.address,
      role: usersTable.role,
      isActive: usersTable.isActive,
      createdAt: usersTable.createdAt,
    }).from(usersTable).where(eq(usersTable.id, id));
    if (!user) { res.status(404).json({ error: "User not found" }); return; }
    res.json(user);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal error" });
  }
});

router.patch("/users/:id", authenticate, async (req: AuthRequest, res) => {
  try {
    const id = Number(req.params.id);
    if (req.userId !== id && req.userRole !== "admin") {
      res.status(403).json({ error: "Forbidden" });
      return;
    }
    const body = UpdateUserBody.parse(req.body);
    const updateData: Record<string, unknown> = {};
    if (body.name !== undefined) updateData.name = body.name;
    if (body.phone !== undefined) updateData.phone = body.phone;
    if (body.address !== undefined) updateData.address = body.address;
    if (req.userRole === "admin") {
      if (body.isActive !== undefined) updateData.isActive = body.isActive;
      if (body.role !== undefined) updateData.role = body.role;
    }
    const [updated] = await db.update(usersTable).set(updateData).where(eq(usersTable.id, id)).returning();
    const { password: _pw, ...safeUser } = updated;
    res.json(safeUser);
  } catch (err) {
    req.log.error(err);
    res.status(400).json({ error: "Update failed" });
  }
});

router.delete("/users/:id", authenticate, requireAdmin, async (req: AuthRequest, res) => {
  try {
    const id = Number(req.params.id);
    await db.delete(usersTable).where(eq(usersTable.id, id));
    res.json({ message: "User deleted" });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal error" });
  }
});

export default router;
