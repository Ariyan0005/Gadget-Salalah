---
name: TechShop project gotchas
description: Sharp edges discovered while building the TechShop e-commerce app — lib rebuild order, import paths, bcrypt version, banner images.
---

## Rules

1. **Lib rebuild before API server typecheck** — after any `lib/db/src/schema/` change run `pnpm run typecheck:libs` first; otherwise old `.d.ts` declarations are used and TS reports "not exported" errors even for symbols that exist in the source.

**Why:** `lib/db` is a composite lib that emits declarations; the api-server leaf package reads those declarations, not the source.

**How to apply:** Always run `pnpm run typecheck:libs` → then `pnpm --filter @workspace/api-server run typecheck`.

2. **No deep imports from api-client-react** — `@workspace/api-client-react/src/custom-fetch` is not exposed via `exports` in package.json. Use the barrel: `import { setAuthTokenGetter } from "@workspace/api-client-react"`.

**Why:** The package.json `exports` map only exposes `.` → `./src/index.ts`.

3. **bcryptjs version is 3.0.3** — module path is `.pnpm/bcryptjs@3.0.3/node_modules/bcryptjs`. Seed scripts using version-pinned paths must use 3.0.3, not 2.x.

4. **Banner imageUrl must not have embedded text** — `placehold.co?text=...` causes duplicate text in the Embla slider because the overlay also renders the banner title. Use solid-color placeholder images (`placehold.co/1200x500/color/color?text=+`) or real images.

5. **Admin stats SQL uses Drizzle column refs not raw table aliases** — raw SQL like `oi.price` won't work in Drizzle's `.leftJoin(orderItemsTable, ...)` queries. Use `${orderItemsTable.price}` interpolation instead.

**Why:** Drizzle generates its own internal alias names; user-supplied aliases like `oi` are not recognized.

6. **Admin credentials**: `admin@techshop.com` / `admin123`, demo user: `user@techshop.com` / `admin123`. Password hash must be regenerated if DB is reset (use bcryptjs 3.0.3).

7. **Watch for nested duplicate dirs after a repo merge** — a prior merge (folding `shop_real` into `shop`) left stray nested dirs like `src/src` and `public/public` containing an *older, differently-branded* copy of files (old favicon, unused hero images) that vite never serves. Always check for `<dir>/<dir>` duplication after merging artifact sources and delete the dead copy.

8. **Radix Sheet's close (X) button is `absolute right-4 top-4` relative to `SheetContent`, not the header** — if `SheetContent` has `p-0` and `SheetHeader` has its own padding (e.g. a custom title/logo row), the X button visually overlaps the header content unless the header reserves right-side space (e.g. `pr-12`) and long titles get `truncate`.
