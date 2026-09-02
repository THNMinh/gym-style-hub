import { mock, request } from "@/core/lib/api-client";
import { useMockData, env } from "@/core/config/env";
import { useAuthStore } from "@/features/auth/store";
import type {
  ProductReviewsResponse,
  CreateReviewPayload,
  ReviewMedia,
  AdminReviewsPagedResponse,
  ReviewItemDto,
} from "./types";

/**
 * Client API 2.1: Lấy Danh Sách Đánh Giá Của 1 Sản Phẩm (GET /api/products/{productId}/reviews)
 */
export async function getProductReviewsApi(
  productId: string,
  params?: { rating?: number; hasMedia?: boolean; page?: number; pageSize?: number }
): Promise<ProductReviewsResponse> {
  if (useMockData) {
    return mock({
      averageRating: 4.8,
      totalReviews: 3,
      ratingBreakdown: { fiveStar: 2, fourStar: 1, threeStar: 0, twoStar: 0, oneStar: 0 },
      fitFeedbackSummary: {
        trueToSizeCount: 2,
        runsSmallCount: 1,
        runsLargeCount: 0,
        trueToSizePercentage: 66.7,
        runsSmallPercentage: 33.3,
        runsLargePercentage: 0,
      },
      items: [
        {
          reviewId: "r1",
          productId,
          userId: "u1",
          userFullName: "Minh Trần",
          userAvatarUrl: null,
          rating: 5,
          comment: "Áo co giãn 4 chiều cực êm, tập Squat không bị sờn vải!",
          fitFeedback: "TrueToSize",
          createdAt: "2026-08-30T10:00:00Z",
          mediaList: [
            {
              mediaId: "m1",
              mediaUrl: "http://localhost:9000/gymkitten-media/images/2026/08/08/a7c50b08cbb3.jpg",
              mediaType: "image",
            },
          ],
        },
        {
          reviewId: "r2",
          productId,
          userId: "u2",
          userFullName: "Hoàng Nam",
          userAvatarUrl: null,
          rating: 4,
          comment: "Vải thoáng khí, mặc tập Gym rất mát. Form dáng hơi ôm nhẹ.",
          fitFeedback: "RunsSmall",
          createdAt: "2026-08-28T14:30:00Z",
          mediaList: [],
        },
      ],
      totalCount: 2,
      page: params?.page ?? 1,
      pageSize: params?.pageSize ?? 10,
      totalPages: 1,
    });
  }

  const query = new URLSearchParams();
  if (params?.rating) query.set("rating", String(params.rating));
  if (params?.hasMedia !== undefined) query.set("hasMedia", String(params.hasMedia));
  query.set("page", String(params?.page ?? 1));
  query.set("pageSize", String(params?.pageSize ?? 10));

  return request<ProductReviewsResponse>(`/api/products/${productId}/reviews?${query.toString()}`);
}

/**
 * Client API 2.2: Tạo Đánh Giá Sản Phẩm Trải Nghiệm Mặc Thử (POST /api/reviews)
 */
export async function createProductReviewApi(
  payload: CreateReviewPayload
): Promise<{ reviewId: string }> {
  if (useMockData) {
    return mock({ reviewId: crypto.randomUUID() });
  }

  return request<{ reviewId: string }>("/api/reviews", {
    method: "POST",
    body: payload,
  });
}

/**
 * Client API 2.3: Upload Ảnh / Video Mặc Thử (POST /api/reviews/{reviewId}/media)
 */
export async function uploadReviewMediaApi(
  reviewId: string,
  files: File[]
): Promise<{ reviewId: string; mediaList: ReviewMedia[] }> {
  if (useMockData) {
    return mock({
      reviewId,
      mediaList: files.map((f, i) => ({
        mediaId: `m-${i}`,
        mediaUrl: URL.createObjectURL(f),
        mediaType: f.type.startsWith("video/") ? "video" : "image",
      })),
    });
  }

  const token = useAuthStore.getState().accessToken;
  const formData = new FormData();
  files.forEach((file) => formData.append("files", file));

  const response = await fetch(`${env.apiBaseUrl}/api/reviews/${reviewId}/media`, {
    method: "POST",
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: formData,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || "Upload file media đánh giá thất bại");
  }

  const json = await response.json();
  if (json && typeof json === "object" && "isSuccess" in json) {
    if (!json.isSuccess) throw new Error(json.error?.message || "Upload thất bại");
    return json.data;
  }
  return json;
}

/**
 * Admin API 3.1: Admin Xem Tất Cả Đánh Giá Trên Toàn Hệ Thống (GET /api/admin/reviews)
 */
export async function getAdminReviewsApi(params?: {
  productId?: string;
  rating?: number;
  page?: number;
  pageSize?: number;
}): Promise<AdminReviewsPagedResponse> {
  if (useMockData) {
    const mockData = await getProductReviewsApi("demo", params);
    return mock({
      items: mockData.items,
      totalCount: mockData.totalCount,
      page: mockData.page,
      pageSize: mockData.pageSize,
      totalPages: mockData.totalPages,
    });
  }

  const query = new URLSearchParams();
  if (params?.productId) query.set("productId", params.productId);
  if (params?.rating) query.set("rating", String(params.rating));
  query.set("page", String(params?.page ?? 1));
  query.set("pageSize", String(params?.pageSize ?? 10));

  return request<AdminReviewsPagedResponse>(`/api/admin/reviews?${query.toString()}`);
}

/**
 * Admin API 3.2: Admin Xóa Đánh Giá Spam / Vi Phạm (DELETE /api/admin/reviews/{reviewId})
 */
export async function deleteAdminReviewApi(reviewId: string): Promise<boolean> {
  if (useMockData) return mock(true);

  const res = await request<boolean | { isSuccess?: boolean }>(`/api/admin/reviews/${reviewId}`, {
    method: "DELETE",
  });
  return Boolean(res);
}

// Backward compatibility helpers
export async function getProductReviews(productId: string): Promise<ReviewItemDto[]> {
  const res = await getProductReviewsApi(productId);
  return res.items || [];
}

export async function createProductReview(payload: any): Promise<{ reviewId: string }> {
  return createProductReviewApi({
    productId: payload.productId,
    orderId: payload.orderId || "00000000-0000-0000-0000-000000000000",
    rating: payload.rating,
    comment: payload.comment,
    fitFeedback: payload.fitFeedback,
  });
}
