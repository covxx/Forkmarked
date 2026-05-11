import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { collectionService } from "@forkmarked/db";
import {
  createCollectionSchema,
  addToCollectionSchema,
  paginationSchema,
} from "@forkmarked/types";
import { requireAuth } from "../middleware/auth.js";
import type { AppEnv } from "../types.js";

export const collectionsRoute = new Hono<AppEnv>();

collectionsRoute.use("*", requireAuth);

collectionsRoute.get("/", async (c) => {
  const userId = c.get("userId");
  const collections = await collectionService.listByUser(userId);
  return c.json(collections);
});

collectionsRoute.post("/", zValidator("json", createCollectionSchema), async (c) => {
  const userId = c.get("userId");
  const data = c.req.valid("json");

  const collection = await collectionService.create({
    name: data.name,
    userId,
  });

  return c.json(collection, 201);
});

collectionsRoute.get("/:id", zValidator("query", paginationSchema), async (c) => {
  const { id } = c.req.param();
  const { limit, cursor } = c.req.valid("query");

  const collection = await collectionService.getWithRecipes(id, { limit, cursor });

  if (!collection) {
    return c.json({ error: "Collection not found", code: "NOT_FOUND" }, 404);
  }

  return c.json(collection);
});

collectionsRoute.post("/entries", zValidator("json", addToCollectionSchema), async (c) => {
  const entry = c.req.valid("json");
  const result = await collectionService.addRecipe(entry);
  return c.json(result, 201);
});

collectionsRoute.delete("/entries/:recipeId/:collectionId", async (c) => {
  const { recipeId, collectionId } = c.req.param();
  await collectionService.removeRecipe(recipeId, collectionId);
  return c.json({ success: true });
});
