import { NextResponse } from "next/server";
import { jwtVerify, SignJWT } from "jose";
import { ZodError } from "zod";

export class HttpError extends Error {
  constructor(status, message) { super(message); this.status = status; }
}
export const ok = (data, status = 200) => NextResponse.json(data, { status });

const secret = () => new TextEncoder().encode(process.env.JWT_SECRET);
export const signToken = (id) =>
  new SignJWT({}).setSubject(String(id)).setProtectedHeader({ alg: "HS256" }).setExpirationTime("1h").sign(secret());

export async function userId(req) {
  const token = (req.headers.get("authorization") || "").replace(/^Bearer /, "");
  if (!token) throw new HttpError(401, "Unauthorized");
  try {
    const { payload } = await jwtVerify(token, secret());
    return Number(payload.sub);
  } catch {
    throw new HttpError(401, "Invalid or expired token");
  }
}

export function requireAdmin(req) {
  if (!process.env.ADMIN_KEY || req.headers.get("x-admin-key") !== process.env.ADMIN_KEY)
    throw new HttpError(403, "Admin only");
}

export const route = (fn) => async (req, ctx) => {
  try {
    return await fn(req, ctx);
  } catch (e) {
    if (e instanceof ZodError) return ok({ error: "Validation failed", details: e.issues }, 400);
    if (e instanceof HttpError) return ok({ error: e.message }, e.status);
    if (e?.code === "23505") return ok({ error: "Already exists" }, 409);
    console.error(e);
    return ok({ error: "Server error" }, 500);
  }
};

export const tier = (points) => (points >= 1000 ? "Gold" : points >= 300 ? "Silver" : "Bronze");
