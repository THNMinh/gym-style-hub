import { mock, request } from "@/core/lib/api-client";
import { useMockData } from "@/core/config/env";
import type { Product } from "@/entities/catalog/types";
import { MOCK_PRODUCTS } from "@/entities/catalog/mock-data";

export interface WishlistItemDto {
  productId: string;
  name: string;
  slug: string;
  minPrice: number;
  primaryImageUrl: string | null;
  addedAt: string;
}

export interface WishlistPagedResult {
  items: WishlistItemDto[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface ToggleWishlistResponse {
  isAdded: boolean;
  message: string;
}

export function mapWishlistItemToProduct(item: WishlistItemDto): Product {
  return {
    productId: item.productId,
    categoryId: "",
    name: item.name,
    slug: item.slug,
    description: null,
    fitType: null,
    gender: "Unisex",
    isActive: true,
    variants: [
      {
        variantId: `${item.productId}-default`,
        productId: item.productId,
        sku: item.slug,
        colorName: "Default",
        colorHex: "#111111",
        size: "Free",
        price: item.minPrice,
        originalPrice: null,
        weightGrams: null,
        available: 1,
      },
    ],
    images: item.primaryImageUrl
      ? [
          {
            imageId: `${item.productId}-primary`,
            productId: item.productId,
            variantId: null,
            imageUrl: item.primaryImageUrl,
            displayOrder: 1,
            isPrimary: true,
          },
        ]
      : [],
    sizeGuide: [],
    ratingAverage: 0,
    reviewCount: 0,
    badges: [],
  };
}

export async function getMyWishlist(page = 1, pageSize = 50): Promise<WishlistPagedResult> {
  if (useMockData) {
    const items: WishlistItemDto[] = MOCK_PRODUCTS.slice(0, 3).map((p) => ({
      productId: p.productId,
      name: p.name,
      slug: p.slug,
      minPrice: p.variants[0]?.price ?? 0,
      primaryImageUrl: p.images[0]?.imageUrl ?? null,
      addedAt: new Date().toISOString(),
    }));
    return mock({
      items,
      totalCount: items.length,
      page,
      pageSize,
      totalPages: 1,
    });
  }

  return request<WishlistPagedResult>(`/api/wishlists?page=${page}&pageSize=${pageSize}`);
}

export async function toggleWishlistApi(productId: string): Promise<ToggleWishlistResponse> {
  if (useMockData) {
    return mock({
      isAdded: true,
      message: "Đã cập nhật danh sách yêu thích",
    });
  }

  return request<ToggleWishlistResponse>("/api/wishlists/toggle", {
    method: "POST",
    body: { productId },
  });
}

export async function removeWishlistApi(productId: string): Promise<void> {
  if (useMockData) {
    return mock(undefined);
  }

  return request<void>(`/api/wishlists/products/${productId}`, {
    method: "DELETE",
  });
}
