import { z } from "zod";

export const ingredientSchema = z.object({
  name: z.string().min(1),
  amount: z.string().optional(),
  unit: z.string().optional(),
  notes: z.string().optional(),
});

export type Ingredient = z.infer<typeof ingredientSchema>;

export const stepSchema = z.object({
  order: z.number().int().min(1),
  instruction: z.string().min(1),
  duration: z.number().int().optional(),
});

export type Step = z.infer<typeof stepSchema>;

export const createRecipeSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(2000).optional(),
  ingredients: z.array(ingredientSchema).min(1),
  steps: z.array(stepSchema).min(1),
  servings: z.number().int().min(1).optional(),
  prepTime: z.number().int().min(0).optional(),
  cookTime: z.number().int().min(0).optional(),
  coverImage: z.string().url().optional(),
  sourceUrl: z.string().url().optional(),
  isPublic: z.boolean().default(true),
  tags: z.array(z.string()).max(10).optional(),
});

export type CreateRecipeInput = z.infer<typeof createRecipeSchema>;

export const updateRecipeSchema = createRecipeSchema.partial();

export type UpdateRecipeInput = z.infer<typeof updateRecipeSchema>;

export const recipeSummarySchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().nullable(),
  coverImage: z.string().nullable(),
  createdAt: z.string(),
  author: z.object({
    id: z.string(),
    username: z.string(),
    avatarUrl: z.string().nullable(),
  }),
  _count: z.object({
    likes: z.number(),
    reviews: z.number(),
  }),
});

export type RecipeSummary = z.infer<typeof recipeSummarySchema>;
