import { createServerFn, createMiddleware } from "@tanstack/react-start";
import { z } from "zod";

export const adminLogin = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    z.object({ password: z.string().min(1).max(200) }).parse(input),
  )
  .handler(async ({ data }) => {
    const { makeToken } = await import("./auth.server");
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
    const { verifyToken } = await import("./auth.server");
    if (!verifyToken((data as { token: string }).token)) {
      throw new Error("Unauthorized");
    }
    return next();
  });
