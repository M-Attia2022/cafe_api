import { z } from "zod";
import { HttpError, ok, route } from "@/lib/http";
import { rotateRefresh } from "@/lib/tokens";

export const POST = route(async (req) => {
  const { refresh_token } = z.object({ refresh_token: z.string().min(20) }).parse(await req.json());
  const tokens = await rotateRefresh(refresh_token);
  if (!tokens) throw new HttpError(401, "Invalid or expired refresh token");
  return ok(tokens);
});
