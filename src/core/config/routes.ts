/** Route constants dùng chung cho navigation. */
export const ROUTES = {
  home: "/",
  products: "/products",
  productDetail: "/products/$slug",
  cart: "/cart",
  checkout: "/checkout",
  wishlist: "/wishlist",
  auth: "/auth",
  account: "/account",
} as const;

export type AppRoute = (typeof ROUTES)[keyof typeof ROUTES];
