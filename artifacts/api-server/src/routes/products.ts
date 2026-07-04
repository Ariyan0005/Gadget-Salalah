import { Router } from "express";
import { db, productsTable, categoriesTable, productVariantsTable, insertProductVariantSchema } from "@workspace/db";
import { eq, ilike, and, gte, lte, desc, asc, sql } from "drizzle-orm";
import { authenticate, requireAdmin, type AuthRequest } from "../middlewares/auth";
import { CreateProductBody, UpdateProductBody, UpdateStockBody } from "@workspace/api-zod";

const router = Router();

function productWithCategory(p: Record<string, unknown>, catName?: string | null) {
  return {
    ...p,
    price: Number(p.price),
    originalPrice: p.originalPrice != null ? Number(p.originalPrice) : null,
    rating: p.rating != null ? Number(p.rating) : null,
    discountPercent: p.originalPrice != null && Number(p.originalPrice) > 0
      ? Math.round(((Number(p.originalPrice) - Number(p.price)) / Number(p.originalPrice)) * 100)
      : null,
    categoryName: catName ?? null,
  };
}

router.get("/products/featured", async (req, res) => {
  try {
    const products = await db.select().from(productsTable)
      .where(and(eq(productsTable.isFeatured, true), eq(productsTable.isActive, true)))
      .orderBy(desc(productsTable.soldCount))
      .limit(12);
    const withCats = await Promise.all(products.map(async (p) => {
      const [cat] = await db.select({ name: categoriesTable.name }).from(categoriesTable).where(eq(categoriesTable.id, p.categoryId));
      return productWithCategory(p as unknown as Record<string, unknown>, cat?.name);
    }));
    res.json(withCats);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal error" });
  }
});

router.get("/products/new-arrivals", async (req, res) => {
  try {
    const products = await db.select().from(productsTable)
      .where(eq(productsTable.isActive, true))
      .orderBy(desc(productsTable.createdAt))
      .limit(12);
    const withCats = await Promise.all(products.map(async (p) => {
      const [cat] = await db.select({ name: categoriesTable.name }).from(categoriesTable).where(eq(categoriesTable.id, p.categoryId));
      return productWithCategory(p as unknown as Record<string, unknown>, cat?.name);
    }));
    res.json(withCats);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal error" });
  }
});

router.get("/products/most-discounted", async (req, res) => {
  try {
    const products = await db.select().from(productsTable)
      .where(and(eq(productsTable.isActive, true), sql`${productsTable.originalPrice} IS NOT NULL`))
      .orderBy(sql`(${productsTable.originalPrice}::numeric - ${productsTable.price}::numeric) / ${productsTable.originalPrice}::numeric DESC`)
      .limit(12);
    const withCats = await Promise.all(products.map(async (p) => {
      const [cat] = await db.select({ name: categoriesTable.name }).from(categoriesTable).where(eq(categoriesTable.id, p.categoryId));
      return productWithCategory(p as unknown as Record<string, unknown>, cat?.name);
    }));
    res.json(withCats);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal error" });
  }
});

