import { z } from "zod";

export const createReviewSchema = z.object({
  rating: z.number().int().min(1).max(5),
  body: z.string().max(5000).optional(),
});

export type CreateReviewInput = z.infer<typeof createReviewSchema>;

export const createCommentSchema = z.object({
  body: z.string().min(1).max(2000),
});

export type CreateCommentInput = z.infer<typeof createCommentSchema>;
