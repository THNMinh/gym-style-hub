/** Types map 1-1 với schema `catalog` ở server. */

export type Gender = "Men" | "Women" | "Unisex";

export interface Category {
  categoryId: string;
  parentCategoryId: string | null;
  name: string;
  slug: string;
  description: string | null;
  displayOrder: number;
}

export interface ProductVariant {
  variantId: string;
  productId: string;
  sku: string;
  colorName: string;
  colorHex: string | null;
  size: string;
  price: number;
  originalPrice: number | null;
  weightGrams: number | null;
  /** Từ inventory.InventoryItems (QuantityOnHand - QuantityReserved). */
  available: number;
}

export interface ProductImage {
  imageId: string;
  productId: string;
  variantId: string | null;
  imageUrl: string;
  displayOrder: number;
  isPrimary: boolean;
}

export interface SizeGuideRow {
  guideId: string;
  productId: string;
  size: string;
  chestCm: string | null;
  waistCm: string | null;
  hipsCm: string | null;
  heightRangeCm: string | null;
}

export interface Product {
  productId: string;
  categoryId: string;
  name: string;
  slug: string;
  description: string | null;
  fitType: string | null;
  gender: Gender;
  isActive: boolean;
  variants: ProductVariant[];
  images: ProductImage[];
  sizeGuide: SizeGuideRow[];
  ratingAverage: number;
  reviewCount: number;
  badges: string[];
}

export interface ProductListQuery {
  categorySlug?: string;
  categoryId?: string;
  gender?: Gender | "All";
  search?: string;
  colors?: string[];
  sizes?: string[];
  fitTypes?: string[];
  sort?: ProductSort;
  page?: number;
  pageSize?: number;
  minPrice?: number;
  maxPrice?: number;
}

export interface PagedResult<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export type ProductSort = "featured" | "price-asc" | "price-desc" | "newest" | "rating";

export const PRODUCT_SORTS: { value: ProductSort; label: string }[] = [
  { value: "featured", label: "Nổi bật" },
  { value: "newest", label: "Mới nhất" },
  { value: "price-asc", label: "Giá thấp đến cao" },
  { value: "price-desc", label: "Giá cao đến thấp" },
  { value: "rating", label: "Đánh giá cao" },
];
