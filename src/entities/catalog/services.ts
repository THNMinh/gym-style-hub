import { mock, request } from "@/core/lib/api-client";
import { useMockData } from "@/core/config/env";
import { MOCK_CATEGORIES, MOCK_PRODUCTS } from "./mock-data";
import type { Category, PagedResult, Product, ProductListQuery, ProductSort, ProductVariant } from "./types";

export type BackendProductVariantItem = {
  variantId: string;
  sku: string;
  colorName: string;
  colorHex: string | null;
  size: string;
  price: number;
  originalPrice: number | null;
  stockQuantity?: number;
  available?: number;
  isAvailable?: boolean;
  variantImageUrl: string | null;
};

export type BackendProductImageItem = {
  imageId: string;
  imageUrl: string;
  isPrimary: boolean;
  displayOrder: number;
  variantId: string | null;
};

export type BackendProductItem = {
  productId: string;
  categoryId: string;
  categoryName: string | null;
  name: string;
  slug: string;
  description: string | null;
  fitType: string | null;
  gender: string;
  isActive?: boolean;
  price: number;
  primaryImageUrl: string | null;
  secondaryImageUrl: string | null;
  averageRating: number;
  reviewCount: number;
  images: BackendProductImageItem[];
  variants: BackendProductVariantItem[];
  createdAt: string;
};

