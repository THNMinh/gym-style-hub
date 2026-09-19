import axios from "axios";
import { env, useMockData } from "@/core/config/env";
import { useAuthStore } from "@/features/auth/store";

export const apiClient = axios.create({
  baseURL: env.apiBaseUrl,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

export class ApiError extends Error {
  public code?: string | undefined;
  public data?: unknown | undefined;

  constructor(
    message: string,
    public status: number,
    code?: string | undefined,
    data?: unknown | undefined,
  ) {
    super(message);
    this.name = "ApiError";
    this.code = code;
    this.data = data;
  }
}

export interface ApiResult<T> {
  isSuccess?: boolean;
  data?: T;
  error?: { code?: string; message?: string } | string | null;
  timestamp?: string;
}

type RequestOptions = Omit<RequestInit, "body"> & { body?: unknown };

let refreshTokenPromise: Promise<{ accessToken: string; refreshToken: string }> | null = null;

async function refreshTokens(): Promise<{ accessToken: string; refreshToken: string }> {
  const currentAccessToken = useAuthStore.getState().accessToken;
  const currentRefreshToken = useAuthStore.getState().refreshToken;

  if (!currentRefreshToken) {
    useAuthStore.getState().logout();
    throw new ApiError("No refresh token available", 401);
  }

  if (refreshTokenPromise) {
    return refreshTokenPromise;
  }

  refreshTokenPromise = (async () => {
    try {
      const response = await fetch(`${env.apiBaseUrl}/api/auth/refresh-token`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          accessToken: currentAccessToken || "",
          refreshToken: currentRefreshToken,
        }),
      });

      if (!response.ok) {
        const errJson = await response.json().catch(() => null);
        const isTokenReuse =
          errJson?.errors?.some((e: any) => e?.code === "Auth.TokenReuseDetected") ||
          errJson?.error?.code === "Auth.TokenReuseDetected" ||
          (typeof errJson?.detail === "string" && errJson.detail.includes("reuse"));

        useAuthStore.getState().logout();

        if (isTokenReuse) {
          alert("⚠️ Cảnh báo: Phát hiện phiên đăng nhập không an toàn (Token Reuse Detected). Toàn bộ phiên làm việc đã bị thu hồi. Vui lòng đăng nhập lại!");
          if (typeof window !== "undefined") {
            window.location.href = "/auth";
          }
        }
        throw new ApiError(
          errJson?.errors?.[0]?.description || errJson?.detail || "Refresh token expired or invalid",
          response.status,
          isTokenReuse ? "Auth.TokenReuseDetected" : undefined,
          errJson,
        );
      }

      const resJson = await response.json();
      const tokenData = (resJson?.isSuccess !== undefined ? resJson.data : resJson) as {
        accessToken: string;
        refreshToken: string;
      };

      if (!tokenData?.accessToken) {
        useAuthStore.getState().logout();
        throw new ApiError("Invalid token response", 401);
      }

      useAuthStore.getState().updateTokens(tokenData.accessToken, tokenData.refreshToken);
      return tokenData;
    } catch (err) {
      useAuthStore.getState().logout();
      throw err;
    } finally {
      refreshTokenPromise = null;
    }
  })();

  return refreshTokenPromise;
}

/**
 * Wrapper fetch dùng chung cho toàn bộ entity services.
 * Tự động bóc tách Response Envelope `ApiResult<T>` từ Backend.
 */
export async function request<T>(
  path: string,
  options: RequestOptions = {},
  isRetry = false,
): Promise<T> {
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
    if (response.status === 401 && !isRetry && !path.includes("/api/auth/")) {
      try {
        await refreshTokens();
        return await request<T>(path, options, true);
      } catch {
        // Refresh thất bại
      }
    }

    const errJson = await response.json().catch(() => null);
    if (errJson && typeof errJson === "object") {
      const errCode =
        errJson.errors?.[0]?.code ||
        errJson.error?.code ||
        (typeof errJson.code === "string" ? errJson.code : undefined);
      const errMsg =
        errJson.errors?.[0]?.description ||
        errJson.error?.message ||
        errJson.detail ||
        errJson.title ||
        (typeof errJson.error === "string" ? errJson.error : null);
      if (errMsg) {
        throw new ApiError(errMsg, response.status, errCode, errJson);
      }
    }

    throw new ApiError(response.statusText || "Request failed", response.status);
  }

  if (response.status === 204) return undefined as T;

  const json = await response.json().catch(() => null);

  if (json === null || json === undefined) {
    return undefined as T;
  }

  // Tự động bóc tách Response Envelope (ApiResult<T> / Result<T>)
  if (typeof json === "object" && json !== null && "isSuccess" in json) {
    const envelope = json as ApiResult<T> & { value?: T };
    if (envelope.isSuccess === false) {
      const errCode = typeof envelope.error === "object" ? envelope.error?.code : undefined;
      const errMsg =
        typeof envelope.error === "object" && envelope.error?.message
          ? envelope.error.message
          : typeof envelope.error === "string"
          ? envelope.error
          : "API Request Failed";
      throw new ApiError(errMsg, response.status, errCode, envelope);
    }
    return (envelope.data !== undefined ? envelope.data : (envelope.value as T)) as T;
  }

  return json as T;
}

/** Trả về dữ liệu mock kèm độ trễ giả lập để UI có trạng thái loading thật. */
export function mock<T>(data: T, delayMs = 180): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(structuredClone(data)), delayMs));
}

export const apiMode = useMockData ? "mock" : "http";
