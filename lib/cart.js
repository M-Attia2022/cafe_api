import { q } from "@/lib/db";

// returns the user's cart (creates it if missing) with items and total
export async function getCart(uid) {
  await q("INSERT INTO carts(user_id) VALUES($1) ON CONFLICT (user_id) DO NOTHING", [uid]);
  const items = await q(
    `SELECT p.id AS product_id, p.name, p.price, p.image_url, ci.quantity, (p.price*ci.quantity) AS line_total
     FROM cart_items ci JOIN carts c ON c.id=ci.cart_id JOIN products p ON p.id=ci.product_id
     WHERE c.user_id=$1 ORDER BY ci.id`, [uid]);
  const total = items.reduce((s, i) => s + Number(i.line_total), 0);
  return { items, total };
}