type BackendProductsResponse = {
  items: BackendProductItem[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

type BackendProductDetail = {
  productId: string;
  categoryId: string;
  name: string;
  slug: string;
  description: string | null;
  fitType: string | null;
  gender: string;
  isActive: boolean;
  createdAt: string;
  images: {
    imageId: string;
    productId: string;
    variantId: string | null;
    imageUrl: string;
    displayOrder: number;
    isPrimary: boolean;
  }[];
  variants?: BackendProductVariantItem[];
  averageRating?: number;
  reviewCount?: number;
};

function toGender(value: string): "Men" | "Women" | "Unisex" {
  const normalized = (value || "").trim().toLowerCase();
  if (normalized === "men" || normalized === "male" || normalized === "nam") return "Men";
  if (
    normalized === "women" ||
    normalized === "female" ||
    normalized === "nu" ||
    normalized === "nữ"
  ) {
    return "Women";
  }
  return "Unisex";
}

export function getHexForColorName(colorName: string): string {
  const name = (colorName || "").trim().toLowerCase();
  if (name.includes("black") || name.includes("onyx") || name.includes("đen")) return "#18181b";
  if (name.includes("white") || name.includes("trắng")) return "#ffffff";
  if (name.includes("pink") || name.includes("hồng") || name.includes("energy pink")) return "#ec4899";
  if (name.includes("red") || name.includes("đỏ")) return "#ef4444";
  if (name.includes("blue") || name.includes("xanh dương") || name.includes("cyan")) return "#3b82f6";
  if (name.includes("navy")) return "#1e3a8a";
  if (name.includes("grey") || name.includes("gray") || name.includes("xám")) return "#6b7280";
  if (name.includes("green") || name.includes("xanh lá")) return "#22c55e";
  if (name.includes("purple") || name.includes("tím")) return "#a855f7";
  if (name.includes("yellow") || name.includes("vàng")) return "#eab308";
  if (name.includes("beige") || name.includes("kem")) return "#f5f5dc";
  return "#3f3f46";
}

function mapListItemToProduct(item: BackendProductItem): Product {
  const images = (item.images || []).map((img) => ({
    imageId: img.imageId,
    productId: item.productId,
    variantId: img.variantId,
    imageUrl: img.imageUrl,
    displayOrder: img.displayOrder,
    isPrimary: img.isPrimary,
  }));

  if (images.length === 0 && item.primaryImageUrl) {
    images.push({
      imageId: `${item.productId}-primary`,
      productId: item.productId,
      variantId: null,
      imageUrl: item.primaryImageUrl,
      displayOrder: 1,
      isPrimary: true,
    });
    if (item.secondaryImageUrl && item.secondaryImageUrl !== item.primaryImageUrl) {
      images.push({
        imageId: `${item.productId}-secondary`,
        productId: item.productId,
        variantId: null,
        imageUrl: item.secondaryImageUrl,
        displayOrder: 2,
        isPrimary: false,
      });
    }
  }

  const variants: ProductVariant[] = (item.variants || []).map((v) => ({
    variantId: v.variantId,
    productId: item.productId,
    sku: v.sku,
    colorName: v.colorName,
    colorHex: v.colorHex || getHexForColorName(v.colorName),
    size: v.size,
    price: v.price,
    originalPrice: v.originalPrice ?? null,
    weightGrams: null,
    available: v.available ?? v.stockQuantity ?? (v.isAvailable ? 10 : 0),
  }));

  return {
    productId: item.productId,
    categoryId: item.categoryId || "",
    name: item.name,
    slug: item.slug,
    description: item.description,
    fitType: item.fitType,
    gender: toGender(item.gender),
    isActive: item.isActive ?? true,
    variants,
    images,
    sizeGuide: [],
    ratingAverage: item.averageRating || 0,
    reviewCount: item.reviewCount || 0,
    badges: [],
  };
}

function mapVariantToProductVariant(v: BackendProductVariantItem): ProductVariant {
  return {
    variantId: v.variantId,
    productId: (v as any).productId || "",
    sku: v.sku,
    colorName: v.colorName,
    colorHex: v.colorHex || getHexForColorName(v.colorName),
    size: v.size,
    price: v.price,
    originalPrice: v.originalPrice ?? null,
    weightGrams: null,
    available: v.available ?? v.stockQuantity ?? (v.isAvailable ? 10 : 0),
  };
}

function mapDetailToProduct(
  detail: BackendProductDetail,
  extraVariants?: BackendProductVariantItem[],
): Product {
  const rawVariants = detail.variants && detail.variants.length > 0
    ? detail.variants
    : extraVariants ?? [];

  const variants = rawVariants.map(mapVariantToProductVariant);

  return {
    productId: detail.productId,
    categoryId: detail.categoryId,
    name: detail.name,
    slug: detail.slug,
    description: detail.description,
    fitType: detail.fitType,
    gender: toGender(detail.gender),
    isActive: detail.isActive,
    variants,
    images: detail.images || [],
    sizeGuide: [],
    ratingAverage: detail.averageRating ?? 0,
    reviewCount: detail.reviewCount ?? 0,
    badges: [],
  };
}

function sortProducts(items: Product[], sort: ProductSort = "featured"): Product[] {
  const minPrice = (p: Product) => (p.variants.length > 0 ? Math.min(...p.variants.map((v) => v.price)) : 0);
  switch (sort) {
    case "price-asc":
      return [...items].sort((a, b) => minPrice(a) - minPrice(b));
    case "price-desc":
      return [...items].sort((a, b) => minPrice(b) - minPrice(a));
    case "rating":
      return [...items].sort((a, b) => b.ratingAverage - a.ratingAverage);
    case "newest":
      return [...items].sort(
        (a, b) => Number(b.badges.includes("Mới")) - Number(a.badges.includes("Mới")),
      );
    default:
      return [...items].sort((a, b) => b.reviewCount - a.reviewCount);
  }
}

function filterProducts(query: ProductListQuery): Product[] {
  const descendants = (slug: string): string[] => {
    const root = MOCK_CATEGORIES.find((c) => c.slug === slug);
    if (!root) return [];
    const children = MOCK_CATEGORIES.filter((c) => c.parentCategoryId === root.categoryId);
    return [root.categoryId, ...children.map((c) => c.categoryId)];
  };

  return MOCK_PRODUCTS.filter((product) => {
    if (!product.isActive) return false;
    if (query.categorySlug && !descendants(query.categorySlug).includes(product.categoryId)) {
      return false;
    }
    if (query.gender && query.gender !== "All" && product.gender !== query.gender) return false;
    if (query.search) {
      const needle = query.search.toLowerCase();
      if (!`${product.name} ${product.description ?? ""}`.toLowerCase().includes(needle)) {
        return false;
      }
    }
    if (query.colors?.length) {
      const variantColors = product.variants.map((v) => v.colorName.toLowerCase());
      const matchesColor = query.colors.some((selectedColor) => {
        const sc = selectedColor.trim().toLowerCase();
        return variantColors.some((vc) =>
          vc.includes(sc) ||
          sc.includes(vc) ||
          (sc.includes("black") && (vc.includes("onyx") || vc.includes("đen"))) ||
          (sc.includes("onyx") && vc.includes("black")) ||
          (sc.includes("blue") && (vc.includes("navy") || vc.includes("cyan") || vc.includes("sky"))) ||
          (sc.includes("navy") && vc.includes("blue")) ||
          (sc.includes("grey") && vc.includes("gray")) ||
          (sc.includes("gray") && vc.includes("grey")) ||
          (sc.includes("purple") && vc.includes("violet")) ||
          (sc.includes("violet") && vc.includes("purple"))
        );
      });
      if (!matchesColor) return false;
    }
    if (query.fitTypes?.length) {
      const productFit = (product.fitType ?? "").toLowerCase();
      const matchesFit = query.fitTypes.some((selectedFit) => {
        const sf = selectedFit.trim().toLowerCase();
        return productFit.includes(sf) || sf.includes(productFit);
      });
      if (!matchesFit) return false;
    }
    if (query.sizes?.length) {
      const sizes = new Set(product.variants.filter((v) => v.available > 0).map((v) => v.size.toUpperCase()));
      if (!query.sizes.some((s) => sizes.has(s.toUpperCase()))) return false;
    }
    if (query.minDiscountPercent != null && query.minDiscountPercent > 0) {
      const hasDiscount = product.variants.some((v) => {
        if (!v.originalPrice || v.originalPrice <= 0) return false;
        return ((v.originalPrice - v.price) / v.originalPrice) * 100 >= query.minDiscountPercent!;
      });
      if (!hasDiscount) return false;
    }
    return true;
  });
}

export async function getCategories(): Promise<Category[]> {
  if (useMockData) return mock(MOCK_CATEGORIES);
  const res = await request<Category[] | { items: Category[] }>("/api/categories?pageSize=100");
  if (Array.isArray(res)) return res;
  if (res && Array.isArray((res as { items?: Category[] }).items)) {
    return (res as { items: Category[] }).items;
  }
  return [];
}

export async function getProducts(query: ProductListQuery = {}): Promise<PagedResult<Product>> {
  if (useMockData) {
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 12;
    const all = sortProducts(filterProducts(query), query.sort);
    const start = (page - 1) * pageSize;
    const items = all.slice(start, start + pageSize);
    return mock({
      items,
      totalCount: all.length,
      page,
      pageSize,
      totalPages: Math.max(1, Math.ceil(all.length / pageSize)),
    });
  }

  const params = new URLSearchParams();
  if (query.search) params.set("q", query.search);
  if (query.gender && query.gender !== "All") params.set("gender", query.gender);
  if (query.fitTypes?.length) params.set("fitType", query.fitTypes[0] ?? "");
  if (query.categoryId) params.set("categoryId", query.categoryId);
  if (query.categorySlug) params.set("categorySlug", query.categorySlug);
  if (query.colors?.length) params.set("colors", query.colors.join(","));
  if (query.sizes?.length) params.set("sizes", query.sizes.join(","));
  if (query.minPrice != null) params.set("minPrice", String(query.minPrice));
  if (query.maxPrice != null) params.set("maxPrice", String(query.maxPrice));
  if (query.minDiscountPercent != null) params.set("minDiscountPercent", String(query.minDiscountPercent));
  if (query.sort) params.set("sort", query.sort);
  params.set("isActive", "true");
  params.set("page", String(query.page ?? 1));
  params.set("pageSize", String(query.pageSize ?? 24));

  const response = await request<BackendProductsResponse | BackendProductItem[]>(`/api/products?${params.toString()}`);
  const items = Array.isArray(response) ? response : response?.items || [];

  return {
    items: items.map(mapListItemToProduct),
    totalCount: Array.isArray(response) ? items.length : response?.totalCount || items.length,
    page: Array.isArray(response) ? 1 : response?.page || 1,
    pageSize: Array.isArray(response) ? items.length : response?.pageSize || 24,
    totalPages: Array.isArray(response) ? 1 : response?.totalPages || 1,
  };
}

export async function getProductById(productId: string): Promise<Product | null> {
  if (useMockData) {
    const found =
      MOCK_PRODUCTS.find((p) => p.productId === productId || p.slug === productId) ?? null;
    return mock(found);
  }

  try {
    const detail = await request<BackendProductDetail>(`/api/products/${productId}`);
    let extraVariants: BackendProductVariantItem[] = [];

    if (!detail.variants || detail.variants.length === 0) {
      try {
        extraVariants = await request<BackendProductVariantItem[]>(
          `/api/products/${detail.productId}/variants`,
        );
      } catch {
        // ignore fallback
      }
    }

    return mapDetailToProduct(detail, extraVariants);
  } catch (error) {
    if (
      error instanceof Error &&
      "status" in error &&
      (error as { status?: number }).status === 404
    ) {
      return null;
    }
    throw error;
  }
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  if (useMockData) return mock(MOCK_PRODUCTS.find((p) => p.slug === slug) ?? null);

  const list = await getProducts({ page: 1, pageSize: 100, search: slug });
  const exact = list.items.find((item) => item.slug === slug);
  if (!exact) return null;
  return getProductById(exact.productId);
}

export async function getRelatedProducts(product: Product): Promise<Product[]> {
  if (useMockData) {
    const related = MOCK_PRODUCTS.filter(
      (p) => p.productId !== product.productId && p.gender === product.gender,
    ).slice(0, 4);
    return mock(related.length ? related : MOCK_PRODUCTS.slice(0, 4));
  }

  const result = await getProducts({
    ...(product.gender ? { gender: product.gender } : {}),
    page: 1,
    pageSize: 8,
  });
  return result.items.filter((p) => p.productId !== product.productId).slice(0, 4);
}

export async function getProductsByIds(ids: string[]): Promise<Product[]> {
  if (useMockData) return mock(MOCK_PRODUCTS.filter((p) => ids.includes(p.productId)));

  const products = await Promise.all(ids.map((id) => getProductById(id)));
  return products.filter((product): product is Product => !!product);
}

export function getAllColors(): { name: string; hex: string }[] {
  return [
    { name: "Red", hex: "#ef4444" },
    { name: "Blue", hex: "#3b82f6" },
    { name: "Yellow", hex: "#eab308" },
    { name: "Green", hex: "#22c55e" },
    { name: "Orange", hex: "#f97316" },
    { name: "Purple", hex: "#a855f7" },
    { name: "Pink", hex: "#ec4899" },
    { name: "Brown", hex: "#854d0e" },
    { name: "Black", hex: "#18181b" },
    { name: "White", hex: "#ffffff" },
    { name: "Gray", hex: "#6b7280" },
    { name: "Violet", hex: "#8b5cf6" },
  ];
}

export function getAllSizes(): string[] {
  return ["XS", "S", "M", "L", "XL", "XXL"];
}

export function getAllFitTypes(): string[] {
  return ["Slim", "Regular", "Oversized"];
}

export function getCategoryOptions(): { slug: string; name: string }[] {
  return [...MOCK_CATEGORIES]
    .sort((a, b) => a.displayOrder - b.displayOrder)
    .map((c) => ({ slug: c.slug, name: c.name }));
}
