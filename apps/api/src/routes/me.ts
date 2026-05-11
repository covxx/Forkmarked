import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { userService, collectionService } from "@forkmarked/db";
import { createUserSchema, updateUserSchema } from "@forkmarked/types";
import { requireAuth } from "../middleware/auth.js";
import type { AppEnv } from "../types.js";

export const meRoute = new Hono<AppEnv>();

meRoute.use("*", requireAuth);

meRoute.get("/", async (c) => {
  const clerkUserId = c.get("clerkUserId");
  const user = await userService.findByClerkId(clerkUserId);

  if (!user) {
    return c.json({ error: "User not found. Complete onboarding first.", code: "NOT_ONBOARDED" }, 404);
  }

  const profile = await userService.getProfile(user.id);
  return c.json(profile);
});

meRoute.post("/onboard", zValidator("json", createUserSchema), async (c) => {
  const clerkUserId = c.get("clerkUserId");
  const data = c.req.valid("json");

  const existing = await userService.findByClerkId(clerkUserId);
  if (existing) {
    return c.json({ error: "User already onboarded", code: "ALREADY_EXISTS" }, 409);
  }

  const emailCheck = await userService.findByUsername(data.username);
  if (emailCheck) {
    return c.json({ error: "Username already taken", code: "USERNAME_TAKEN" }, 409);
  }

  const user = await userService.create({
    clerkId: clerkUserId,
    email: `${clerkUserId}@placeholder.clerk`,
    username: data.username,
    name: data.name,
    bio: data.bio,
    avatarUrl: data.avatarUrl,
  });

  await collectionService.createDefaults(user.id);

  return c.json(user, 201);
});

meRoute.patch("/", zValidator("json", updateUserSchema), async (c) => {
  const clerkUserId = c.get("clerkUserId");
  const data = c.req.valid("json");

  const user = await userService.update(clerkUserId, data);
  return c.json(user);
});
