import { Router } from "express";
import { db, categoriesTable, productsTable, bannersTable } from "@workspace/db";
import { authenticate, requireAdmin, type AuthRequest } from "../middlewares/auth";
import { sql } from "drizzle-orm";

const router = Router();

// POST /api/admin/seed — insert demo data (admin only, idempotent)
router.post("/admin/seed", authenticate, requireAdmin, async (req: AuthRequest, res) => {
  try {
    // 1. Categories
    const catRows = await db.insert(categoriesTable).values([
      { name: "Smartphones",   slug: "smartphones",   description: "Latest mobile phones" },
      { name: "Laptops",       slug: "laptops",       description: "Laptops & notebooks" },
      { name: "Accessories",   slug: "accessories",   description: "Cables, cases & more" },
      { name: "Tablets",       slug: "tablets",       description: "Tablets & iPads" },
      { name: "Audio",         slug: "audio",         description: "Earphones & speakers" },
      { name: "Smart Watches", slug: "smart-watches", description: "Wearables & smart watches" },
    ]).onConflictDoNothing().returning();

    // Build category ID map from DB
    const allCats = await db.select().from(categoriesTable);
    const catMap: Record<string, number> = {};
    for (const c of allCats) catMap[c.slug] = c.id;

    // 2. Products (idempotent by slug)
    const demoProducts = [
      { name: "iPhone 15 Pro Max 256GB",  slug: "iphone-15-pro-max", price: "485.000", originalPrice: "520.000", stock: 15, categoryId: catMap["smartphones"],   brand: "Apple",   isFeatured: true,  description: "Apple's latest flagship with A17 Pro chip, titanium design, and 48MP camera system.", imageUrl: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=600&q=80", sku: "APL-IP15PM-256" },
      { name: "Samsung Galaxy S24 Ultra",  slug: "samsung-s24-ultra", price: "459.000", originalPrice: "499.000", stock: 12, categoryId: catMap["smartphones"],   brand: "Samsung", isFeatured: true,  description: "Samsung's ultimate powerhouse with built-in S Pen and 200MP camera.", imageUrl: "https://images.unsplash.com/photo-1706741558207-082eb6090ca8?w=600&q=80", sku: "SAM-S24U-512" },
      { name: "MacBook Air M3 13\" 8GB",   slug: "macbook-air-m3",    price: "515.000", originalPrice: "560.000", stock: 8,  categoryId: catMap["laptops"],       brand: "Apple",   isFeatured: true,  description: "Ultra-thin laptop with Apple M3 chip, all-day battery life and Liquid Retina display.", imageUrl: "https://images.unsplash.com/photo-1611186871525-9c4f4f2ee60e?w=600&q=80", sku: "APL-MBA-M3-8" },
      { name: "AirPods Pro 2nd Gen",       slug: "airpods-pro-2",     price: "89.000",  originalPrice: "110.000", stock: 30, categoryId: catMap["audio"],         brand: "Apple",   isFeatured: true,  description: "Active noise cancellation, Adaptive Transparency, and Personalized Spatial Audio.", imageUrl: "https://images.unsplash.com/photo-1603351154351-5e2d0600bb77?w=600&q=80", sku: "APL-APP2" },
      { name: "Apple Watch Series 9 45mm", slug: "apple-watch-s9",    price: "195.000", originalPrice: "230.000", stock: 20, categoryId: catMap["smart-watches"], brand: "Apple",   isFeatured: false, description: "Faster chip, brighter always-on display, Double Tap gesture. Carbon neutral.", imageUrl: "https://images.unsplash.com/photo-1696433883399-99dbc5884b9d?w=600&q=80", sku: "APL-AWS9-45" },
      { name: "iPad Air M2 11\" 256GB",    slug: "ipad-air-m2",       price: "285.000", originalPrice: "320.000", stock: 10, categoryId: catMap["tablets"],       brand: "Apple",   isFeatured: false, description: "Supercharged by M2 chip with Apple Pencil Pro support and landscape front camera.", imageUrl: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=600&q=80", sku: "APL-IPA-M2-256" },
      { name: "Samsung Galaxy Buds2 Pro",  slug: "galaxy-buds2-pro",  price: "49.000",  originalPrice: "69.000",  stock: 25, categoryId: catMap["audio"],         brand: "Samsung", isFeatured: false, description: "Hi-Fi 24bit audio, intelligent ANC, and 360 Audio for immersive sound.", imageUrl: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600&q=80", sku: "SAM-GB2P" },
      { name: "Anker USB-C Hub 7-in-1",   slug: "anker-usbc-hub",    price: "22.500",  originalPrice: "29.000",  stock: 50, categoryId: catMap["accessories"],   brand: "Anker",   isFeatured: false, description: "HDMI 4K, 3x USB-A, SD/TF card reader, 100W PD charging in one compact hub.", imageUrl: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80", sku: "ANK-HUB7" },
    ];

    let inserted = 0;
    for (const p of demoProducts) {
      const existing = await db.select({ id: productsTable.id }).from(productsTable)
        .where(sql`${productsTable.slug} = ${p.slug}`).limit(1);
      if (existing.length === 0) {
        await db.insert(productsTable).values({ ...p, isActive: true, soldCount: 0, rating: "4.5" } as any);
        inserted++;
      }
    }

    // 3. Banners
    const bannerRows = await db.insert(bannersTable).values([
      { title: "Latest iPhones in Stock",     subtitle: "iPhone 15 Pro Max — Titanium Design, A17 Pro Chip. Limited units available!", imageUrl: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=1200&q=85", linkUrl: "/products?brand=Apple",   sortOrder: 1, isActive: true },
      { title: "Samsung Galaxy S24 Ultra",    subtitle: "Built-in S Pen · 200MP Camera · Best Android 2024. Shop now in Salalah!",     imageUrl: "https://images.unsplash.com/photo-1706741558207-082eb6090ca8?w=1200&q=85", linkUrl: "/products?brand=Samsung", sortOrder: 2, isActive: true },
      { title: "MacBook Air M3 — Now Here",   subtitle: "Apple Silicon power in the world's thinnest laptop. Free delivery across Dhofar.", imageUrl: "https://images.unsplash.com/photo-1611186871525-9c4f4f2ee60e?w=1200&q=85", linkUrl: "/products?categoryId=" + (catMap["laptops"] ?? ""), sortOrder: 3, isActive: true },
    ]).onConflictDoNothing().returning();

    res.json({ ok: true, message: "Seed complete", categories: catRows.length, products: inserted, banners: bannerRows.length });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
