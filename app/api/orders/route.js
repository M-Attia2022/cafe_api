import { z } from "zod";
import { pool, q } from "@/lib/db";
import { HttpError, ok, route, userId } from "@/lib/http";

export const GET = route(async (req) => {
  const uid = await userId(req);
  return ok(await q(
    `SELECT id,status,total,created_at,
            (SELECT string_agg(quantity||'x '||product_name, ', ') FROM order_items WHERE order_id=orders.id) AS summary
     FROM orders WHERE user_id=$1 ORDER BY id DESC`, [uid]));
});

// Checkout: turns the current cart into an order
export const POST = route(async (req) => {
  const uid = await userId(req);
  const b = z.object({
    address: z.string().min(3).max(250),
    payment_method: z.enum(["cash", "card"]).default("cash"),
  }).parse(await req.json());

  const c = await pool.connect();
  try {
    await c.query("BEGIN");
    const items = (await c.query(
      `SELECT p.id,p.name,p.price,ci.quantity FROM cart_items ci
       JOIN carts c ON c.id=ci.cart_id JOIN products p ON p.id=ci.product_id WHERE c.user_id=$1`, [uid])).rows;
    if (!items.length) throw new HttpError(400, "Cart is empty");
    const total = items.reduce((s, i) => s + Number(i.price) * i.quantity, 0);
    const o = (await c.query(
      "INSERT INTO orders(user_id,total,address,payment_method) VALUES($1,$2,$3,$4) RETURNING id,status,total",
      [uid, total, b.address, b.payment_method])).rows[0];
    for (const i of items)
      await c.query("INSERT INTO order_items(order_id,product_id,product_name,price,quantity) VALUES($1,$2,$3,$4,$5)",
        [o.id, i.id, i.name, i.price, i.quantity]);
    await c.query("DELETE FROM cart_items WHERE cart_id=(SELECT id FROM carts WHERE user_id=$1)", [uid]);
    await c.query("COMMIT");
    return ok(o, 201);
  } catch (e) {
    await c.query("ROLLBACK");
    throw e;
  } finally {
    c.release();
  }
});
