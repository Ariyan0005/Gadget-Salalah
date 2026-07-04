import { Router } from "express";
import { db, usersTable, productsTable, ordersTable, orderItemsTable, categoriesTable } from "@workspace/db";
import { eq, desc, gte, sql, and } from "drizzle-orm";
import { authenticate, requireAdmin, type AuthRequest } from "../middlewares/auth";

const router = Router();

router.get("/admin/stats", authenticate, requireAdmin, async (req: AuthRequest, res) => {
  try {
    const [{ totalUsers }] = await db.select({ totalUsers: sql<number>`count(*)` }).from(usersTable);
    const [{ totalProducts }] = await db.select({ totalProducts: sql<number>`count(*)` }).from(productsTable);
    const [{ totalOrders }] = await db.select({ totalOrders: sql<number>`count(*)` }).from(ordersTable);
    const [{ totalRevenue }] = await db.select({ totalRevenue: sql<number>`coalesce(sum(total::numeric), 0)` }).from(ordersTable);
    const [{ pendingOrders }] = await db.select({ pendingOrders: sql<number>`count(*)` }).from(ordersTable).where(eq(ordersTable.status, "pending"));
    const [{ lowStockCount }] = await db.select({ lowStockCount: sql<number>`count(*)` }).from(productsTable).where(sql`${productsTable.stock} < 10`);

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const [{ todayOrders }] = await db.select({ todayOrders: sql<number>`count(*)` }).from(ordersTable).where(gte(ordersTable.createdAt, todayStart));
    const [{ todayRevenue }] = await db.select({ todayRevenue: sql<number>`coalesce(sum(total::numeric), 0)` }).from(ordersTable).where(gte(ordersTable.createdAt, todayStart));

    const statusRows = await db.select({
      status: ordersTable.status,
      count: sql<number>`count(*)`,
    }).from(ordersTable).groupBy(ordersTable.status);

    const catRevRows = await db.select({
      categoryName: categoriesTable.name,
      revenue: sql<number>`coalesce(sum(${orderItemsTable.price}::numeric * ${orderItemsTable.quantity}), 0)`,
      orderCount: sql<number>`count(distinct ${orderItemsTable.orderId})`,
    })
      .from(categoriesTable)
      .leftJoin(productsTable, eq(productsTable.categoryId, categoriesTable.id))
      .leftJoin(orderItemsTable, eq(orderItemsTable.productId, productsTable.id))
      .groupBy(categoriesTable.name)
      .orderBy(desc(sql`coalesce(sum(${orderItemsTable.price}::numeric * ${orderItemsTable.quantity}), 0)`))
      .limit(10);

    res.json({
      totalUsers: Number(totalUsers),
      totalProducts: Number(totalProducts),
      totalOrders: Number(totalOrders),
      totalRevenue: Number(totalRevenue),
      pendingOrders: Number(pendingOrders),
      lowStockCount: Number(lowStockCount),
      todayOrders: Number(todayOrders),
      todayRevenue: Number(todayRevenue),
      ordersByStatus: statusRows.map((r) => ({ status: r.status, count: Number(r.count) })),
      revenueByCategory: catRevRows.map((r) => ({
        categoryName: r.categoryName,
        revenue: Number(r.revenue),
        orderCount: Number(r.orderCount),
      })),
    });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal error" });
  }
});

router.get("/admin/low-stock", authenticate, requireAdmin, async (req: AuthRequest, res) => {
  try {
    const threshold = Number(req.query.threshold) || 10;
    const products = await db.select().from(productsTable)
      .where(and(sql`${productsTable.stock} < ${threshold}`, eq(productsTable.isActive, true)))
      .orderBy(productsTable.stock);
    res.json(products.map((p) => ({
      ...p,
      price: Number(p.price),
      originalPrice: p.originalPrice != null ? Number(p.originalPrice) : null,
      discountPercent: null,
      rating: p.rating != null ? Number(p.rating) : null,
      categoryName: null,
    })));
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal error" });
  }
});

router.get("/admin/recent-orders", authenticate, requireAdmin, async (req: AuthRequest, res) => {
  try {
    const orders = await db.select().from(ordersTable).orderBy(desc(ordersTable.createdAt)).limit(10);
    const enriched = await Promise.all(orders.map(async (order) => {
      const items = await db.select().from(orderItemsTable).where(eq(orderItemsTable.orderId, order.id));
      const [user] = await db.select({ name: usersTable.name, email: usersTable.email }).from(usersTable).where(eq(usersTable.id, order.userId));
      return {
        ...order,
        total: Number(order.total),
        userName: user?.name ?? null,
        userEmail: user?.email ?? null,
        updatedAt: order.createdAt,
        items: items.map((i) => ({ ...i, price: Number(i.price), subtotal: Number(i.price) * i.quantity })),
      };
    }));
    res.json(enriched);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal error" });
  }
});

export default router;
