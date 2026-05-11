import type { RecipeStatus } from "../../generated/client/enums.js";
import { prisma } from "../client.js";

export const recipeService = {
  findById(id: string) {
    return prisma.recipe.findUnique({
      where: { id },
      include: {
        author: { select: { id: true, username: true, avatarUrl: true } },
        recipeTags: { include: { tag: true } },
        _count: { select: { likes: true, reviews: true, comments: true } },
      },
    });
  },

  create(data: {
    title: string;
    description?: string;
    ingredients: unknown;
    steps: unknown;
    servings?: number;
    prepTime?: number;
    cookTime?: number;
    coverImage?: string;
    sourceUrl?: string;
    isPublic?: boolean;
    authorId: string;
    tags?: string[];
  }) {
    const { tags, ...recipeData } = data;
    return prisma.recipe.create({
      data: {
        ...recipeData,
        ingredients: recipeData.ingredients as object,
        steps: recipeData.steps as object,
        ...(tags?.length && {
          recipeTags: {
            create: tags.map((tagId) => ({ tagId })),
          },
        }),
      },
    });
  },

  listByAuthor(authorId: string, { limit = 20, cursor }: { limit?: number; cursor?: string }) {
    return prisma.recipe.findMany({
      where: { authorId, isPublic: true },
      orderBy: { createdAt: "desc" },
      take: limit,
      ...(cursor && { skip: 1, cursor: { id: cursor } }),
      include: {
        author: { select: { id: true, username: true, avatarUrl: true } },
        _count: { select: { likes: true, reviews: true } },
      },
    });
  },

  feed(userId: string, { limit = 20, cursor }: { limit?: number; cursor?: string }) {
    return prisma.recipe.findMany({
      where: {
        isPublic: true,
        author: {
          followers: { some: { followerId: userId } },
        },
      },
      orderBy: { createdAt: "desc" },
      take: limit,
      ...(cursor && { skip: 1, cursor: { id: cursor } }),
      include: {
        author: { select: { id: true, username: true, avatarUrl: true } },
        _count: { select: { likes: true, reviews: true } },
      },
    });
  },

  search(query: string, { limit = 20, cursor }: { limit?: number; cursor?: string }) {
    return prisma.recipe.findMany({
      where: {
        isPublic: true,
        OR: [
          { title: { contains: query, mode: "insensitive" } },
          { description: { contains: query, mode: "insensitive" } },
        ],
      },
      orderBy: { createdAt: "desc" },
      take: limit,
      ...(cursor && { skip: 1, cursor: { id: cursor } }),
      include: {
        author: { select: { id: true, username: true, avatarUrl: true } },
        _count: { select: { likes: true, reviews: true } },
      },
    });
  },
};
