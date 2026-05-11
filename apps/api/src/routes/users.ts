import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { userService, followService } from "@forkmarked/db";
import { idParamSchema, paginationSchema } from "@forkmarked/types";
import { requireAuth } from "../middleware/auth.js";
import type { AppEnv } from "../types.js";

export const usersRoute = new Hono<AppEnv>();

usersRoute.get("/:id", async (c) => {
  const { id } = c.req.param();
  const profile = await userService.getProfile(id);

  if (!profile) {
    return c.json({ error: "User not found", code: "NOT_FOUND" }, 404);
  }

  return c.json(profile);
});

usersRoute.get("/:id/followers", zValidator("query", paginationSchema), async (c) => {
  const { id } = c.req.param();
  const { limit, cursor } = c.req.valid("query");

  const followers = await followService.getFollowers(id, { limit, cursor });
  return c.json(followers);
});

usersRoute.get("/:id/following", zValidator("query", paginationSchema), async (c) => {
  const { id } = c.req.param();
  const { limit, cursor } = c.req.valid("query");

  const following = await followService.getFollowing(id, { limit, cursor });
  return c.json(following);
});

usersRoute.post("/:id/follow", requireAuth, async (c) => {
  const { id: targetId } = c.req.param();
  const userId = c.get("userId");

  if (userId === targetId) {
    return c.json({ error: "Cannot follow yourself", code: "INVALID_ACTION" }, 400);
  }

  const target = await userService.findById(targetId);
  if (!target) {
    return c.json({ error: "User not found", code: "NOT_FOUND" }, 404);
  }

  await followService.follow(userId, targetId);
  return c.json({ success: true }, 201);
});

usersRoute.delete("/:id/follow", requireAuth, async (c) => {
  const { id: targetId } = c.req.param();
  const userId = c.get("userId");

  await followService.unfollow(userId, targetId);
  return c.json({ success: true });
});
