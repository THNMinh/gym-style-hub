/**
 * Cấu hình môi trường của frontend.
 * Toàn bộ code khác chỉ đọc env qua file này.
 */
export const env = {
  appName: "GYMKITTEN",
  /** Base URL của API thật. Khi chưa cấu hình, dùng backend local cho môi trường dev. */
  apiBaseUrl: import.meta.env["VITE_API_BASE_URL"] ?? "http://localhost:5084",
  currency: "VND",
  locale: "vi-VN",
  freeShippingThreshold: 1_200_000,
  shippingFee: 35_000,
} as const;

export const useMockData = env.apiBaseUrl.length === 0;
