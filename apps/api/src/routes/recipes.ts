import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { recipeService } from "@forkmarked/db";
import { createRecipeSchema, paginationSchema } from "@forkmarked/types";
import { requireAuth } from "../middleware/auth.js";
import type { AppEnv } from "../types.js";
import { z } from "zod";

export const recipesRoute = new Hono<AppEnv>();

recipesRoute.get("/feed", requireAuth, zValidator("query", paginationSchema), async (c) => {
  const userId = c.get("userId");
  const { limit, cursor } = c.req.valid("query");

  const recipes = await recipeService.feed(userId, { limit, cursor });
  return c.json(recipes);
});

recipesRoute.get(
  "/search",
  zValidator("query", paginationSchema.extend({ q: z.string().min(1) })),
  async (c) => {
    const { q, limit, cursor } = c.req.valid("query");

    const recipes = await recipeService.search(q, { limit, cursor });
    return c.json(recipes);
  },
);

recipesRoute.get("/:id", async (c) => {
  const { id } = c.req.param();
  const recipe = await recipeService.findById(id);

  if (!recipe) {
    return c.json({ error: "Recipe not found", code: "NOT_FOUND" }, 404);
  }

  return c.json(recipe);
});

recipesRoute.post("/", requireAuth, zValidator("json", createRecipeSchema), async (c) => {
  const userId = c.get("userId");
  const data = c.req.valid("json");

  const recipe = await recipeService.create({
    ...data,
    authorId: userId,
  });

  return c.json(recipe, 201);
});
