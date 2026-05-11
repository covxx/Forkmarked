import { getToken } from "./auth.js";

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:3000";

type RequestOptions = {
  method?: string;
  body?: unknown;
  headers?: Record<string, string>;
};

export async function apiClient<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const token = await getToken();
  const { method = "GET", body, headers = {} } = options;

  const response = await fetch(`${API_URL}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
      ...headers,
    },
    ...(body && { body: JSON.stringify(body) }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new ApiError(error.error ?? "Unknown error", error.code ?? "UNKNOWN", response.status);
  }

  return response.json() as Promise<T>;
}

export class ApiError extends Error {
  constructor(
    message: string,
    public code: string,
    public status: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}
