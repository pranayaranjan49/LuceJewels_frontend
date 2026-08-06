# Amara — Jewelry Storefront + Admin Dashboard (Frontend)

React 18 + Vite + Tailwind CSS + Framer Motion. Built against the `jewelry-backend`
API from the previous step — no other backend changes needed.

Design tokens (colors, type scale, spacing, radii, motion durations) are taken
directly from the supplied design system file and wired into `tailwind.config.js`.
One deliberate addition: a `gold` accent scale, since the source tokens had no
accent color at all and a jewelry site with zero gold reads as a mistake, not a
design choice. Everything else — surfaces, ink/text colors, radii, motion — is
exactly on-token.

---

## 1. Connect it to your backend

This is the only step that matters for "no errors":

```bash
cd jewelry-frontend
npm install
cp .env.example .env
```

Edit `.env`:
```
VITE_API_URL=http://localhost:5000/api
```
Point this at wherever `jewelry-backend` is running — local (`localhost:5000`)
or deployed (`https://your-api.onrender.com/api`).

```bash
npm run dev
```
Opens on `http://localhost:5173`.

**Before running the frontend**, make sure the backend is up and seeded:
```bash
# in jewelry-backend/
npm run dev
npm run seed
```
Without categories/products in the DB, the Home and Shop pages will render
correctly but empty (they handle empty states gracefully — this is not a bug).

### CORS
The backend's `CLIENT_URL` env var must match this frontend's origin, or every
API call will fail with a CORS error in the browser console. For local dev:
```
# jewelry-backend/.env
CLIENT_URL=http://localhost:5173
```
For production, set it to your deployed Vercel URL.

---

## 2. What's wired to what

| Frontend page | Backend endpoints used |
|---|---|
| `/` (Home) | `GET /categories`, `GET /products` |
| `/shop` | `GET /categories`, `GET /products?category=&search=&sort=&page=` |
| `/product/:id` | `GET /products/:id` |
| `/login` | `POST /auth/send-otp`, `POST /auth/verify-otp` |
| `/cart` | local state only (localStorage) — no backend call until checkout |
| `/checkout` | `POST /orders` |
| `/admin` (Overview) | `GET /products`, `GET /users`, `GET /orders`, `GET /products/low-stock` |
| `/admin/products` | full CRUD: `GET/POST/PUT/DELETE /products`, `PATCH /products/:id/stock` |
| `/admin/categories` | full CRUD: `GET/POST/PUT/DELETE /categories` |
| `/admin/orders` | `GET /orders`, `PATCH /orders/:id/status` |
| `/admin/users` | `GET /users`, `GET /users/:id` |
| `/admin/campaigns` | `POST /campaigns/send`, `GET /campaigns` |

Auth: JWT stored in `localStorage`, attached to every request via an axios
interceptor (`src/api/client.js`). A 401 response anywhere auto-logs the user
out. Admin-only routes are gated client-side by `<AdminRoute>` — the real
enforcement is still server-side (`authorize('admin')` in the backend), this
is just so non-admins never see the admin UI flash before redirect.

---

## 3. Getting admin access to test the dashboard

1. Run the backend seed script — creates an admin with the email in
   `ADMIN_EMAIL` (backend `.env`).
2. On the frontend, go to `/login`, sign in with that same email via OTP.
   Since the seeded admin is pre-verified, the OTP flow still works normally —
   you just won't be asked for name/phone again since the account exists.
3. You'll land as `role: admin` and see an **Admin** link in the navbar →
   `/admin`.

---

## 4. Project structure

```
jewelry-frontend/
├── src/
│   ├── api/            client.js (axios + interceptors), endpoints.js (every API call)
│   ├── context/         AuthContext, CartContext
│   ├── layouts/          MainLayout (storefront), AdminLayout (sidebar dashboard)
│   ├── components/
│   │   ├── shop/         Navbar, Footer, ProductCard, CategoryCard
│   │   └── ui/            Modal, Skeleton, Price, ProtectedRoute
│   ├── pages/            Home, Shop, ProductDetail, Login, Cart, Checkout, OrderSuccess, NotFound
│   └── pages/admin/      AdminOverview, AdminProducts, AdminCategories, AdminOrders, AdminUsers, AdminCampaigns
├── tailwind.config.js    design tokens from jweleryDesign.md
└── index.html
```

---

## 5. Common errors and fixes

| Symptom | Fix |
|---|---|
| Blank page, console shows CORS error | Set `CLIENT_URL` in backend `.env` to match frontend origin, restart backend |
| Products/categories never load | Backend not running, or `VITE_API_URL` wrong, or DB not seeded |
| Login OTP email never arrives | Check backend `SMTP_*` env vars — use a Gmail **App Password**, not your real password |
| Admin link never shows after login | The user's `role` in MongoDB is still `user` — only the seeded admin (or someone you manually flip to `admin` in Atlas) gets it |
| Image upload fails in admin | Backend `CLOUDINARY_*` env vars missing/wrong |
| "Insufficient stock" on checkout | Expected behavior — the backend re-checks stock in a transaction at order time, even if the product page showed stock a minute ago |

---

## 6. Deploy (for your live link)

```bash
npm run build      # outputs to dist/
```
Push to GitHub → Vercel → New Project → set env var `VITE_API_URL` to your
deployed backend URL → Deploy. Vercel auto-detects Vite.

Then go back to the backend's `CLIENT_URL` env var on Render and set it to
your new Vercel URL, redeploy the backend, and the whole thing is live.
