import { Router } from "express";
import { db, productsTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router = Router();
const SITE_URL = "https://gadgetsalalah.com";

function escapeXml(value: string) {
  const entities: Record<string, string> = {
    "<": "&lt;",
    ">": "&gt;",
    "&": "&amp;",
    "'": "&apos;",
    "\"": "&quot;",
  };
  return value.replace(/[<>&'"]/g, (character) => entities[character] || character);
}

router.get("/sitemap.xml", async (_req, res) => {
  try {
    const products = await db
      .select({ slug: productsTable.slug, updatedAt: productsTable.updatedAt })
      .from(productsTable)
      .where(eq(productsTable.isActive, true));

    const publicRoutes = ["/", "/products", "/categories", "/about", "/contact", "/mobile-service", "/spare-parts", "/track", "/return-policy"];
    const urls = [
      ...publicRoutes.map((path) => `<url><loc>${SITE_URL}${path}</loc><changefreq>weekly</changefreq></url>`),
      ...products.map((product) => {
        const lastmod = product.updatedAt ? `<lastmod>${new Date(product.updatedAt).toISOString()}</lastmod>` : "";
        return `<url><loc>${SITE_URL}/products/${escapeXml(product.slug)}</loc>${lastmod}<changefreq>daily</changefreq><priority>0.8</priority></url>`;
      }),
    ];

    res.type("application/xml").send(
      `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls.join("")}</urlset>`,
    );
  } catch (error) {
    res.status(500).type("application/xml").send(
      `<?xml version="1.0" encoding="UTF-8"?><error>Sitemap unavailable</error>`,
    );
  }
});

export default router;