# HOMENEST — Modern Home Accessories Store

A full-stack e-commerce website for home accessories, built with Next.js 14,
Prisma + PostgreSQL (Neon), Tailwind CSS and UploadThing cloud storage.
Customers browse products in multiple colors, or send their own idea via
**Make It Yours** custom orders; admins manage everything from a secure panel.

## Quick start (local)

1. Create a free database at [neon.tech](https://neon.tech) → copy the
   **pooled** connection string (`...-pooler....neon.tech/neondb?sslmode=require`)
2. Paste it into `.env` as `DATABASE_URL`, fill `AUTH_SECRET`,
   `ADMIN_EMAIL`, `ADMIN_PASSWORD` and your `UPLOADTHING_TOKEN`
   ([uploadthing.com](https://uploadthing.com) → dashboard → API keys)
3. ```powershell
   npm install
   npm run setup     # creates tables on Neon + seeds 21 products + admin user
   npm run dev       # http://localhost:3000
   ```

Offline tinkering without any cloud DB? `npm run db:local` switches Prisma to
SQLite, then set `DATABASE_URL="file:./dev.db"`. Switch back with `npm run db:cloud`.

## Deploy to Vercel (free)

1. Push this folder to a GitHub repo
2. [vercel.com](https://vercel.com) → Add New Project → import the repo
3. Environment Variables (copy values from `.env`):
   `DATABASE_URL`, `AUTH_SECRET`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`,
   `UPLOADTHING_TOKEN`
4. Deploy — HTTPS is automatic

### Adding your own domain later (no code changes)

Vercel Dashboard → your project → **Settings → Domains** → *Add* → follow the
DNS instructions (A record / nameservers) shown there. SSL certificate is
issued automatically. Nothing in the codebase references a domain name.

## Quick start

```powershell
npm install        # already done
npm run setup      # creates the database + seeds 21 products + admin user (already done)
npm run dev        # start dev server on http://localhost:3000
```

Production mode (currently running on port 3100):

```powershell
npm run build
npm start
```

## Admin panel

- URL: `/admin/login` (or click "Admin Panel" in the footer)
- Email: `admin@maison.local`
- Password: `Admin@12345`

> Change these in `.env` (`ADMIN_EMAIL`, `ADMIN_PASSWORD`) and re-run
> `npm run setup` to reset the admin account with a new password.

### What you can do

| Area | Features |
| --- | --- |
| Dashboard | Revenue, order counts, low-stock alerts, new custom-request badge |
| Products | Create / edit / delete, live color editor (name + hex picker), quick palette, stock & pricing, featured/published toggles, image URL or auto-generated art |
| Categories | Add / delete collections, protected when they still contain products |
| Orders | Filter by status, expand full details, update status (Pending → Confirmed → Shipped → Delivered / Cancelled) |
| Custom orders | Customer ideas with photo, description & colors — review image, update pipeline status (New → Reviewing → Quoted → In Production → Completed / Rejected) |

## Make It Yours (custom orders)

Customers visit `/custom`, upload an inspiration photo (drag & drop), describe
the piece, pick up to 6 colors (palette + custom color picker) and leave their
contact info. The request lands in **Admin → Custom Orders** with the photo,
color chips and a reference number like `HN-C-XXXXX`.

Upload security: MIME whitelist + magic-byte sniffing (fake images rejected),
4 MB limit (Vercel serverless body limit), random server-side filenames,
rate-limited to 5 submissions/min/IP, photos stored on UploadThing's CDN and
removed when an admin deletes the request.

## Storefront

- **Home** — hero, category tiles, featured products, custom-order banner, new arrivals
- **Shop** — filter by category, color, price range; search; sorting; pagination
- **Product page** — color swatch selector (preview art re-tints per color),
  quantity stepper, stock indicator, related products
- **Cart** — quantity controls, free-shipping progress, localStorage persistence
- **Checkout** — cash-on-delivery form; prices are re-validated server-side
- **Order page** — receipt at `/order/{number}`
- **Make It Yours** — custom order form at `/custom`

Products without a photo get elegant generated SVG art based on their colors.

## Security measures

- Passwords hashed with bcrypt (cost 12); never stored in plain text
- Sessions = signed JWT (HS256, `jose`) in **HttpOnly, SameSite=Lax, Secure**
  cookies — not readable by JavaScript
- `middleware.ts` guards every `/admin` route and admin API (401/redirect)
- Login rate-limiting: max 5 attempts/min/IP; orders limited to 10/min/IP
- All input validated with **Zod** schemas server-side (types, lengths,
  hex format, quantities ≤ 99…)
- **SQL injection safe**: all queries via Prisma parameterized ORM;
  Neon Postgres adds TLS encryption in transit + encryption at rest
- Checkout recalculates totals from DB prices — client-sent prices are ignored;
  stock is checked and decremented atomically inside a transaction
- Generic login errors (no user enumeration); constant-shape responses
- Origin-host check on mutating admin requests (CSRF hardening)
- Hardened response headers: X-Frame-Options DENY, nosniff,
  Referrer-Policy, Permissions-Policy
- React auto-escaping everywhere (XSS-safe rendering)
- Vercel platform: automatic HTTPS, DDoS protection, no server to patch

## Project structure

```
prisma/schema.prisma      # Category, Product, ProductColor, Order, OrderItem, CustomRequest, Admin
scripts/seed.mjs          # seeds categories, 21 products w/ colors, admin user
src/lib/                  # db client, JWT, session, validators, rate-limit, art generator
src/components/           # cart context, logo, header, footer, product card
src/app/(site)/           # storefront (home, shop, product, cart, checkout, order, custom…)
src/app/admin/            # dashboard + products + categories + orders + custom + login
src/app/api/orders        # public checkout endpoint
src/app/api/custom-requests  # public "Make It Yours" upload endpoint → UploadThing
src/app/api/admin/        # auth + CRUD endpoints (protected)
src/middleware.ts         # auth guard for /admin and /api/admin
```

## Notes

- Production database: **Neon Postgres** (free tier). To reset its data:
  `npm run setup` (recreates tables + seed data).
- To reset the admin password: change `ADMIN_PASSWORD` in `.env`, then run
  `npm run setup` again.
- Rate limiting is in-memory per server instance — fine to start; swap in
  Upstash Redis later if you need it shared across regions.
