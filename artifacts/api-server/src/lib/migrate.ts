import { pool } from "@workspace/db";
import { logger } from "./logger";

export async function runMigrations() {
  const client = await pool.connect();
  try {
    logger.info("Running database migrations...");
    await client.query(`
      CREATE TABLE IF NOT EXISTS "users" (
        "id" serial PRIMARY KEY NOT NULL,
        "name" text NOT NULL,
        "email" text NOT NULL,
        "password" text NOT NULL,
        "phone" text,
        "address" text,
        "role" text DEFAULT 'user' NOT NULL,
        "is_active" boolean DEFAULT true NOT NULL,
        "created_at" timestamp with time zone DEFAULT now() NOT NULL,
        "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
        CONSTRAINT "users_email_unique" UNIQUE("email")
      );

      CREATE TABLE IF NOT EXISTS "categories" (
        "id" serial PRIMARY KEY NOT NULL,
        "name" text NOT NULL,
        "slug" text NOT NULL,
        "description" text,
        "image_url" text,
        "created_at" timestamp with time zone DEFAULT now() NOT NULL,
        "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
        CONSTRAINT "categories_slug_unique" UNIQUE("slug")
      );

      CREATE TABLE IF NOT EXISTS "products" (
        "id" serial PRIMARY KEY NOT NULL,
        "name" text NOT NULL,
        "slug" text NOT NULL,
        "description" text,
        "price" numeric(12, 2) NOT NULL,
        "original_price" numeric(12, 2),
        "stock" integer DEFAULT 0 NOT NULL,
        "image_url" text,
        "images" text,
        "category_id" integer NOT NULL,
        "brand" text,
        "sku" text,
        "is_featured" boolean DEFAULT false NOT NULL,
        "is_active" boolean DEFAULT true NOT NULL,
        "sold_count" integer DEFAULT 0 NOT NULL,
        "rating" numeric(3, 2),
        "review_count" integer DEFAULT 0 NOT NULL,
        "created_at" timestamp with time zone DEFAULT now() NOT NULL,
        "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
        CONSTRAINT "products_slug_unique" UNIQUE("slug")
      );

      CREATE TABLE IF NOT EXISTS "cart_items" (
        "id" serial PRIMARY KEY NOT NULL,
        "user_id" integer NOT NULL,
        "product_id" integer NOT NULL,
        "quantity" integer DEFAULT 1 NOT NULL,
        "created_at" timestamp with time zone DEFAULT now() NOT NULL,
        "updated_at" timestamp with time zone DEFAULT now() NOT NULL
      );

      CREATE TABLE IF NOT EXISTS "order_items" (
        "id" serial PRIMARY KEY NOT NULL,
        "order_id" integer NOT NULL,
        "product_id" integer NOT NULL,
        "product_name" text NOT NULL,
        "product_image" text,
        "quantity" integer NOT NULL,
        "price" numeric(12, 2) NOT NULL,
        "created_at" timestamp with time zone DEFAULT now() NOT NULL
      );

      CREATE TABLE IF NOT EXISTS "orders" (
        "id" serial PRIMARY KEY NOT NULL,
        "user_id" integer NOT NULL,
        "tracking_id" text NOT NULL,
        "status" text DEFAULT 'pending' NOT NULL,
        "total" numeric(12, 2) NOT NULL,
        "delivery_charge" numeric(10, 3) DEFAULT '0' NOT NULL,
        "payment_method" text DEFAULT 'cod' NOT NULL,
        "delivery_area" text NOT NULL,
        "cod_delivery_charge_paid" boolean DEFAULT false NOT NULL,
        "shipping_address" text NOT NULL,
        "phone" text NOT NULL,
        "notes" text,
        "created_at" timestamp with time zone DEFAULT now() NOT NULL,
        "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
        CONSTRAINT "orders_tracking_id_unique" UNIQUE("tracking_id")
      );

      CREATE TABLE IF NOT EXISTS "banners" (
        "id" serial PRIMARY KEY NOT NULL,
        "title" text NOT NULL,
        "subtitle" text,
        "image_url" text NOT NULL,
        "link_url" text,
        "sort_order" integer DEFAULT 0 NOT NULL,
        "is_active" boolean DEFAULT true NOT NULL,
        "created_at" timestamp with time zone DEFAULT now() NOT NULL,
        "updated_at" timestamp with time zone DEFAULT now() NOT NULL
      );

      CREATE TABLE IF NOT EXISTS "product_variants" (
        "id" serial PRIMARY KEY NOT NULL,
        "product_id" integer NOT NULL REFERENCES "products"("id") ON DELETE CASCADE,
        "name" text NOT NULL,
        "value" text NOT NULL,
        "price_modifier" numeric(12, 2) NOT NULL DEFAULT '0',
        "stock" integer DEFAULT 0 NOT NULL,
        "sku" text,
        "is_default" boolean DEFAULT false NOT NULL,
        "created_at" timestamp with time zone DEFAULT now() NOT NULL,
        "updated_at" timestamp with time zone DEFAULT now() NOT NULL
      );
    `);
    logger.info("Migrations complete ✓");
  } catch (err) {
    logger.error({ err }, "Migration failed");
    throw err;
  } finally {
    client.release();
  }
}
