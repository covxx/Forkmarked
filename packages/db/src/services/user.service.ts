import { prisma } from "../client.js";

export const userService = {
  findByClerkId(clerkId: string) {
    return prisma.user.findUnique({ where: { clerkId } });
  },

  findById(id: string) {
    return prisma.user.findUnique({ where: { id } });
  },

  findByUsername(username: string) {
    return prisma.user.findUnique({ where: { username } });
  },

  create(data: {
    clerkId: string;
    email: string;
    username: string;
    name?: string;
    bio?: string;
    avatarUrl?: string;
  }) {
    return prisma.user.create({ data });
  },

  update(
    clerkId: string,
    data: {
      username?: string;
      name?: string;
      bio?: string;
      avatarUrl?: string;
    },
  ) {
    return prisma.user.update({ where: { clerkId }, data });
  },

  getProfile(id: string) {
    return prisma.user.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            recipes: true,
            followers: true,
            following: true,
          },
        },
      },
    });
  },
};
