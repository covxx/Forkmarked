import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../lib/api";
import type { UserProfile, RecipeSummary, FollowEntry } from "../types/api";

export function useUserProfile(id: string) {
  return useQuery<UserProfile>({
    queryKey: ["user", id],
    queryFn: () => apiClient<UserProfile>(`/api/users/${id}`),
    enabled: !!id,
  });
}

export function useUserRecipes(authorId: string) {
  return useQuery<RecipeSummary[]>({
    queryKey: ["recipes", "author", authorId],
    queryFn: () => apiClient<RecipeSummary[]>(`/api/recipes?authorId=${authorId}`),
    enabled: !!authorId,
  });
}

export function useFollowers(userId: string) {
  return useQuery<FollowEntry[]>({
    queryKey: ["followers", userId],
    queryFn: () => apiClient<FollowEntry[]>(`/api/users/${userId}/followers`),
    enabled: !!userId,
  });
}

export function useFollowing(userId: string) {
  return useQuery<FollowEntry[]>({
    queryKey: ["following", userId],
    queryFn: () => apiClient<FollowEntry[]>(`/api/users/${userId}/following`),
    enabled: !!userId,
  });
}

export function useFollow() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) =>
      apiClient(`/api/users/${userId}/follow`, { method: "POST" }),
    onMutate: async (userId) => {
      await queryClient.cancelQueries({ queryKey: ["user", userId] });
      const previous = queryClient.getQueryData<UserProfile>(["user", userId]);
      if (previous) {
        queryClient.setQueryData<UserProfile>(["user", userId], {
          ...previous,
          _count: { ...previous._count, followers: previous._count.followers + 1 },
        });
      }
      return { previous };
    },
    onError: (_err, userId, context) => {
      if (context?.previous) {
        queryClient.setQueryData(["user", userId], context.previous);
      }
    },
    onSettled: (_data, _err, userId) => {
      queryClient.invalidateQueries({ queryKey: ["user", userId] });
      queryClient.invalidateQueries({ queryKey: ["followers", userId] });
    },
  });
}

export function useUnfollow() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) =>
      apiClient(`/api/users/${userId}/follow`, { method: "DELETE" }),
    onMutate: async (userId) => {
      await queryClient.cancelQueries({ queryKey: ["user", userId] });
      const previous = queryClient.getQueryData<UserProfile>(["user", userId]);
      if (previous) {
        queryClient.setQueryData<UserProfile>(["user", userId], {
          ...previous,
          _count: { ...previous._count, followers: previous._count.followers - 1 },
        });
      }
      return { previous };
    },
    onError: (_err, userId, context) => {
      if (context?.previous) {
        queryClient.setQueryData(["user", userId], context.previous);
      }
    },
    onSettled: (_data, _err, userId) => {
      queryClient.invalidateQueries({ queryKey: ["user", userId] });
      queryClient.invalidateQueries({ queryKey: ["followers", userId] });
    },
  });
}
