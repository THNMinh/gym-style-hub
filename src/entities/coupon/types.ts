export type DiscountType = "Percentage" | "FixedAmount" | "Percent" | "Fixed" | string;

export interface CouponItemDto {
  couponId: string;
  code: string;
  discountType: DiscountType;
  discountValue: number;
  minOrderValue: number;
  maxDiscountAmount: number | null;
  usageLimit?: number | null;
  usedCount?: number;
  startDate?: string | null;
  endDate?: string | null;
  isActive: boolean;
}

export interface GetAdminCouponsParams {
  code?: string;
  discountType?: string;
  isActive?: boolean;
  page?: number;
  pageSize?: number;
}

export interface AdminCouponsPagedResponse {
  items: CouponItemDto[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface ApplyCouponRequest {
  code: string;
  orderSubtotal: number;
}

export interface ApplyCouponResponse {
  code: string;
  discountType: DiscountType;
  discountValue: number;
  discountAmount: number;
  finalAmount: number;
  message?: string;
}

export interface CreateCouponPayload {
  code: string;
  discountType: "Percentage" | "FixedAmount" | string;
  discountValue: number;
  minOrderValue: number;
  maxDiscountAmount: number | null;
  usageLimit: number | null;
  startDate: string | null;
  endDate: string | null;
  isActive: boolean;
}

export interface UpdateCouponPayload extends CreateCouponPayload {}

export const DISCOUNT_TYPE_LABEL: Record<string, string> = {
  Percentage: "Giảm theo %",
  Percent: "Giảm theo %",
  FixedAmount: "Giảm tiền cố định",
  Fixed: "Giảm tiền cố định",
};
