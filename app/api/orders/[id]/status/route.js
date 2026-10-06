import { z } from "zod";
import { q } from "@/lib/db";
import { HttpError, ok, requireAdmin, route } from "@/lib/http";

// Cafe side: PATCH with header x-admin-key
export const PATCH = route(async (req, ctx) => {
  requireAdmin(req);
  const { id } = await ctx.params;
  const { status } = z.object({ status: z.enum(["pending", "preparing", "on_the_way", "delivered", "cancelled"]) })
    .parse(await req.json());
  const [o] = await q("UPDATE orders SET status=$2 WHERE id=$1 RETURNING id,status", [Number(id), status]);
  if (!o) throw new HttpError(404, "Order not found");
  return ok(o);
});
