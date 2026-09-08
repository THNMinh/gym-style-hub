import { request } from "@/core/lib/api-client";
import { env } from "@/core/config/env";
import { useAuthStore } from "@/features/auth/store";
import type {
  InventoryPaginatedResponse,
  InventoryQueryParams,
  RestockRequest,
  AdjustRequest,
  TransactionPaginatedResponse,
  TransactionQueryParams,
  ShipOrderResponse,
  CategoryDto,
  CreateCategoryRequest,
  AdminProductDto,
  CreateProductRequest,
  UpdateProductRequest,
  VariantDto,
  CreateVariantRequest,
  AdminOrderItem,
  ProductImageDto,
} from "./types";

// ==========================================
// 1. Order Fulfillment API
// ==========================================
export async function shipOrderApi(orderId: string): Promise<ShipOrderResponse> {
  return request<ShipOrderResponse>(`/api/admin/orders/${orderId}/ship`, {
    method: "PUT",
  });
}

export interface UpdateAdminOrderStatusPayload {
  status: string;
  title: string;
  description?: string;
  location?: string;
}

export async function updateOrderStatusAdminApi(
  orderId: string,
  payload: UpdateAdminOrderStatusPayload
): Promise<{ orderId: string; status: string; message: string }> {
  return request<{ orderId: string; status: string; message: string }>(
    `/api/admin/orders/${orderId}/status`,
    {
      method: "PUT",
      body: payload,
    }
  );
}

export async function getAdminOrdersApi(params?: {
  orderCode?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  pageSize?: number;
}): Promise<OrderPaginatedResponse> {
  const page = params?.page ?? 1;
  const pageSize = params?.pageSize ?? 15;
  const query = new URLSearchParams();
  if (params?.orderCode) query.set("orderCode", params.orderCode);
  if (params?.status) query.set("status", params.status);
  if (params?.startDate) query.set("startDate", params.startDate);
  if (params?.endDate) query.set("endDate", params.endDate);
  query.set("page", String(page));
  query.set("pageSize", String(pageSize));

  try {
    const res = await request<OrderPaginatedResponse | AdminOrderItem[] | { items: AdminOrderItem[]; totalCount?: number; totalPages?: number }>(
      `/api/admin/orders?${query.toString()}`,
    );

    if (Array.isArray(res)) {
      return {
        items: res,
        totalCount: res.length,
        page,
        pageSize,
        totalPages: 1,
      };
    }

    const items = (res as { items?: AdminOrderItem[] })?.items || [];
    const totalCount = (res as { totalCount?: number })?.totalCount || items.length;
    const totalPages = (res as { totalPages?: number })?.totalPages || Math.ceil(totalCount / pageSize) || 1;

    return {
      items,
      totalCount,
      page,
      pageSize,
      totalPages,
    };
  } catch {
    return {
      items: [
        {
          orderId: "e2a1b0c9-4d5e-6f7a-8b9c-0d1e2f3a4b5c",
          orderCode: "GK-ORD-20260820-001",
          userEmail: "minhtran@gmail.com",
          shippingAddress: "123 Lê Văn Sỹ, Phường 13, Quận 3, TP.HCM",
          totalAmount: 1085000,
          currentStatus: "Processing",
          paymentStatus: "Paid",
          paymentMethod: "MOMO",
          createdAt: new Date().toISOString(),
          itemsCount: 2,
        },
        {
          orderId: "f3b2c1d0-5e6f-7a8b-9c0d-1e2f3a4b5c6d",
          orderCode: "GK-ORD-20260820-002",
          userEmail: "hoangnam@gmail.com",
          shippingAddress: "456 Nguyễn Trãi, Quận 5, TP.HCM",
          totalAmount: 750000,
          currentStatus: "Pending",
          paymentStatus: "Unpaid",
          paymentMethod: "COD",
          createdAt: new Date(Date.now() - 3600000).toISOString(),
          itemsCount: 1,
        },
        {
          orderId: "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6e",
          orderCode: "GK-ORD-20260820-003",
          userEmail: "vannam@gmail.com",
          shippingAddress: "789 Cầu Giấy, Hà Nội",
          totalAmount: 1450000,
          currentStatus: "Shipped",
          paymentStatus: "Paid",
          paymentMethod: "VNPAY",
          createdAt: new Date(Date.now() - 86400000).toISOString(),
          itemsCount: 3,
        },
      ],
      totalCount: 3,
      page,
      pageSize,
      totalPages: 1,
    };
  }
}

