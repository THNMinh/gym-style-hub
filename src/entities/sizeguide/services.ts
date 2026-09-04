import { mock, request } from "@/core/lib/api-client";
import { useMockData } from "@/core/config/env";
import type {
  ProductSizeGuideResponse,
  RecommendSizeRequest,
  RecommendSizeResponse,
  CreateSizeGuidePayload,
  UpdateSizeGuidePayload,
  SizeGuideItem,
} from "./types";

/**
 * Client API 1.1: Lấy Bảng Quy Đổi Size Của Sản Phẩm (GET /api/products/{productId}/size-guide)
 */
export async function getProductSizeGuideApi(
  productId: string
): Promise<ProductSizeGuideResponse> {
  if (useMockData) {
    return mock({
      productId,
      items: [
        {
          guideId: "g1",
          size: "S",
          chestCm: "84-88",
          waistCm: "68-72",
          hipsCm: "92-96",
          heightRangeCm: "160-168",
        },
        {
          guideId: "g2",
          size: "M",
          chestCm: "88-94",
          waistCm: "72-78",
          hipsCm: "96-102",
          heightRangeCm: "168-175",
        },
        {
          guideId: "g3",
          size: "L",
          chestCm: "94-100",
          waistCm: "78-84",
          hipsCm: "102-108",
          heightRangeCm: "175-182",
        },
      ],
    });
  }

  const res = await request<ProductSizeGuideResponse | { items?: SizeGuideItem[] }>(
    `/api/products/${productId}/size-guide`
  );

  if ("productId" in res && Array.isArray(res.items)) {
    return res as ProductSizeGuideResponse;
  }

  const items = (res as { items?: SizeGuideItem[] })?.items || (Array.isArray(res) ? res : []);
  return {
    productId,
    items,
  };
}

/**
 * Client API 1.2: Widget "Gợi Ý Size Cho Tôi" (POST /api/size-guide/recommend)
 */
export async function recommendSizeApi(
  payload: RecommendSizeRequest
): Promise<RecommendSizeResponse> {
  if (useMockData) {
    const bmi = payload.weightKg / Math.pow(payload.heightCm / 100, 2);
    let size = "M";
    if (bmi < 20) size = "S";
    else if (bmi > 24) size = "L";

    return mock({
      recommendedSize: size,
      confidence: "95%",
      explanation: `Dựa vào chiều cao ${payload.heightCm}cm và cân nặng ${payload.weightKg}kg, kích cỡ tối ưu cho bạn là Size ${size}.`,
    });
  }

  return request<RecommendSizeResponse>("/api/size-guide/recommend", {
    method: "POST",
    body: payload,
  });
}

/**
 * Admin API 1.3: Tạo Bảng Size Mới Cho Sản Phẩm (POST /api/admin/products/{productId}/size-guide)
 */
export async function createAdminSizeGuideApi(
  productId: string,
  payload: CreateSizeGuidePayload
): Promise<SizeGuideItem> {
  if (useMockData) {
    return mock({
      guideId: crypto.randomUUID(),
      ...payload,
    });
  }

  return request<SizeGuideItem>(`/api/admin/products/${productId}/size-guide`, {
    method: "POST",
    body: payload,
  });
}

/**
 * Admin API 1.4: Cập Nhật 1 Dòng Bảng Size (PUT /api/admin/products/size-guide/{guideId})
 */
export async function updateAdminSizeGuideApi(
  guideId: string,
  payload: UpdateSizeGuidePayload
): Promise<SizeGuideItem> {
  if (useMockData) {
    return mock({
      guideId,
      ...payload,
    });
  }

  return request<SizeGuideItem>(`/api/admin/products/size-guide/${guideId}`, {
    method: "PUT",
    body: payload,
  });
}
