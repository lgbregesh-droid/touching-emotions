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
