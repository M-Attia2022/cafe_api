import { z } from "zod";
import { ok, route } from "@/lib/http";
import { revokeRefresh } from "@/lib/tokens";

export const POST = route(async (req) => {
  const { refresh_token } = z.object({ refresh_token: z.string().min(20) }).parse(await req.json());
  await revokeRefresh(refresh_token);
  return ok({ loggedOut: true });
});