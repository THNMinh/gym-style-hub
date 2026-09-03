import { mock, request } from "@/core/lib/api-client";
import { useMockData } from "@/core/config/env";
import type {
  CouponItemDto,
  ApplyCouponResponse,
  CreateCouponPayload,
  UpdateCouponPayload,
  GetAdminCouponsParams,
  AdminCouponsPagedResponse,
} from "./types";

/**
 * Client API 2.1: Lấy Danh Sách Mã Giảm Giá Đang Hoạt Động (GET /api/coupons/active)
 */
export async function getActiveCouponsApi(): Promise<CouponItemDto[]> {
  if (useMockData) {
    return mock([
      {
        couponId: "c1",
        code: "GYMKITTEN10",
        discountType: "Percentage",
        discountValue: 10.0,
        minOrderValue: 300000.0,
        maxDiscountAmount: 50000.0,
        usageLimit: 100,
        usedCount: 12,
        startDate: "2026-09-01T00:00:00Z",
        endDate: "2026-09-30T23:59:59Z",
        isActive: true,
      },
      {
        couponId: "c2",
        code: "WELCOME50K",
        discountType: "FixedAmount",
        discountValue: 50000.0,
        minOrderValue: 500000.0,
        maxDiscountAmount: 50000.0,
        usageLimit: 50,
        usedCount: 5,
        startDate: "2026-09-01T00:00:00Z",
        endDate: "2026-10-31T23:59:59Z",
        isActive: true,
      },
    ]);
  }

  const res = await request<CouponItemDto[] | { items: CouponItemDto[] }>("/api/coupons/active");
  if (Array.isArray(res)) return res;
  if (res && typeof res === "object" && "items" in res && Array.isArray(res.items)) {
    return res.items;
  }
  return [];
}

/**
 * Client API 2.2: Thử Áp Dụng Mã Giảm Giá Đếm Tiền (POST /api/coupons/apply)
 */
export async function applyCouponApi(
  code: string,
  orderSubtotal: number
): Promise<ApplyCouponResponse> {
  if (useMockData) {
    const isPercent = code.toUpperCase().includes("10");
    const discountVal = isPercent ? 10 : 50000;
    const discountAmount = isPercent ? (orderSubtotal * 10) / 100 : 50000;
    return mock({
      code: code.toUpperCase(),
      discountType: isPercent ? "Percentage" : "FixedAmount",
      discountValue: discountVal,
      discountAmount,
      finalAmount: Math.max(0, orderSubtotal - discountAmount),
      message: "Áp dụng mã giảm giá thành công.",
    });
  }

  return request<ApplyCouponResponse>("/api/coupons/apply", {
    method: "POST",
    body: { code: code.trim().toUpperCase(), orderSubtotal },
  });
}

/**
 * Admin API 3.1: Xem Tất Cả Mã Giảm Giá (GET /api/admin/coupons?code=&discountType=&isActive=&page=&pageSize=)
 */
export async function getAdminCouponsApi(
  params?: GetAdminCouponsParams
): Promise<AdminCouponsPagedResponse> {
  if (useMockData) {
    const active = await getActiveCouponsApi();
    return mock({
      items: active,
      totalCount: active.length,
      page: params?.page ?? 1,
      pageSize: params?.pageSize ?? 10,
      totalPages: 1,
    });
  }

  const query = new URLSearchParams();
  if (params?.code) query.set("code", params.code);
  if (params?.discountType) query.set("discountType", params.discountType);
  if (params?.isActive !== undefined && params?.isActive !== null) {
    query.set("isActive", String(params.isActive));
  }
  query.set("page", String(params?.page ?? 1));
  query.set("pageSize", String(params?.pageSize ?? 10));

  const url = `/api/admin/coupons?${query.toString()}`;
  const res = await request<AdminCouponsPagedResponse | CouponItemDto[]>(url);

  if (Array.isArray(res)) {
    return {
      items: res,
      totalCount: res.length,
      page: 1,
      pageSize: res.length || 10,
      totalPages: 1,
    };
  }

  return {
    items: res?.items || [],
    totalCount: res?.totalCount || 0,
    page: res?.page || 1,
    pageSize: res?.pageSize || 10,
    totalPages: res?.totalPages || 1,
  };
}

/**
 * Admin API 3.2: Tạo Mã Giảm Giá Mới (POST /api/admin/coupons)
 */
export async function createAdminCouponApi(payload: CreateCouponPayload): Promise<CouponItemDto> {
  if (useMockData) {
    return mock({
      couponId: crypto.randomUUID(),
      ...payload,
      usedCount: 0,
    });
  }

  return request<CouponItemDto>("/api/admin/coupons", {
    method: "POST",
    body: payload,
  });
}

/**
 * Admin API 3.3: Cập Nhật Mã Giảm Giá (PUT /api/admin/coupons/{id})
 */
export async function updateAdminCouponApi(
  id: string,
  payload: UpdateCouponPayload
): Promise<CouponItemDto> {
  if (useMockData) {
    return mock({
      couponId: id,
      ...payload,
      usedCount: 0,
    });
  }

  return request<CouponItemDto>(`/api/admin/coupons/${id}`, {
    method: "PUT",
    body: payload,
  });
}

/**
 * Admin API 3.4: Xóa Mềm Mã Giảm Giá (DELETE /api/admin/coupons/{id})
 */
export async function deleteAdminCouponApi(id: string): Promise<boolean> {
  if (useMockData) return mock(true);

  const res = await request<boolean | { isSuccess?: boolean }>(`/api/admin/coupons/${id}`, {
    method: "DELETE",
  });
  return Boolean(res);
}
