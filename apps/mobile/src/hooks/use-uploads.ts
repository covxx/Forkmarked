import { useMutation } from "@tanstack/react-query";
import { apiClient } from "../lib/api";
import type { PresignedUpload } from "../types/api";

export function usePresignUpload() {
  return useMutation({
    mutationFn: (data: { contentType: string; folder: "avatars" | "recipes" | "uploads" }) =>
      apiClient<PresignedUpload>("/api/uploads/presign", {
        method: "POST",
        body: data,
      }),
  });
}

export async function uploadToPresignedUrl(
  presignedUrl: string,
  uri: string,
  contentType: string,
): Promise<void> {
  const response = await fetch(uri);
  const blob = await response.blob();

  await fetch(presignedUrl, {
    method: "PUT",
    headers: { "Content-Type": contentType },
    body: blob,
  });
}
