export type FitFeedback =
  | "TrueToSize"
  | "RunsSmall"
  | "RunsLarge"
  | "TooSmall"
  | "TooLarge"
  | string;

export interface ReviewMedia {
  mediaId: string;
  reviewId?: string;
  mediaUrl: string;
  mediaType: "image" | "video" | "Image" | "Video" | string;
}

export interface ReviewItemDto {
  reviewId: string;
  productId: string;
  productName?: string;
  userId: string;
  userFullName: string;
  userAvatarUrl?: string | null;
  rating: number;
  comment?: string | null;
  fitFeedback?: FitFeedback | null;
  createdAt: string;
  mediaList?: ReviewMedia[];
  medias?: ReviewMedia[];
}

export interface RatingBreakdown {
  fiveStar: number;
  fourStar: number;
  threeStar: number;
  twoStar: number;
  oneStar: number;
}

export interface FitFeedbackSummary {
  trueToSizeCount: number;
  runsSmallCount: number;
  runsLargeCount: number;
  trueToSizePercentage: number;
  runsSmallPercentage: number;
  runsLargePercentage: number;
}

export interface ProductReviewsResponse {
  averageRating: number;
  totalReviews: number;
  ratingBreakdown: RatingBreakdown;
  fitFeedbackSummary: FitFeedbackSummary;
  items: ReviewItemDto[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface CreateReviewPayload {
  productId: string;
  orderId: string;
  rating: number;
  comment?: string | null;
  fitFeedback?: FitFeedback | null;
}

export interface AdminReviewsPagedResponse {
  items: ReviewItemDto[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export const FIT_FEEDBACK_LABEL: Record<string, string> = {
  TrueToSize: "Vừa vặn chuẩn size",
  RunsSmall: "Form hơi nhỏ (Nên tăng 1 size)",
  RunsLarge: "Form rộng rãi (Nên giảm 1 size)",
  TooSmall: "Form hơi nhỏ (Nên tăng 1 size)",
  TooLarge: "Form rộng rãi (Nên giảm 1 size)",
};
