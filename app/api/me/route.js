export const dynamic = "force-dynamic";
import { z } from "zod";
import { q } from "@/lib/db";
import { ok, route, userId } from "@/lib/http";

const profile = async (id) =>
  (await q("SELECT id,name,email,phone FROM users WHERE id=$1", [id]))[0];

export const GET = route(async (req) => ok(await profile(await userId(req))));

export const PATCH = route(async (req) => {
  const id = await userId(req);
  const b = z.object({ name: z.string().min(2).max(80).optional(), phone: z.string().min(8).max(20).optional() })
    .parse(await req.json());
  await q("UPDATE users SET name=COALESCE($2,name), phone=COALESCE($3,phone) WHERE id=$1", [id, b.name ?? null, b.phone ?? null]);
  return ok(await profile(id));
});
