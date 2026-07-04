import { Router } from "express";
import { db, ordersTable, orderItemsTable, cartItemsTable, productsTable, usersTable } from "@workspace/db";
import { eq, and, desc, sql } from "drizzle-orm";
import { authenticate, optionalAuth, requireAdmin, type AuthRequest } from "../middlewares/auth";
import { CreateOrderBody, UpdateOrderStatusBody } from "@workspace/api-zod";
import { DHOFAR_DELIVERY_AREAS, findDeliveryArea } from "../config/delivery-areas";
import crypto from "crypto";

const router = Router();

function generateTrackingId() {
  return "TS" + Date.now().toString(36).toUpperCase() + crypto.randomBytes(3).toString("hex").toUpperCase();
}

async function enrichOrder(order: typeof ordersTable.$inferSelect) {
  const items = await db.select().from(orderItemsTable).where(eq(orderItemsTable.orderId, order.id));
  const [user] = await db.select({ name: usersTable.name, email: usersTable.email }).from(usersTable).where(eq(usersTable.id, order.userId));
  return {
    ...order,
    total: Number(order.total),
    deliveryCharge: Number(order.deliveryCharge),
    userName: user?.name ?? null,
    userEmail: user?.email ?? null,
    items: items.map((i) => ({
      ...i,
      price: Number(i.price),
      subtotal: Number(i.price) * i.quantity,
    })),
    updatedAt: (order as Record<string, unknown>).updatedAt ?? order.createdAt,
  };
}

// List delivery areas
router.get("/delivery-areas", (_req, res) => {
  res.json(DHOFAR_DELIVERY_AREAS);
});

router.get("/orders", authenticate, async (req: AuthRequest, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    const offset = (page - 1) * limit;
    const status = req.query.status as string | undefined;
    const userId = req.query.userId ? Number(req.query.userId) : undefined;

    const isAdmin = req.userRole === "admin";
    const conditions = [];
    if (!isAdmin) conditions.push(eq(ordersTable.userId, req.userId!));
    else if (userId) conditions.push(eq(ordersTable.userId, userId));
    if (status) conditions.push(eq(ordersTable.status, status));

    const query = db.select().from(ordersTable);
    const orders = await (conditions.length > 0
      ? query.where(and(...conditions))
      : query
    ).orderBy(desc(ordersTable.createdAt)).limit(limit).offset(offset);

    const countQuery = db.select({ count: sql<number>`count(*)` }).from(ordersTable);
    const [{ count }] = await (conditions.length > 0
      ? countQuery.where(and(...conditions))
      : countQuery
    );

    const enriched = await Promise.all(orders.map(enrichOrder));
    res.json({ orders: enriched, total: Number(count), page, limit });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal error" });
  }
});

router.post("/orders", authenticate, async (req: AuthRequest, res) => {
  try {
    const body = CreateOrderBody.parse(req.body);
    const cartItems = await db.select().from(cartItemsTable).where(eq(cartItemsTable.userId, req.userId!));
    if (cartItems.length === 0) {
      res.status(400).json({ error: "Cart is empty" });
      return;
    }

    // Validate delivery area
    const area = findDeliveryArea(body.deliveryArea);
    if (!area) {
      res.status(400).json({ error: "Invalid delivery area. Only Dhofar Governorate wilayats are accepted." });
      return;
    }

    const deliveryChargeOmr = area.deliveryChargeOmr;

    let subtotal = 0;
    const orderItemsData = await Promise.all(cartItems.map(async (ci) => {
      const [product] = await db.select().from(productsTable).where(eq(productsTable.id, ci.productId));
      const price = product ? Number(product.price) : 0;
      subtotal += price * ci.quantity;
      return {
        productId: ci.productId,
        productName: product?.name ?? "Unknown",
        productImage: product?.imageUrl ?? null,
        quantity: ci.quantity,
        price: String(price),
      };
    }));

    // For online payment, add delivery charge to total (in OMR)
    // For COD, delivery charge is tracked separately (paid before delivery)
    const total = body.paymentMethod === "online"
      ? subtotal + deliveryChargeOmr
      : subtotal;

    const trackingId = generateTrackingId();
    const [order] = await db.insert(ordersTable).values({
      userId: req.userId!,
      trackingId,
      status: "pending",
      total: String(total),
      deliveryCharge: String(deliveryChargeOmr),
      paymentMethod: body.paymentMethod,
      deliveryArea: area.wilayat,
      codDeliveryChargePaid: false,
      shippingAddress: body.shippingAddress,
      phone: body.phone,
      notes: body.notes,
    }).returning();

    await Promise.all(orderItemsData.map((item) =>
      db.insert(orderItemsTable).values({ ...item, orderId: order.id })
    ));

    await Promise.all(cartItems.map((ci) =>
      db.update(productsTable).set({ soldCount: sql`${productsTable.soldCount} + ${ci.quantity}` })
        .where(eq(productsTable.id, ci.productId))
    ));

    await db.delete(cartItemsTable).where(eq(cartItemsTable.userId, req.userId!));

    const enriched = await enrichOrder(order);
    res.status(201).json(enriched);
  } catch (err) {
    req.log.error(err);
    res.status(400).json({ error: "Order creation failed" });
  }
});

router.get("/orders/track/:trackingId", optionalAuth, async (req: AuthRequest, res) => {
  try {
    const tid = req.params.trackingId as string;
    const [order] = await db.select().from(ordersTable).where(eq(ordersTable.trackingId, tid));
    if (!order) { res.status(404).json({ error: "Order not found" }); return; }
    const enriched = await enrichOrder(order);
    res.json(enriched);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal error" });
  }
});

router.get("/orders/:id", authenticate, async (req: AuthRequest, res) => {
  try {
    const id = Number(req.params.id);
    const [order] = await db.select().from(ordersTable).where(eq(ordersTable.id, id));
    if (!order) { res.status(404).json({ error: "Not found" }); return; }
    if (req.userRole !== "admin" && order.userId !== req.userId) {
      res.status(403).json({ error: "Forbidden" });
      return;
    }
    const enriched = await enrichOrder(order);
    res.json(enriched);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal error" });
  }
});

router.patch("/orders/:id", authenticate, requireAdmin, async (req: AuthRequest, res) => {
  try {
    const id = Number(req.params.id);
    const body = UpdateOrderStatusBody.parse(req.body);
    const [order] = await db.update(ordersTable).set({ status: body.status }).where(eq(ordersTable.id, id)).returning();
    const enriched = await enrichOrder(order);
    res.json(enriched);
  } catch (err) {
    req.log.error(err);
    res.status(400).json({ error: "Update failed" });
  }
});

export default router;
