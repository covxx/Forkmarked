import { z } from "zod";

export const paginationSchema = z.object({
  limit: z.coerce.number().int().min(1).max(50).default(20),
  cursor: z.string().optional(),
});

export type PaginationInput = z.infer<typeof paginationSchema>;

export const apiErrorSchema = z.object({
  error: z.string(),
  code: z.string(),
});

export type ApiError = z.infer<typeof apiErrorSchema>;

export const idParamSchema = z.object({
  id: z.string().min(1),
});

export type IdParam = z.infer<typeof idParamSchema>;
