import { prisma } from "../client.js";

export const followService = {
  follow(followerId: string, followingId: string) {
    return prisma.follow.create({
      data: { followerId, followingId },
    });
  },

  unfollow(followerId: string, followingId: string) {
    return prisma.follow.delete({
      where: { followerId_followingId: { followerId, followingId } },
    });
  },

  isFollowing(followerId: string, followingId: string) {
    return prisma.follow.findUnique({
      where: { followerId_followingId: { followerId, followingId } },
    });
  },

  getFollowers(userId: string, { limit = 20, cursor }: { limit?: number; cursor?: string }) {
    return prisma.follow.findMany({
      where: { followingId: userId },
      take: limit,
      ...(cursor && { skip: 1, cursor: { followerId_followingId: { followerId: cursor, followingId: userId } } }),
      include: {
        follower: { select: { id: true, username: true, name: true, avatarUrl: true } },
      },
    });
  },

  getFollowing(userId: string, { limit = 20, cursor }: { limit?: number; cursor?: string }) {
    return prisma.follow.findMany({
      where: { followerId: userId },
      take: limit,
      ...(cursor && { skip: 1, cursor: { followerId_followingId: { followerId: userId, followingId: cursor } } }),
      include: {
        following: { select: { id: true, username: true, name: true, avatarUrl: true } },
      },
    });
  },
};
