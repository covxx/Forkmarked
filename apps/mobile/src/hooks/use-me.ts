import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient, ApiError } from "../lib/api";
import type { CreateUserInput, UserProfile } from "@forkmarked/types";
import { useAppStore } from "../lib/store";

export function useMe() {
  const setOnboarded = useAppStore((s) => s.setOnboarded);

  return useQuery<UserProfile, ApiError>({
    queryKey: ["me"],
    queryFn: () => apiClient<UserProfile>("/api/me"),
    retry: (failureCount, error) => {
      if (error instanceof ApiError && error.code === "NOT_ONBOARDED") return false;
      return failureCount < 2;
    },
  });
}

export function useOnboard() {
  const queryClient = useQueryClient();
  const setOnboarded = useAppStore((s) => s.setOnboarded);

  return useMutation({
    mutationFn: (data: CreateUserInput) =>
      apiClient("/api/me/onboard", { method: "POST", body: data }),
    onSuccess: () => {
      setOnboarded(true);
      queryClient.invalidateQueries({ queryKey: ["me"] });
    },
  });
}
