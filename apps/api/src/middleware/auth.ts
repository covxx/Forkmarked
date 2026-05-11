import { createMiddleware } from "hono/factory";
import { verifyToken } from "@clerk/backend";
import { userService } from "@forkmarked/db";
import type { AppEnv } from "../types.js";

export const requireAuth = createMiddleware<AppEnv>(async (c, next) => {
  const authHeader = c.req.header("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return c.json({ error: "Missing authorization header", code: "UNAUTHORIZED" }, 401);
  }

  const token = authHeader.replace("Bearer ", "");

  try {
    const result = await verifyToken(token, {
      secretKey: process.env.CLERK_SECRET_KEY!,
    });

    if ("error" in result) {
      return c.json({ error: "Invalid token", code: "UNAUTHORIZED" }, 401);
    }

    const clerkUserId = result.sub;

    const user = await userService.findByClerkId(clerkUserId);
    if (!user) {
      c.set("clerkUserId", clerkUserId);
      return await next();
    }

    c.set("clerkUserId", clerkUserId);
    c.set("userId", user.id);
    return await next();
  } catch {
    return c.json({ error: "Invalid token", code: "UNAUTHORIZED" }, 401);
  }
});
