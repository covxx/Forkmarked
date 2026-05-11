import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../lib/api";
import type { CollectionSummary, CollectionWithRecipes } from "../types/api";

export function useCollections() {
  return useQuery<CollectionSummary[]>({
    queryKey: ["collections"],
    queryFn: () => apiClient<CollectionSummary[]>("/api/collections"),
  });
}

export function useCollectionDetail(id: string) {
  return useQuery<CollectionWithRecipes>({
    queryKey: ["collection", id],
    queryFn: () => apiClient<CollectionWithRecipes>(`/api/collections/${id}`),
    enabled: !!id,
  });
}

export function useCreateCollection() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (name: string) =>
      apiClient<CollectionSummary>("/api/collections", {
        method: "POST",
        body: { name },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["collections"] });
    },
  });
}

export function useAddToCollection() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { recipeId: string; collectionId: string; status?: string }) =>
      apiClient("/api/collections/entries", { method: "POST", body: data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["collections"] });
    },
  });
}

export function useRemoveFromCollection() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ recipeId, collectionId }: { recipeId: string; collectionId: string }) =>
      apiClient(`/api/collections/entries/${recipeId}/${collectionId}`, {
        method: "DELETE",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["collections"] });
    },
  });
}
