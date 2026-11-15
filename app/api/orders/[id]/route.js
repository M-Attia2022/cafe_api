export const dynamic = "force-dynamic";
import { q } from "@/lib/db";
import { HttpError, ok, route, userId } from "@/lib/http";

const STEPS = {
  pickup: ["pending", "preparing", "ready"],
  delivery: ["pending", "preparing", "ready", "on_the_way", "delivered"],
};

export const GET = route(async (req, ctx) => {
  const uid = await userId(req);
  const { id } = await ctx.params;
  const [o] = await q("SELECT * FROM orders WHERE id=$1 AND user_id=$2", [Number(id), uid]);
  if (!o) throw new HttpError(404, "Order not found");
  const items = await q("SELECT product_name,price,quantity FROM order_items WHERE order_id=$1", [o.id]);
  const steps = STEPS[o.order_type] ?? STEPS.pickup;
  // في الاستلام: delivered = العميل استلم، فكل المراحل تتحسب منتهية
  const idx = o.status === "delivered" ? steps.length - 1 : steps.indexOf(o.status);
  return ok({ ...o, items, steps: steps.map((s, i) => ({ step: s, done: idx >= i })) });
});