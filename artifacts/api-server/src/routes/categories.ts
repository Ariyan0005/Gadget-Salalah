import { memoryCache } from "../lib/cache";
import { Router } from "express";
import { db, categoriesTable, productsTable } from "@workspace/db";
import { eq, sql } from "drizzle-orm";
import { authenticate, requireAdmin, type AuthRequest } from "../middlewares/auth";
import { CreateCategoryBody, UpdateCategoryBody } from "@workspace/api-zod";

const router = Router();

router.get("/categories", async (req, res) => {
  try {
    const cached = memoryCache.get<any[]>("categories");
    if (cached) {
      res.set("Cache-Control", "public, max-age=60, stale-while-revalidate=300");
      res.json(cached);
      return;
    }

    const cats = await db.select({
      id: categoriesTable.id,
      name: categoriesTable.name,
      slug: categoriesTable.slug,
      description: categoriesTable.description,
      imageUrl: categoriesTable.imageUrl,
      createdAt: categoriesTable.createdAt,
      productCount: sql<number>`count(${productsTable.id})`,
    })
      .from(categoriesTable)
      .leftJoin(productsTable, eq(productsTable.categoryId, categoriesTable.id))
      .groupBy(
        categoriesTable.id,
        categoriesTable.name,
        categoriesTable.slug,
        categoriesTable.description,
        categoriesTable.imageUrl,
        categoriesTable.createdAt,
      );

    const result = cats.map((cat) => ({ ...cat, productCount: Number(cat.productCount) }));
    memoryCache.set("categories", result, 180);
    res.set("Cache-Control", "public, max-age=60, stale-while-revalidate=300");
    res.json(result);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal error" });
  }
});

router.post("/categories", authenticate, requireAdmin, async (req: AuthRequest, res) => {
  try {
    const body = CreateCategoryBody.parse(req.body);
    const [cat] = await db.insert(categoriesTable).values(body).returning();
    memoryCache.delete(/^categor/); res.status(201).json({ ...cat, productCount: 0 });
  } catch (err) {
    req.log.error(err);
    res.status(400).json({ error: "Create failed" });
  }
});

router.get("/categories/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const [cat] = await db.select().from(categoriesTable).where(eq(categoriesTable.id, id));
    if (!cat) { res.status(404).json({ error: "Not found" }); return; }
    const [{ count }] = await db.select({ count: sql<number>`count(*)` })
      .from(productsTable).where(eq(productsTable.categoryId, id));
    memoryCache.delete(/^categor/); res.json({ ...cat, productCount: Number(count) });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal error" });
  }
});

router.patch("/categories/:id", authenticate, requireAdmin, async (req: AuthRequest, res) => {
  try {
    const id = Number(req.params.id);
    const body = UpdateCategoryBody.parse(req.body);
    const [cat] = await db.update(categoriesTable).set(body).where(eq(categoriesTable.id, id)).returning();
    const [{ count }] = await db.select({ count: sql<number>`count(*)` })
      .from(productsTable).where(eq(productsTable.categoryId, id));
    res.json({ ...cat, productCount: Number(count) });
  } catch (err) {
    req.log.error(err);
    res.status(400).json({ error: "Update failed" });
  }
});

router.delete("/categories/:id", authenticate, requireAdmin, async (req: AuthRequest, res) => {
  try {
    const id = Number(req.params.id);
    await db.delete(categoriesTable).where(eq(categoriesTable.id, id));
    memoryCache.delete(/^categor/); res.json({ message: "Category deleted" });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal error" });
  }
});

export default router;