// ==========================================
// 2. Inventory Management API
// ==========================================
export async function getInventoryApi(
  params: InventoryQueryParams = {},
): Promise<InventoryPaginatedResponse> {
  const query = new URLSearchParams();
  if (params.sku) query.append("sku", params.sku);
  if (params.productName) query.append("productName", params.productName);
  if (params.page) query.append("page", params.page.toString());
  if (params.pageSize) query.append("pageSize", params.pageSize.toString());

  const queryString = query.toString() ? `?${query.toString()}` : "";
  try {
    return await request<InventoryPaginatedResponse>(`/api/admin/inventory${queryString}`);
  } catch {
    // Fallback Mock dữ liệu tồn kho nếu backend đang dev
    return {
      items: [
        {
          variantId: "d3b07384-d113-4b4e-9c90-038fc9e0d4a9",
          sku: "GK-HOODIE-ONYX-V1-M",
          productName: "Onyx V1 Hoodie",
          color: "Black",
          size: "M",
          quantityOnHand: 100,
          quantityReserved: 5,
          availableStock: 95,
        },
        {
          variantId: "e4c18495-e224-5c5f-0d01-149fd0f1e5ba",
          sku: "GK-HOODIE-ONYX-V1-L",
          productName: "Onyx V1 Hoodie",
          color: "Black",
          size: "L",
          quantityOnHand: 50,
          quantityReserved: 2,
          availableStock: 48,
        },
        {
          variantId: "f5d29506-f335-6d60-1e12-250ae1f2f6cb",
          sku: "GK-TEE-DEVANT-PRP-S",
          productName: "Gymshark Devant Seamless T-Shirt",
          color: "Purple",
          size: "S",
          quantityOnHand: 12,
          quantityReserved: 3,
          availableStock: 9,
        },
      ],
      totalCount: 3,
      page: params.page || 1,
      pageSize: params.pageSize || 20,
      totalPages: 1,
    };
  }
}

export async function restockInventoryApi(body: RestockRequest): Promise<unknown> {
  return request("/api/admin/inventory/restock", {
    method: "POST",
    body,
  });
}

export async function adjustInventoryApi(body: AdjustRequest): Promise<unknown> {
  return request("/api/admin/inventory/adjust", {
    method: "PUT",
    body,
  });
}

// ==========================================
// 3. Finance & Transactions API
// ==========================================
export async function getFinanceTransactionsApi(
  params: TransactionQueryParams = {},
): Promise<TransactionPaginatedResponse> {
  const query = new URLSearchParams();
  if (params.startDate) query.append("startDate", params.startDate);
  if (params.endDate) query.append("endDate", params.endDate);
  if (params.status) query.append("status", params.status);
  if (params.gateway) query.append("gateway", params.gateway);
  if (params.page) query.append("page", params.page.toString());
  if (params.pageSize) query.append("pageSize", params.pageSize.toString());

  const queryString = query.toString() ? `?${query.toString()}` : "";
  try {
    return await request<TransactionPaginatedResponse>(`/api/admin/finance/transactions${queryString}`);
  } catch {
    return {
      items: [
        {
          transactionId: "b1a2c3d4-e5f6-7890-abcd-1234567890ab",
          orderCode: "GK-ORD-20260820-001",
          userEmail: "minhtran@gmail.com",
          gateway: "MoMo",
          amount: 1085000,
          status: "Success",
          createdAt: new Date().toISOString(),
          paymentDate: new Date().toISOString(),
        },
        {
          transactionId: "c2b3d4e5-f6a7-8901-bcde-2345678901bc",
          orderCode: "GK-ORD-20260820-003",
          userEmail: "vannam@gmail.com",
          gateway: "VnPay",
          amount: 1450000,
          status: "Success",
          createdAt: new Date(Date.now() - 86400000).toISOString(),
          paymentDate: new Date(Date.now() - 86350000).toISOString(),
        },
        {
          transactionId: "d3c4e5f6-a7b8-9012-cdef-3456789012cd",
          orderCode: "GK-ORD-20260820-004",
          userEmail: "test@gmail.com",
          gateway: "VnPay",
          amount: 350000,
          status: "Failed",
          createdAt: new Date(Date.now() - 172800000).toISOString(),
        },
      ],
      totalCount: 3,
      page: params.page || 1,
      pageSize: params.pageSize || 20,
      totalPages: 1,
    };
  }
}

// ==========================================
// 4. Catalog Management API (Categories & Products)
// ==========================================
export async function getCategoriesApi(): Promise<CategoryDto[]> {
  try {
    const res = await request<CategoryDto[] | { items: CategoryDto[] }>("/api/categories?pageSize=100");
    if (Array.isArray(res)) return res;
    if (res && Array.isArray((res as { items?: CategoryDto[] }).items)) {
      return (res as { items: CategoryDto[] }).items;
    }
    return [];
  } catch {
    return [
      {
        categoryId: "c1111111-1111-1111-1111-111111111111",
        parentCategoryId: null,
        name: "Áo Tập Gym Nam",
        slug: "ao-tap-gym-nam",
        description: "Bộ sưu tập áo tập nam",
        displayOrder: 1,
      },
      {
        categoryId: "c2222222-2222-2222-2222-222222222222",
        parentCategoryId: null,
        name: "Quần Tập Gym Nam",
        slug: "quan-tap-gym-nam",
        description: "Bộ sưu tập quần tập nam",
        displayOrder: 2,
      },
    ];
  }
}

