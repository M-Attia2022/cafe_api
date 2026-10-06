import { z } from "zod";
import { q } from "@/lib/db";
import { getCart } from "@/lib/cart";
import { ok, route, userId } from "@/lib/http";

export const GET = route(async (req) => ok(await getCart(await userId(req))));

// add a product (if it's already in the cart, quantity is increased)
export const POST = route(async (req) => {
  const uid = await userId(req);
  const b = z.object({ product_id: z.number().int(), quantity: z.number().int().min(1).max(50).default(1) })
    .parse(await req.json());
  await q("INSERT INTO carts(user_id) VALUES($1) ON CONFLICT (user_id) DO NOTHING", [uid]);
  await q(
    `INSERT INTO cart_items(cart_id,product_id,quantity)
     VALUES((SELECT id FROM carts WHERE user_id=$1),$2,$3)
     ON CONFLICT (cart_id,product_id) DO UPDATE SET quantity = cart_items.quantity + EXCLUDED.quantity`,
    [uid, b.product_id, b.quantity]);
  return ok(await getCart(uid), 201);
});

// empty the cart
export const DELETE = route(async (req) => {
  const uid = await userId(req);
  await q("DELETE FROM cart_items WHERE cart_id=(SELECT id FROM carts WHERE user_id=$1)", [uid]);
  return ok(await getCart(uid));
});
