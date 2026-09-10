import { memoryCache } from "../lib/cache";
import { Router } from "express";
import { db, bannersTable } from "@workspace/db";
import { eq, asc } from "drizzle-orm";
import { authenticate, requireAdmin, type AuthRequest } from "../middlewares/auth";
import { CreateBannerBody, UpdateBannerBody } from "@workspace/api-zod";

const router = Router();

router.get("/banners", async (req, res) => {
  try {
    const cached = memoryCache.get<any[]>("banners");
    if (cached) {
      res.set("Cache-Control", "public, max-age=60, stale-while-revalidate=300");
      res.json(cached);
      return;
    }

    const banners = await db.select().from(bannersTable)
      .where(eq(bannersTable.isActive, true))
      .orderBy(asc(bannersTable.sortOrder));
    memoryCache.set("banners", banners, 180);
    res.set("Cache-Control", "public, max-age=60, stale-while-revalidate=300");
    res.json(banners);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal error" });
  }
});

router.post("/banners", authenticate, requireAdmin, async (req: AuthRequest, res) => {
  try {
    const body = CreateBannerBody.parse(req.body);
    const [banner] = await db.insert(bannersTable).values(body).returning();
    memoryCache.delete(/^banner/); res.status(201).json(banner);
  } catch (err) {
    req.log.error(err);
    res.status(400).json({ error: "Create failed" });
  }
});

router.patch("/banners/:id", authenticate, requireAdmin, async (req: AuthRequest, res) => {
  try {
    const id = Number(req.params.id);
    const body = UpdateBannerBody.parse(req.body);
    const [banner] = await db.update(bannersTable).set(body).where(eq(bannersTable.id, id)).returning();
    memoryCache.delete(/^banner/); res.json(banner);
  } catch (err) {
    req.log.error(err);
    res.status(400).json({ error: "Update failed" });
  }
});

router.delete("/banners/:id", authenticate, requireAdmin, async (req: AuthRequest, res) => {
  try {
    const id = Number(req.params.id);
    await db.delete(bannersTable).where(eq(bannersTable.id, id));
    memoryCache.delete(/^banner/); res.json({ message: "Banner deleted" });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal error" });
  }
});

export default router;
