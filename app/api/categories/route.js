import { q } from "@/lib/db";
import { ok, route } from "@/lib/http";
export const GET = route(async () => ok(await q("SELECT id,name FROM categories ORDER BY id")));
