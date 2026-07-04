# Gadget Salalah

Oman's premier e-commerce store for smartphones, gadgets, accessories, and electronics — with a full customer storefront and admin panel.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 8080)
- `pnpm --filter @workspace/shop run dev` — run the storefront (port 24349)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run typecheck:libs` — rebuild lib declarations (run after schema changes)
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string, `SESSION_SECRET` — JWT signing secret

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React 18 + Vite, Tailwind CSS, shadcn/ui, Embla Carousel, Recharts
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec → React Query hooks)
- Auth: JWT (`jsonwebtoken`) + bcrypt (`bcryptjs`)
- Build: esbuild (CJS bundle)

## Where things live

- `lib/db/src/schema/` — DB schema (users, categories, products, orders, banners)
- `lib/api-spec/openapi.yaml` — source-of-truth OpenAPI spec (40+ endpoints)
- `lib/api-client-react/src/generated/` — generated React Query hooks
- `lib/api-zod/src/generated/` — generated Zod schemas
- `artifacts/api-server/src/routes/` — Express route handlers
- `artifacts/api-server/src/middlewares/auth.ts` — JWT auth middleware
- `artifacts/shop/src/` — React frontend
- `artifacts/shop/src/pages/admin/` — admin panel pages
- `artifacts/shop/src/context/AuthContext.tsx` — auth state management

## Architecture decisions

- Contract-first API: OpenAPI spec written first, then hooks + Zod schemas generated via Orval — never hand-write fetch calls in components.
- JWT stored in localStorage; `setAuthTokenGetter` in `App.tsx` wires the token into every generated API call automatically via the custom fetch.
- Admin routes guarded by `requireAdmin` middleware server-side; `AdminRoute` component guards them client-side.
- BDT price format everywhere ("BDT 39,990") with strikethrough original price and orange discount badge.
- Embla Carousel used for hero banner slider with `loop: true` and NO autoplay — manual swipe only.

## Product

- **Customer storefront**: Home with hero slider, shop by category, featured/new/discounted product grids, product listing with filters (category, price range, sort), product detail page, cart, checkout, order history, order tracking by tracking ID.
- **Admin panel** (`/admin/*`): Dashboard with Recharts stats (orders by status, revenue by category), product management (CRUD + stock), category management, order status updates, user role/active management, banner management.
- **Auth**: Register, login, JWT-based sessions. Admin: `admin@techshop.com` / `admin123`. Demo user: `user@techshop.com` / `admin123`.

## User preferences

- Price format: "OMR X.XXX" (Omani Rial, 3 decimal places)
- Slider: Embla Carousel, manual swipe only, no autoplay
- Theme: Dark navy primary (#0f172a) with bright orange accent
- Admin sidebar layout for all `/admin/*` routes

## Gotchas

- After any `lib/db/src/schema/` change, run `pnpm run typecheck:libs` before typechecking `api-server` — otherwise the old declarations are used and you get "not exported" TS errors.
- `bcryptjs` version in this project is `3.0.3` (not 2.x) — module path is `/node_modules/.pnpm/bcryptjs@3.0.3/node_modules/bcryptjs`.
- Banner `imageUrl` values should NOT include text in the URL (e.g., avoid `placehold.co?text=...`) — the slider overlays its own text on top.
- JWT_SECRET falls back to `SESSION_SECRET` env var in `auth.ts`.
- Deep imports from `@workspace/api-client-react/src/custom-fetch` don't work — use the index: `import { setAuthTokenGetter } from "@workspace/api-client-react"`.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
