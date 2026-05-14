import type { ApiResponse } from '../types/chat';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '/api';

export async function apiClient<T>(
  endpoint: string,
  options?: RequestInit
): Promise<ApiResponse<T>> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  });

  const body = (await response.json()) as ApiResponse<T>;

  if (!response.ok && body?.success === undefined) {
    throw new Error(`HTTP ${response.status}`);
  }
  return body;
}
