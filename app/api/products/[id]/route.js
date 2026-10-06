export const dynamic = "force-dynamic";
import { q } from "@/lib/db";
import { HttpError, ok, route } from "@/lib/http";

export const GET = route(async (_req, ctx) => {
  const { id } = await ctx.params;
  const [p] = await q("SELECT * FROM products WHERE id=$1", [Number(id)]);
  if (!p) throw new HttpError(404, "Product not found");
  return ok(p);
});