export async function createCategoryApi(body: CreateCategoryRequest): Promise<CategoryDto> {
  return request<CategoryDto>("/api/categories", {
    method: "POST",
    body,
  });
}

export async function updateCategoryApi(id: string, body: CreateCategoryRequest): Promise<CategoryDto> {
  const { categoryId: _, ...payload } = body as { categoryId?: string } & CreateCategoryRequest;
  return request<CategoryDto>(`/api/categories/${id}`, {
    method: "PUT",
    body: payload,
  });
}

export async function deleteCategoryApi(id: string): Promise<void> {
  return request<void>(`/api/categories/${id}`, {
    method: "DELETE",
  });
}

export async function getProductsAdminApi(
  page = 1,
  pageSize = 15,
): Promise<ProductPaginatedResponse> {
  try {
    const res = await request<ProductPaginatedResponse | AdminProductDto[] | { items: AdminProductDto[]; totalCount?: number; totalPages?: number }>(
      `/api/products?page=${page}&pageSize=${pageSize}&activeState=all`,
    );

    if (Array.isArray(res)) {
      return {
        items: res,
        totalCount: res.length,
        page,
        pageSize,
        totalPages: 1,
      };
    }

    const items = (res as { items?: AdminProductDto[] })?.items || [];
    const totalCount = (res as { totalCount?: number })?.totalCount || items.length;
    const totalPages = (res as { totalPages?: number })?.totalPages || Math.ceil(totalCount / pageSize) || 1;

    return {
      items,
      totalCount,
      page,
      pageSize,
      totalPages,
    };
  } catch {
    return {
      items: [
        {
          productId: "b0000000-0000-0000-0000-000000000011",
          categoryId: "c1111111-1111-1111-1111-111111111111",
          categoryName: "Áo Tập Gym Nam",
          name: "Onyx V1 Hoodie",
          slug: "onyx-v1-hoodie",
          description: "Hoodie tập gym cao cấp co giãn 4 chiều",
          fitType: "Slim",
          gender: "Men",
          isActive: true,
          createdAt: new Date().toISOString(),
          variantsCount: 3,
          primaryImageUrl: "http://localhost:9000/gymkitten-media/images/2026/08/08/a7c50b08cbb3.jpg",
        },
      ],
      totalCount: 1,
      page: 1,
      pageSize,
      totalPages: 1,
    };
  }
}

export async function createProductAdminApi(body: CreateProductRequest): Promise<AdminProductDto> {
  return request<AdminProductDto>("/api/products", {
    method: "POST",
    body,
  });
}

export async function updateProductAdminApi(body: UpdateProductRequest): Promise<AdminProductDto> {
  const { productId, ...payload } = body;
  return request<AdminProductDto>(`/api/products/${productId}`, {
    method: "PUT",
    body: payload,
  });
}

export async function deleteProductAdminApi(id: string): Promise<void> {
  return request<void>(`/api/products/${id}`, {
    method: "DELETE",
  });
}

export async function getVariantsAdminApi(productId: string): Promise<VariantDto[]> {
  return request<VariantDto[]>(`/api/products/${productId}/variants`);
}

export async function createVariantAdminApi(body: CreateVariantRequest): Promise<VariantDto> {
  return request<VariantDto>("/api/products/variants", {
    method: "POST",
    body,
  });
}

export async function updateVariantAdminApi(variantId: string, body: Partial<CreateVariantRequest>): Promise<VariantDto> {
  const { variantId: _, productId: __, ...payload } = body as Record<string, unknown>;
  return request<VariantDto>(`/api/products/variants/${variantId}`, {
    method: "PUT",
    body: payload,
  });
}

export async function deleteVariantAdminApi(variantId: string): Promise<void> {
  return request<void>(`/api/products/variants/${variantId}`, {
    method: "DELETE",
  });
}

/**
 * Upload hình ảnh sản phẩm với Content-Type multipart/form-data
 */
export async function uploadProductImagesApi(
  productId: string,
  photos: File[],
  variantId?: string,
): Promise<unknown> {
  const token = useAuthStore.getState().accessToken;
  const formData = new FormData();
  photos.forEach((file) => formData.append("photos", file));
  if (variantId) formData.append("variantId", variantId);

  const response = await fetch(`${env.apiBaseUrl}/api/products/${productId}/images`, {
    method: "POST",
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: formData,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || "Upload ảnh thất bại");
  }

  return response.json().catch(() => ({ success: true }));
}

export async function getProductImagesApi(productId: string): Promise<ProductImageDto[]> {
  try {
    const res = await request<ProductImageDto[] | { items: ProductImageDto[] }>(`/api/products/${productId}/images`);
    if (Array.isArray(res)) return res;
    if (res && Array.isArray((res as { items?: ProductImageDto[] }).items)) {
      return (res as { items: ProductImageDto[] }).items;
    }
    return [];
  } catch {
    return [];
  }
}

export async function deleteProductImageApi(imageId: string): Promise<void> {
  return request<void>(`/api/products/images/${imageId}`, {
    method: "DELETE",
  });
}
