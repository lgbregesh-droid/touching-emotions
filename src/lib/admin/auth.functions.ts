import { createServerFn, createMiddleware } from "@tanstack/react-start";
import { z } from "zod";
import { createHmac, timingSafeEqual } from "crypto";

const TTL_MS = 24 * 60 * 60 * 1000;

function sign(exp: number, password: string): string {
  return createHmac("sha256", password).update(String(exp)).digest("hex");
}

export function makeToken(password: string): string {
  const exp = Date.now() + TTL_MS;
  return `${exp}.${sign(exp, password)}`;
}

export function verifyToken(token: string | undefined | null): boolean {
  if (!token) return false;
  const password = process.env.ADMIN_PASSWORD;
  if (!password) return false;
  const [expStr, sig] = token.split(".");
  const exp = Number(expStr);
  if (!exp || !sig || Date.now() > exp) return false;
  const expected = sign(exp, password);
  try {
    const a = Buffer.from(sig, "hex");
    const b = Buffer.from(expected, "hex");
    return a.length === b.length && timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

export const adminLogin = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    z.object({ password: z.string().min(1).max(200) }).parse(input),
  )
  .handler(async ({ data }) => {
    const real = process.env.ADMIN_PASSWORD;
    if (!real) throw new Error("ADMIN_PASSWORD not configured");
    if (data.password !== real) throw new Error("סיסמה שגויה");
    return { token: makeToken(real) };
  });

export const requireAdmin = createMiddleware({ type: "function" })
  .inputValidator((input: unknown) => {
    const parsed = z
      .object({ token: z.string().min(1) })
      .passthrough()
      .parse(input);
    return parsed;
  })
  .server(async ({ next, data }) => {
    if (!verifyToken((data as { token: string }).token)) {
      throw new Error("Unauthorized");
    }
    return next();
  });
