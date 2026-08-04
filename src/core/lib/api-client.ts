import { env, useMockData } from "@/core/config/env";
import { useAuthStore } from "@/features/auth/store";

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

type RequestOptions = Omit<RequestInit, "body"> & { body?: unknown };

/**
 * Wrapper fetch dùng chung cho toàn bộ entity services.
 * Khi chưa có backend (VITE_API_BASE_URL rỗng), services sẽ gọi `mock()` thay vì `request()`.
 */
export async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { body, headers, ...rest } = options;
  const token = useAuthStore.getState().accessToken;

  const response = await fetch(`${env.apiBaseUrl}${path}`, {
    ...rest,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(headers ?? {}),
    },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });

  if (!response.ok) {
    throw new ApiError(await response.text().catch(() => response.statusText), response.status);
  }

  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
}

/** Trả về dữ liệu mock kèm độ trễ giả lập để UI có trạng thái loading thật. */
export function mock<T>(data: T, delayMs = 180): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(structuredClone(data)), delayMs));
}

export const apiMode = useMockData ? "mock" : "http";
