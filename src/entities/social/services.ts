import { mock, request } from "@/core/lib/api-client";
import { useMockData } from "@/core/config/env";
import { MOCK_REVIEWS } from "@/entities/catalog/mock-data";
import type { ProductReview } from "./types";

export async function getProductReviews(productId: string): Promise<ProductReview[]> {
  if (useMockData) return mock(MOCK_REVIEWS.filter((r) => r.productId === productId));
  return request<ProductReview[]>(`/social/products/${productId}/reviews`);
}

export async function createProductReview(
  payload: Pick<ProductReview, "productId" | "rating" | "comment" | "fitFeedback"> & {
    authorName: string;
  },
): Promise<ProductReview> {
  const review: ProductReview = {
    reviewId: crypto.randomUUID(),
    productId: payload.productId,
    userId: "local-user",
    authorName: payload.authorName,
    orderId: "local-order",
    rating: payload.rating,
    comment: payload.comment,
    fitFeedback: payload.fitFeedback,
    createdAt: new Date().toISOString(),
    medias: [],
  };
  if (useMockData) {
    MOCK_REVIEWS.unshift(review);
    return mock(review);
  }
  return request<ProductReview>(`/social/products/${payload.productId}/reviews`, {
    method: "POST",
    body: payload,
  });
}
