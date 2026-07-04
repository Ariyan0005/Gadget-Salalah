import { Router } from "express";
import { db, cartItemsTable, productsTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { authenticate, type AuthRequest } from "../middlewares/auth";
import { AddToCartBody, UpdateCartItemBody } from "@workspace/api-zod";

const router = Router();

async function buildCart(userId: number) {
  const items = await db.select().from(cartItemsTable).where(eq(cartItemsTable.userId, userId));
  const enriched = await Promise.all(items.map(async (item) => {
    const [product] = await db.select().from(productsTable).where(eq(productsTable.id, item.productId));
    const price = product ? Number(product.price) : 0;
    return {
      id: item.id,
      productId: item.productId,
      productName: product?.name ?? "Unknown",
      productImage: product?.imageUrl ?? null,
      quantity: item.quantity,
      price,
      subtotal: price * item.quantity,
    };
  }));
  const total = enriched.reduce((sum, i) => sum + i.subtotal, 0);
  const itemCount = enriched.reduce((sum, i) => sum + i.quantity, 0);
  return { items: enriched, total, itemCount };
}

router.get("/cart", authenticate, async (req: AuthRequest, res) => {
  try {
    const cart = await buildCart(req.userId!);
    res.json(cart);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal error" });
  }
});

router.post("/cart", authenticate, async (req: AuthRequest, res) => {
  try {
    const body = AddToCartBody.parse(req.body);
    const existing = await db.select().from(cartItemsTable)
      .where(and(eq(cartItemsTable.userId, req.userId!), eq(cartItemsTable.productId, body.productId)));
    if (existing.length > 0) {
      await db.update(cartItemsTable)
        .set({ quantity: existing[0].quantity + body.quantity })
        .where(eq(cartItemsTable.id, existing[0].id));
    } else {
      await db.insert(cartItemsTable).values({ userId: req.userId!, productId: body.productId, quantity: body.quantity });
    }
    const cart = await buildCart(req.userId!);
    res.json(cart);
  } catch (err) {
    req.log.error(err);
    res.status(400).json({ error: "Failed to add to cart" });
  }
});

router.delete("/cart", authenticate, async (req: AuthRequest, res) => {
  try {
    await db.delete(cartItemsTable).where(eq(cartItemsTable.userId, req.userId!));
    res.json({ message: "Cart cleared" });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal error" });
  }
});

router.patch("/cart/:itemId", authenticate, async (req: AuthRequest, res) => {
  try {
    const itemId = Number(req.params.itemId);
    const body = UpdateCartItemBody.parse(req.body);
    if (body.quantity <= 0) {
      await db.delete(cartItemsTable).where(and(eq(cartItemsTable.id, itemId), eq(cartItemsTable.userId, req.userId!)));
    } else {
      await db.update(cartItemsTable).set({ quantity: body.quantity })
        .where(and(eq(cartItemsTable.id, itemId), eq(cartItemsTable.userId, req.userId!)));
    }
    const cart = await buildCart(req.userId!);
    res.json(cart);
  } catch (err) {
    req.log.error(err);
    res.status(400).json({ error: "Update failed" });
  }
});

router.delete("/cart/:itemId", authenticate, async (req: AuthRequest, res) => {
  try {
    const itemId = Number(req.params.itemId);
    await db.delete(cartItemsTable).where(and(eq(cartItemsTable.id, itemId), eq(cartItemsTable.userId, req.userId!)));
    const cart = await buildCart(req.userId!);
    res.json(cart);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal error" });
  }
});

export default router;
