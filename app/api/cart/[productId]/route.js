import { z } from "zod";
import { q } from "@/lib/db";
import { getCart } from "@/lib/cart";
import { ok, route, userId } from "@/lib/http";

const cartOf = "(SELECT id FROM carts WHERE user_id=$1)";

export const PATCH = route(async (req, ctx) => {
  const uid = await userId(req);
  const { productId } = await ctx.params;
  const { quantity } = z.object({ quantity: z.number().int().min(1).max(50) }).parse(await req.json());
  await q(`UPDATE cart_items SET quantity=$3 WHERE cart_id=${cartOf} AND product_id=$2`, [uid, Number(productId), quantity]);
  return ok(await getCart(uid));
});

export const DELETE = route(async (req, ctx) => {
  const uid = await userId(req);
  const { productId } = await ctx.params;
  await q(`DELETE FROM cart_items WHERE cart_id=${cartOf} AND product_id=$2`, [uid, Number(productId)]);
  return ok(await getCart(uid));
});
