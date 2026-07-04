import { pgTable, text, serial, timestamp, boolean, integer, numeric } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { productsTable } from "./products";

export const productVariantsTable = pgTable("product_variants", {
  id: serial("id").primaryKey(),
  productId: integer("product_id").notNull().references(() => productsTable.id, { onDelete: "cascade" }),
  name: text("name").notNull(),   // e.g. "Color", "Storage"
  value: text("value").notNull(), // e.g. "Black", "128GB"
  priceModifier: numeric("price_modifier", { precision: 12, scale: 2 }).notNull().default("0"),
  stock: integer("stock").notNull().default(0),
  sku: text("sku"),
  isDefault: boolean("is_default").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertProductVariantSchema = createInsertSchema(productVariantsTable).omit({
  id: true, createdAt: true, updatedAt: true,
});
export type InsertProductVariant = z.infer<typeof insertProductVariantSchema>;
export type ProductVariant = typeof productVariantsTable.$inferSelect;
