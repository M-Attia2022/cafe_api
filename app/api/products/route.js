import { q } from "@/lib/db";
import { ok, route } from "@/lib/http";

// GET /api/products?category=1&q=latte&featured=true
export const GET = route(async (req) => {
  const sp = new URL(req.url).searchParams;
  return ok(await q(
    `SELECT id,category_id,name,description,price,image_url,is_featured FROM products
     WHERE ($1::int IS NULL OR category_id=$1)
       AND ($2::text IS NULL OR name ILIKE '%'||$2||'%')
       AND ($3::bool IS NULL OR is_featured=$3)
     ORDER BY id`,
    [sp.get("category") ? Number(sp.get("category")) : null, sp.get("q"), sp.get("featured") ? sp.get("featured") === "true" : null]));
});
