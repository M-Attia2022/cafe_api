import { q } from "@/lib/db";
import { ok, route, userId } from "@/lib/http";

export const DELETE = route(async (req, ctx) => {
  const id = await userId(req);
  const { productId } = await ctx.params;
  await q("DELETE FROM favorites WHERE user_id=$1 AND product_id=$2", [id, Number(productId)]);
  return ok({ favorited: false });
});
