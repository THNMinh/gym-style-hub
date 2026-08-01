/**
 * Cấu hình môi trường của frontend.
 * Toàn bộ code khác chỉ đọc env qua file này.
 */
export const env = {
  appName: "GYMKITTEN",
  /** Base URL của API thật. Khi rỗng, api-client sẽ chạy ở chế độ mock. */
  apiBaseUrl: import.meta.env["VITE_API_BASE_URL"] ?? "",
  currency: "VND",
  locale: "vi-VN",
  freeShippingThreshold: 1_200_000,
  shippingFee: 35_000,
} as const;

export const useMockData = env.apiBaseUrl.length === 0;
