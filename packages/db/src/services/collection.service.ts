import type { RecipeStatus } from "../../generated/client/enums.js";
import { prisma } from "../client.js";

const DEFAULT_COLLECTIONS = ["Want to Cook", "Have Cooked", "Favorites"] as const;

export const collectionService = {
  createDefaults(userId: string) {
    return prisma.collection.createMany({
      data: DEFAULT_COLLECTIONS.map((name) => ({
        name,
        userId,
        isDefault: true,
      })),
      skipDuplicates: true,
    });
  },

  listByUser(userId: string) {
    return prisma.collection.findMany({
      where: { userId },
      orderBy: [{ isDefault: "desc" }, { createdAt: "asc" }],
      include: {
        _count: { select: { entries: true } },
      },
    });
  },

  create(data: { name: string; userId: string }) {
    return prisma.collection.create({ data });
  },

  addRecipe(data: {
    recipeId: string;
    collectionId: string;
    status?: RecipeStatus;
    notes?: string;
  }) {
    return prisma.recipeEntry.upsert({
      where: {
        recipeId_collectionId: {
          recipeId: data.recipeId,
          collectionId: data.collectionId,
        },
      },
      create: data,
      update: { status: data.status, notes: data.notes },
    });
  },

  removeRecipe(recipeId: string, collectionId: string) {
    return prisma.recipeEntry.delete({
      where: { recipeId_collectionId: { recipeId, collectionId } },
    });
  },

  getWithRecipes(
    collectionId: string,
    { limit = 20, cursor }: { limit?: number; cursor?: string },
  ) {
    return prisma.collection.findUnique({
      where: { id: collectionId },
      include: {
        entries: {
          take: limit,
          ...(cursor && { skip: 1, cursor: { id: cursor } }),
          orderBy: { createdAt: "desc" },
          include: {
            recipe: {
              include: {
                author: { select: { id: true, username: true, avatarUrl: true } },
                _count: { select: { likes: true } },
              },
            },
          },
        },
      },
    });
  },
};
