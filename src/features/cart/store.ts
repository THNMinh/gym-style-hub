import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CartLine } from "@/entities/order/types";
import type { Product, ProductVariant } from "@/entities/catalog/types";

interface CartState {
  lines: CartLine[];
  addItem: (product: Product, variant: ProductVariant, quantity?: number) => void;
  updateQuantity: (cartItemId: string, quantity: number) => void;
  removeItem: (cartItemId: string) => void;
  clear: () => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      lines: [],
      addItem: (product, variant, quantity = 1) =>
        set((state) => {
          const existing = state.lines.find((l) => l.variantId === variant.variantId);
          if (existing) {
            return {
              lines: state.lines.map((l) =>
                l.variantId === variant.variantId ? { ...l, quantity: l.quantity + quantity } : l,
              ),
            };
          }
          const line: CartLine = {
            cartItemId: crypto.randomUUID(),
            variantId: variant.variantId,
            productId: product.productId,
            slug: product.slug,
            productName: product.name,
            sku: variant.sku,
            colorName: variant.colorName,
            size: variant.size,
            unitPrice: variant.price,
            originalPrice: variant.originalPrice,
            imageUrl: product.images[0]?.imageUrl ?? "",
            quantity,
          };
          return { lines: [...state.lines, line] };
        }),
      updateQuantity: (cartItemId, quantity) =>
        set((state) => ({
          lines: state.lines
            .map((l) => (l.cartItemId === cartItemId ? { ...l, quantity } : l))
            .filter((l) => l.quantity > 0),
        })),
      removeItem: (cartItemId) =>
        set((state) => ({ lines: state.lines.filter((l) => l.cartItemId !== cartItemId) })),
      clear: () => set({ lines: [] }),
    }),
    { name: "gymkitten-cart" },
  ),
);

export function cartSubTotal(lines: CartLine[]): number {
  return lines.reduce((sum, line) => sum + line.unitPrice * line.quantity, 0);
}

export function cartCount(lines: CartLine[]): number {
  return lines.reduce((sum, line) => sum + line.quantity, 0);
}
