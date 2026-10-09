import { z } from "zod";
import bcrypt from "bcryptjs";
import { q } from "@/lib/db";
import { ok, route } from "@/lib/http";
import { issueTokens } from "@/lib/tokens";

export const POST = route(async (req) => {
  const b = z.object({
    name: z.string().min(2).max(80),
    email: z.string().email(),
    password: z.string().min(8),
    phone: z.string().min(8).max(20).nullish().or(z.literal("")),
  }).parse(await req.json());
  const hash = await bcrypt.hash(b.password, 10);
  const [u] = await q(
    "INSERT INTO users(name,email,phone,password_hash) VALUES($1,lower($2),$3,$4) RETURNING id,name,email,phone",
    [b.name, b.email, b.phone || null, hash]
  );
  return ok({ user: u, ...(await issueTokens(u.id)) }, 201);
});
