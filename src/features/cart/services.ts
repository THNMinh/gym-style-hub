import { request } from "@/core/lib/api-client";

export interface CartItemResponse {
  cartItemId: string;
  variantId: string;
  productId: string;
  productName: string;
  colorName: string;
  colorHex: string | null;
  size: string;
  imageUrl: string | null;
  price: number;
  originalPrice: number | null;
  quantity: number;
  availableStock: number;
  isAvailable: boolean;
}

export interface CartResponse {
  cartId: string;
  totalItems: number;
  subTotal: number;
  items: CartItemResponse[];
}

export async function getCartApi(): Promise<CartResponse> {
  return await request<CartResponse>("/api/cart", {
    method: "GET",
  });
}

export async function addToCartApi(variantId: string, quantity = 1): Promise<CartResponse> {
  return await request<CartResponse>("/api/cart/items", {
    method: "POST",
    body: { variantId, quantity },
  });
}

export async function updateCartItemApi(variantId: string, quantity: number): Promise<CartResponse> {
  return await request<CartResponse>(`/api/cart/items/${variantId}`, {
    method: "PUT",
    body: { quantity },
  });
}

export async function removeCartItemApi(variantId: string): Promise<CartResponse> {
  return await request<CartResponse>(`/api/cart/items/${variantId}`, {
    method: "DELETE",
  });
}

export async function clearCartApi(): Promise<void> {
  await request<void>("/api/cart", {
    method: "DELETE",
  });
}
