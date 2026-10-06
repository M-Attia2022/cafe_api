export const dynamic = "force-dynamic";
import { z } from "zod";
import { q } from "@/lib/db";
import { ok, route, userId } from "@/lib/http";

export const GET = route(async (req) => {
  const id = await userId(req);
  return ok(await q(
    `SELECT p.id,p.name,p.price,p.image_url FROM favorites f
     JOIN products p ON p.id=f.product_id WHERE f.user_id=$1 ORDER BY f.created_at DESC`, [id]));
});

export const POST = route(async (req) => {
  const id = await userId(req);
  const { product_id } = z.object({ product_id: z.number().int() }).parse(await req.json());
  await q("INSERT INTO favorites(user_id,product_id) VALUES($1,$2) ON CONFLICT DO NOTHING", [id, product_id]);
  return ok({ favorited: true }, 201);
});
