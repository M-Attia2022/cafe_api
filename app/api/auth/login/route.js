import { z } from "zod";
import bcrypt from "bcryptjs";
import { q } from "@/lib/db";
import { HttpError, ok, route } from "@/lib/http";
import { issueTokens } from "@/lib/tokens";

export const POST = route(async (req) => {
  const b = z.object({
    email: z.string().email().nullish(),
    phone: z.string().nullish(),
    password: z.string().min(1),
  }).refine((v) => v.email || v.phone, "email or phone required").parse(await req.json());
  const [u] = b.email
    ? await q("SELECT * FROM users WHERE email=lower($1)", [b.email])
    : await q("SELECT * FROM users WHERE phone=$1", [b.phone]);
  if (!u || !(await bcrypt.compare(b.password, u.password_hash)))
    throw new HttpError(401, "Wrong credentials");
  return ok({ user: { id: u.id, name: u.name, email: u.email, phone: u.phone }, ...(await issueTokens(u.id)) });
});