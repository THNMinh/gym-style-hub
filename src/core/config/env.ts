const getApiBaseUrl = (): string => {
  const rawUrl =
    (typeof import.meta !== "undefined" && (import.meta.env?.["VITE_API_BASE_URL"] as string | undefined)) ||
    (typeof process !== "undefined" && process.env?.["NEXT_PUBLIC_API_BASE_URL"]) ||
    (typeof process !== "undefined" && process.env?.["VITE_API_BASE_URL"]);

  if (rawUrl && typeof rawUrl === "string" && rawUrl.trim().length > 0) {
    // Tự động chuẩn hóa: gỡ bỏ /swagger/index.html hoặc /swagger nếu người dùng dán cả link swagger vào
    return rawUrl
      .trim()
      .replace(/\/swagger(?:\/index\.html)?\/?$/i, "")
      .replace(/\/$/, "");
  }

  // Mặc định kết nối tới Backend GymKitten trên Render
  return "https://gymkitten.onrender.com";
};

export const env = {
  appName: "GYMKITTEN",
  /** Base URL của API thật. Mặc định trỏ về backend production Render: https://gymkitten.onrender.com */
  apiBaseUrl: getApiBaseUrl(),
  currency: "VND",
  locale: "vi-VN",
  freeShippingThreshold: 1_200_000,
  shippingFee: 35_000,
} as const;

export const useMockData = false;
