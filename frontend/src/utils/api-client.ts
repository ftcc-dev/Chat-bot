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

  const raw = await response.text();
  let body: ApiResponse<T>;
  try {
    body = JSON.parse(raw) as ApiResponse<T>;
  } catch {
    if (raw.trimStart().startsWith('<')) {
      throw new Error(
        'API returned HTML (often index.html). Set VITE_API_BASE_URL at build time to your backend origin plus /api (for example https://your-service.onrender.com/api), then redeploy.'
      );
    }
    throw new Error('API response was not valid JSON.');
  }

  if (!response.ok && body?.success === undefined) {
    throw new Error(`HTTP ${response.status}`);
  }
  return body;
}