router.get("/products", async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    const offset = (page - 1) * limit;
    const search = req.query.search as string | undefined;
    const categoryId = req.query.categoryId ? Number(req.query.categoryId) : undefined;
    const minPrice = req.query.minPrice ? Number(req.query.minPrice) : undefined;
    const maxPrice = req.query.maxPrice ? Number(req.query.maxPrice) : undefined;
    const sortBy = (req.query.sortBy as string) || "newest";
    const featured = req.query.featured === "true";

    const conditions = [eq(productsTable.isActive, true)];
    if (search) conditions.push(ilike(productsTable.name, `%${search}%`));
    if (categoryId) conditions.push(eq(productsTable.categoryId, categoryId));
    if (minPrice !== undefined) conditions.push(gte(sql`${productsTable.price}::numeric`, minPrice));
    if (maxPrice !== undefined) conditions.push(lte(sql`${productsTable.price}::numeric`, maxPrice));
    if (featured) conditions.push(eq(productsTable.isFeatured, true));

    const orderMap: Record<string, ReturnType<typeof asc>> = {
      newest: desc(productsTable.createdAt),
      oldest: asc(productsTable.createdAt),
      price_asc: asc(productsTable.price),
      price_desc: desc(productsTable.price),
      popular: desc(productsTable.soldCount),
    };
    const orderBy = orderMap[sortBy] ?? desc(productsTable.createdAt);

    const products = await db.select().from(productsTable)
      .where(and(...conditions))
      .orderBy(orderBy)
      .limit(limit).offset(offset);

    const [{ count }] = await db.select({ count: sql<number>`count(*)` })
      .from(productsTable).where(and(...conditions));

    const withCats = await Promise.all(products.map(async (p) => {
      const [cat] = await db.select({ name: categoriesTable.name }).from(categoriesTable).where(eq(categoriesTable.id, p.categoryId));
      return productWithCategory(p as unknown as Record<string, unknown>, cat?.name);
    }));

    res.json({ products: withCats, total: Number(count), page, limit });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal error" });
  }
});

router.post("/products", authenticate, requireAdmin, async (req: AuthRequest, res) => {
  try {
    const body = CreateProductBody.parse(req.body);
    const [product] = await db.insert(productsTable).values({
      ...body,
      price: String(body.price),
      originalPrice: body.originalPrice != null ? String(body.originalPrice) : undefined,
    }).returning();
    const [cat] = await db.select({ name: categoriesTable.name }).from(categoriesTable).where(eq(categoriesTable.id, product.categoryId));
    res.status(201).json(productWithCategory(product as unknown as Record<string, unknown>, cat?.name));
  } catch (err) {
    req.log.error(err);
    res.status(400).json({ error: "Create failed" });
  }
});

router.get("/products/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const [product] = await db.select().from(productsTable).where(eq(productsTable.id, id));
    if (!product) { res.status(404).json({ error: "Not found" }); return; }
    const [cat] = await db.select({ name: categoriesTable.name }).from(categoriesTable).where(eq(categoriesTable.id, product.categoryId));
    res.json(productWithCategory(product as unknown as Record<string, unknown>, cat?.name));
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal error" });
  }
});

router.patch("/products/:id", authenticate, requireAdmin, async (req: AuthRequest, res) => {
  try {
    const id = Number(req.params.id);
    const body = UpdateProductBody.parse(req.body);
    const updateData: Record<string, unknown> = { ...body };
    if (body.price !== undefined) updateData.price = String(body.price);
    if (body.originalPrice !== undefined) updateData.originalPrice = String(body.originalPrice);
    const [product] = await db.update(productsTable).set(updateData).where(eq(productsTable.id, id)).returning();
    const [cat] = await db.select({ name: categoriesTable.name }).from(categoriesTable).where(eq(categoriesTable.id, product.categoryId));
    res.json(productWithCategory(product as unknown as Record<string, unknown>, cat?.name));
  } catch (err) {
    req.log.error(err);
    res.status(400).json({ error: "Update failed" });
  }
});

router.delete("/products/:id", authenticate, requireAdmin, async (req: AuthRequest, res) => {
  try {
    const id = Number(req.params.id);
    await db.delete(productsTable).where(eq(productsTable.id, id));
    res.json({ message: "Product deleted" });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal error" });
  }
});

router.patch("/products/:id/stock", authenticate, requireAdmin, async (req: AuthRequest, res) => {
  try {
    const id = Number(req.params.id);
    const body = UpdateStockBody.parse(req.body);
    const [current] = await db.select({ stock: productsTable.stock }).from(productsTable).where(eq(productsTable.id, id));
    if (!current) { res.status(404).json({ error: "Not found" }); return; }

    let newStock = body.stock;
    if (body.operation === "add") newStock = current.stock + body.stock;
    else if (body.operation === "subtract") newStock = Math.max(0, current.stock - body.stock);

    const [product] = await db.update(productsTable).set({ stock: newStock }).where(eq(productsTable.id, id)).returning();
    const [cat] = await db.select({ name: categoriesTable.name }).from(categoriesTable).where(eq(categoriesTable.id, product.categoryId));
    res.json(productWithCategory(product as unknown as Record<string, unknown>, cat?.name));
  } catch (err) {
    req.log.error(err);
    res.status(400).json({ error: "Stock update failed" });
  }
});


