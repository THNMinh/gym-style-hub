import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CartLine } from "@/entities/order/types";
import type { Product, ProductVariant } from "@/entities/catalog/types";
import {
  getCartApi,
  addToCartApi,
  updateCartItemApi,
  removeCartItemApi,
  clearCartApi,
  type CartItemResponse,
} from "./services";
import { useAuthStore } from "@/features/auth/store";

interface CartState {
  lines: CartLine[];
  isLoading: boolean;
  isOpen: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;
  setIsOpen: (isOpen: boolean) => void;
  fetchCart: () => Promise<void>;
  addItem: (product: Product, variant: ProductVariant, quantity?: number) => Promise<void>;
  updateQuantity: (cartItemIdOrVariantId: string, quantity: number) => Promise<void>;
  removeItem: (cartItemIdOrVariantId: string) => Promise<void>;
  clear: () => Promise<void>;
}

function mapCartItemsToLines(items: CartItemResponse[]): CartLine[] {
  return items.map((i) => ({
    cartItemId: i.cartItemId,
    variantId: i.variantId,
    productId: i.productId,
    slug: i.productId,
    productName: i.productName,
    sku: "",
    colorName: i.colorName,
    size: i.size,
    unitPrice: i.price,
    originalPrice: i.originalPrice,
    imageUrl: i.imageUrl || "",
    quantity: i.quantity,
  }));
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      lines: [],
      isLoading: false,
      isOpen: false,

      openDrawer: () => set({ isOpen: true }),
      closeDrawer: () => set({ isOpen: false }),
      setIsOpen: (isOpen: boolean) => set({ isOpen }),

      fetchCart: async () => {
        const user = useAuthStore.getState().user;
        const token = useAuthStore.getState().accessToken;
        if (!user || !token) return;

        try {
          set({ isLoading: true });
          const res = await getCartApi();
          if (res && Array.isArray(res.items)) {
            set({ lines: mapCartItemsToLines(res.items), isLoading: false });
          } else {
            set({ isLoading: false });
          }
        } catch {
          set({ isLoading: false });
        }
      },

      addItem: async (product, variant, quantity = 1) => {
        const user = useAuthStore.getState().user;
        const token = useAuthStore.getState().accessToken;

        if (user && token) {
          set({ isLoading: true });
          try {
            const res = await addToCartApi(variant.variantId, quantity);
            if (res && Array.isArray(res.items)) {
              set({ lines: mapCartItemsToLines(res.items), isLoading: false, isOpen: true });
              return;
            }
          } catch (err) {
            set({ isLoading: false });
            throw err;
          }
        }

        // Fallback local cart state
        set((state) => {
          const existing = state.lines.find((l) => l.variantId === variant.variantId);
          if (existing) {
            return {
              lines: state.lines.map((l) =>
                l.variantId === variant.variantId ? { ...l, quantity: l.quantity + quantity } : l,
              ),
              isLoading: false,
              isOpen: true,
            };
          }
          const line: CartLine = {
            cartItemId: crypto.randomUUID(),
            variantId: variant.variantId,
            productId: product.productId,
            slug: product.productId,
            productName: product.name,
            sku: variant.sku,
            colorName: variant.colorName,
            size: variant.size,
            unitPrice: variant.price,
            originalPrice: variant.originalPrice,
            imageUrl: product.images[0]?.imageUrl ?? "",
            quantity,
          };
          return { lines: [...state.lines, line], isLoading: false, isOpen: true };
        });
      },

      updateQuantity: async (cartItemIdOrVariantId, quantity) => {
        const user = useAuthStore.getState().user;
        const token = useAuthStore.getState().accessToken;
        const target = get().lines.find(
          (l) => l.cartItemId === cartItemIdOrVariantId || l.variantId === cartItemIdOrVariantId,
        );

        if (!target) return;

        if (user && token) {
          set({ isLoading: true });
          try {
            if (quantity <= 0) {
              const res = await removeCartItemApi(target.variantId);
              set({ lines: mapCartItemsToLines(res.items), isLoading: false });
            } else {
              const res = await updateCartItemApi(target.variantId, quantity);
              set({ lines: mapCartItemsToLines(res.items), isLoading: false });
            }
            return;
          } catch (err) {
            set({ isLoading: false });
            throw err;
          }
        }

        // Fallback local update
        set((state) => ({
          lines: state.lines
            .map((l) =>
              l.cartItemId === cartItemIdOrVariantId || l.variantId === cartItemIdOrVariantId
                ? { ...l, quantity }
                : l,
            )
            .filter((l) => l.quantity > 0),
        }));
      },

      removeItem: async (cartItemIdOrVariantId) => {
        const user = useAuthStore.getState().user;
        const token = useAuthStore.getState().accessToken;
        const target = get().lines.find(
          (l) => l.cartItemId === cartItemIdOrVariantId || l.variantId === cartItemIdOrVariantId,
        );

        if (!target) return;

        if (user && token) {
          set({ isLoading: true });
          try {
            const res = await removeCartItemApi(target.variantId);
            set({ lines: mapCartItemsToLines(res.items), isLoading: false });
            return;
          } catch (err) {
            set({ isLoading: false });
            throw err;
          }
        }

        // Fallback local remove
        set((state) => ({
          lines: state.lines.filter(
            (l) => l.cartItemId !== cartItemIdOrVariantId && l.variantId !== cartItemIdOrVariantId,
          ),
        }));
      },

      clear: async () => {
        const user = useAuthStore.getState().user;
        const token = useAuthStore.getState().accessToken;

        if (user && token) {
          try {
            await clearCartApi();
          } catch {
            // ignore network error on clear
          }
        }
        set({ lines: [], isOpen: false });
      },
    }),
    {
      name: "gymkitten-cart",
      partialize: (state) => ({ lines: state.lines }),
    },
  ),
);

export function cartSubTotal(lines: CartLine[]): number {
  return lines.reduce((sum, line) => sum + (line.unitPrice || 0) * line.quantity, 0);
}

export function cartCount(lines: CartLine[]): number {
  return lines.reduce((sum, line) => sum + line.quantity, 0);
}
