export interface ReviewMedia {
  mediaId: string;
  reviewId: string;
  mediaUrl: string;
  mediaType: "Image" | "Video";
}

export type FitFeedback = "TooSmall" | "TrueToSize" | "TooLarge";

export interface ProductReview {
  reviewId: string;
  productId: string;
  userId: string;
  authorName: string;
  orderId: string;
  rating: number;
  comment: string | null;
  fitFeedback: FitFeedback | null;
  createdAt: string;
  medias: ReviewMedia[];
}

export interface WishlistItem {
  wishlistId: string;
  userId: string;
  productId: string;
  createdAt: string;
}

export const FIT_FEEDBACK_LABEL: Record<FitFeedback, string> = {
  TooSmall: "Nhỏ hơn size thường",
  TrueToSize: "Đúng size",
  TooLarge: "Rộng hơn size thường",
};
