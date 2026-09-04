export interface SizeGuideItem {
  guideId: string;
  size: string;
  chestCm: string;
  waistCm: string;
  hipsCm: string;
  heightRangeCm: string;
}

export interface ProductSizeGuideResponse {
  productId: string;
  items: SizeGuideItem[];
}

export interface RecommendSizeRequest {
  productId: string;
  heightCm: number;
  weightKg: number;
  chestCm?: number;
  waistCm?: number;
}

export interface RecommendSizeResponse {
  recommendedSize: string;
  confidence: string;
  explanation: string;
}

export interface CreateSizeGuidePayload {
  size: string;
  chestCm: string;
  waistCm: string;
  hipsCm: string;
  heightRangeCm: string;
}

export interface UpdateSizeGuidePayload extends CreateSizeGuidePayload {}
