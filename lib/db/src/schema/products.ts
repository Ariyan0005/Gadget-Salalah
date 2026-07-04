import { pgTable, text, serial, timestamp, boolean, integer, numeric } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const productsTable = pgTable("products", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  price: numeric("price", { precision: 12, scale: 2 }).notNull(),
  originalPrice: numeric("original_price", { precision: 12, scale: 2 }),
  stock: integer("stock").notNull().default(0),
  imageUrl: text("image_url"),
  images: text("images"),
  categoryId: integer("category_id").notNull(),
  brand: text("brand"),
  sku: text("sku"),
  isFeatured: boolean("is_featured").notNull().default(false),
  isActive: boolean("is_active").notNull().default(true),
  soldCount: integer("sold_count").notNull().default(0),
  rating: numeric("rating", { precision: 3, scale: 2 }),
  reviewCount: integer("review_count").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertProductSchema = createInsertSchema(productsTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type Product = typeof productsTable.$inferSelect;