// ── Product Variants ──────────────────────────────────────────────────────────

router.get("/products/:id/variants", async (req, res) => {
  try {
    const productId = Number(req.params.id);
    const variants = await db.select().from(productVariantsTable)
      .where(eq(productVariantsTable.productId, productId))
      .orderBy(productVariantsTable.isDefault, productVariantsTable.id);
    res.json(variants.map(v => ({
      ...v,
      priceModifier: Number(v.priceModifier),
    })));
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal error" });
  }
});

router.post("/products/:id/variants", authenticate, requireAdmin, async (req: AuthRequest, res) => {
  try {
    const productId = Number(req.params.id);
    const { name, value, priceModifier, stock, sku, isDefault } = req.body as Record<string, unknown>;
    if (!name || typeof name !== "string" || !value || typeof value !== "string") {
      res.status(400).json({ error: "name and value are required strings" }); return;
    }
    const pm = typeof priceModifier === "number" ? priceModifier : 0;
    const st = typeof stock === "number" && stock >= 0 ? Math.floor(stock) : 0;
    const def = typeof isDefault === "boolean" ? isDefault : false;
    // If setting as default, clear other defaults first
    if (isDefault) {
      await db.update(productVariantsTable).set({ isDefault: false }).where(eq(productVariantsTable.productId, productId));
    }
    const [variant] = await db.insert(productVariantsTable).values({
      productId, name: name as string, value: value as string, priceModifier: String(pm), stock: st, sku: (typeof sku === "string" && sku) ? sku : null, isDefault: def,
    }).returning();
    res.status(201).json({ ...variant, priceModifier: Number(variant.priceModifier) });
  } catch (err) {
    req.log.error(err);
    res.status(400).json({ error: "Create variant failed" });
  }
});

router.patch("/products/:id/variants/:variantId", authenticate, requireAdmin, async (req: AuthRequest, res) => {
  try {
    const productId = Number(req.params.id);
    const variantId = Number(req.params.variantId);
    const body = req.body as Record<string, unknown>;
    const { name, value, priceModifier, stock, sku, isDefault } = body;
    const updateData: Record<string, unknown> = {};
    if (name !== undefined) updateData.name = name;
    if (value !== undefined) updateData.value = value;
    if (priceModifier !== undefined) updateData.priceModifier = String(priceModifier);
    if (stock !== undefined) updateData.stock = stock;
    if (sku !== undefined) updateData.sku = sku;
    if (isDefault !== undefined) {
      if (isDefault) {
        await db.update(productVariantsTable).set({ isDefault: false }).where(eq(productVariantsTable.productId, productId));
      }
      updateData.isDefault = isDefault;
    }
    const [variant] = await db.update(productVariantsTable).set(updateData)
      .where(and(eq(productVariantsTable.id, variantId), eq(productVariantsTable.productId, productId)))
      .returning();
    if (!variant) { res.status(404).json({ error: "Variant not found" }); return; }
    res.json({ ...variant, priceModifier: Number(variant.priceModifier) });
  } catch (err) {
    req.log.error(err);
    res.status(400).json({ error: "Update variant failed" });
  }
});

router.delete("/products/:id/variants/:variantId", authenticate, requireAdmin, async (req: AuthRequest, res) => {
  try {
    const productId = Number(req.params.id);
    const variantId = Number(req.params.variantId);
    await db.delete(productVariantsTable)
      .where(and(eq(productVariantsTable.id, variantId), eq(productVariantsTable.productId, productId)));
    res.json({ message: "Variant deleted" });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Delete variant failed" });
  }
});

export default router;
