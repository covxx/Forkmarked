import { z } from "zod";

export const createUserSchema = z.object({
  username: z
    .string()
    .min(3)
    .max(30)
    .regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores"),
  name: z.string().max(100).optional(),
  bio: z.string().max(500).optional(),
  avatarUrl: z.string().url().optional(),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;

export const updateUserSchema = createUserSchema.partial();

export type UpdateUserInput = z.infer<typeof updateUserSchema>;

export const userProfileSchema = z.object({
  id: z.string(),
  username: z.string(),
  name: z.string().nullable(),
  bio: z.string().nullable(),
  avatarUrl: z.string().nullable(),
  createdAt: z.string(),
  _count: z.object({
    recipes: z.number(),
    followers: z.number(),
    following: z.number(),
  }),
});

export type UserProfile = z.infer<typeof userProfileSchema>;
