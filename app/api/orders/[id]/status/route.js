import { z } from "zod";
import { q } from "@/lib/db";
import { HttpError, ok, requireAdmin, route } from "@/lib/http";

// الكافيه: PATCH مع Header x-admin-key
export const PATCH = route(async (req, ctx) => {
  requireAdmin(req);
  const { id } = await ctx.params;
  const { status } = z.object({
    status: z.enum(["pending", "preparing", "ready", "on_the_way", "delivered", "cancelled"]),
  }).parse(await req.json());
  const [cur] = await q("SELECT order_type FROM orders WHERE id=$1", [Number(id)]);
  if (!cur) throw new HttpError(404, "Order not found");
  if (status === "on_the_way" && cur.order_type !== "delivery")
    throw new HttpError(400, "on_the_way is only for delivery orders");
  const [o] = await q("UPDATE orders SET status=$2 WHERE id=$1 RETURNING id,status,order_type", [Number(id), status]);
  return ok(o);
});