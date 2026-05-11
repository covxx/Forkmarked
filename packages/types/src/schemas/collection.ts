import { z } from "zod";

export const recipeStatusSchema = z.enum(["SAVED", "COOKING", "COOKED"]);

export type RecipeStatus = z.infer<typeof recipeStatusSchema>;

export const createCollectionSchema = z.object({
  name: z.string().min(1).max(100),
});

export type CreateCollectionInput = z.infer<typeof createCollectionSchema>;

export const addToCollectionSchema = z.object({
  recipeId: z.string().min(1),
  collectionId: z.string().min(1),
  status: recipeStatusSchema.default("SAVED"),
  notes: z.string().max(500).optional(),
});

export type AddToCollectionInput = z.infer<typeof addToCollectionSchema>;

export const collectionSummarySchema = z.object({
  id: z.string(),
  name: z.string(),
  isDefault: z.boolean(),
  _count: z.object({
    entries: z.number(),
  }),
});

export type CollectionSummary = z.infer<typeof collectionSummarySchema>;
