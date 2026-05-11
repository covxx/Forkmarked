import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from "@tanstack/react-query";
import { apiClient } from "../lib/api";
import type { RecipeSummary, RecipeDetail } from "../types/api";
import type { CreateRecipeInput } from "@forkmarked/types";

export function useFeed() {
  return useInfiniteQuery<RecipeSummary[]>({
    queryKey: ["feed"],
    queryFn: ({ pageParam }) =>
      apiClient<RecipeSummary[]>(`/api/recipes/feed?limit=20${pageParam ? `&cursor=${pageParam}` : ""}`),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) =>
      lastPage.length === 20 ? lastPage[lastPage.length - 1]?.id : undefined,
  });
}

export function useRecipeDetail(id: string) {
  return useQuery<RecipeDetail>({
    queryKey: ["recipe", id],
    queryFn: () => apiClient<RecipeDetail>(`/api/recipes/${id}`),
    enabled: !!id,
  });
}

export function useSearchRecipes(query: string) {
  return useInfiniteQuery<RecipeSummary[]>({
    queryKey: ["recipes", "search", query],
    queryFn: ({ pageParam }) =>
      apiClient<RecipeSummary[]>(
        `/api/recipes/search?q=${encodeURIComponent(query)}&limit=20${pageParam ? `&cursor=${pageParam}` : ""}`,
      ),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) =>
      lastPage.length === 20 ? lastPage[lastPage.length - 1]?.id : undefined,
    enabled: query.length > 0,
  });
}

export function useCreateRecipe() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateRecipeInput) =>
      apiClient<RecipeDetail>("/api/recipes", { method: "POST", body: data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["feed"] });
      queryClient.invalidateQueries({ queryKey: ["me"] });
    },
  });
}

export function useLikeRecipe() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (recipeId: string) =>
      apiClient(`/api/recipes/${recipeId}/like`, { method: "POST" }),
    onMutate: async (recipeId) => {
      await queryClient.cancelQueries({ queryKey: ["recipe", recipeId] });
      const previous = queryClient.getQueryData<RecipeDetail>(["recipe", recipeId]);
      if (previous) {
        queryClient.setQueryData<RecipeDetail>(["recipe", recipeId], {
          ...previous,
          _count: { ...previous._count, likes: previous._count.likes + 1 },
        });
      }
      return { previous };
    },
    onError: (_err, recipeId, context) => {
      if (context?.previous) {
        queryClient.setQueryData(["recipe", recipeId], context.previous);
      }
    },
    onSettled: (_data, _err, recipeId) => {
      queryClient.invalidateQueries({ queryKey: ["recipe", recipeId] });
      queryClient.invalidateQueries({ queryKey: ["feed"] });
    },
  });
}
