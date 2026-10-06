# Cafe API (Next.js + PostgreSQL)

## تشغيل محلي
1. `npm install`
2. انسخ `.env.example` إلى `.env.local` واملأ القيم (DATABASE_URL من Neon أو Supabase)
3. `DATABASE_URL="..." npm run db:setup` ← بيعمل الـ 8 جداول + بيانات تجريبية
4. `npm run dev` ← http://localhost:3000/api/products

## الرفع على Vercel
GitHub ← Vercel (Add New ← Project) ← Environment Variables: `DATABASE_URL`, `JWT_SECRET`, `ADMIN_KEY` ← Deploy.

## الـ Endpoints (المحمي يحتاج Header: `Authorization: Bearer <token>`)
| Method | Path | الشاشة |
|---|---|---|
| POST | /api/auth/register | Register |
| POST | /api/auth/login | Login |
| GET/PATCH | /api/me | Profile |
| GET | /api/categories | Home |
| GET | /api/products?category=&q=&featured=true | Home / Menu |
| GET | /api/products/:id | Product Details |
| GET/POST | /api/favorites ({product_id}) | Favorites |
| DELETE | /api/favorites/:productId | Favorites |
| GET | /api/cart | Cart |
| POST | /api/cart ({product_id, quantity}) | Add to cart |
| PATCH/DELETE | /api/cart/:productId | Cart |
| DELETE | /api/cart | Clear cart |
| POST | /api/orders ({address, payment_method}) | Checkout (بيحوّل السلة لطلب) |
| GET | /api/orders | Orders |
| GET | /api/orders/:id | Track Order |
| PATCH | /api/orders/:id/status | الكافيه (Header `x-admin-key`) |
