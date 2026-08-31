import { mock, request } from "@/core/lib/api-client";
import { useMockData } from "@/core/config/env";
import { MOCK_CATEGORIES, MOCK_PRODUCTS } from "./mock-data";
import type { Category, PagedResult, Product, ProductListQuery, ProductSort } from "./types";

type BackendProductItem = {
  productId: string;
  name: string;
  slug: string;
  price: number;
  gender: string;
  primaryImageUrl: string | null;
  createdAt: string;
};

type BackendProductsResponse = {
  items: BackendProductItem[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

type BackendProductVariant = {
  variantId: string;
  productId: string;
  sku: string;
  colorName: string;
  colorHex: string | null;
  size: string;
  price: number;
  originalPrice: number | null;
  weightGrams: number | null;
  available?: number;
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
  variants?: BackendProductVariant[];
};

function toGender(value: string): "Men" | "Women" | "Unisex" {
  const normalized = value.trim().toLowerCase();
  if (normalized === "men" || normalized === "male" || normalized === "nam") return "Men";
  if (
    normalized === "women" ||
    normalized === "female" ||
    normalized === "nu" ||
    normalized === "ná»¯"
  ) {
    return "Women";
  }
  return "Unisex";
}

function mapListItemToProduct(item: BackendProductItem): Product {
  return {
    productId: item.productId,
    categoryId: "",
    name: item.name,
    slug: item.slug,
    description: null,
    fitType: null,
    gender: toGender(item.gender),
    isActive: true,
    variants: [
      {
        variantId: `${item.productId}-default`,
        productId: item.productId,
        sku: item.slug,
        colorName: "Default",
        colorHex: "#111111",
        size: "Free",
        price: item.price,
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

function mapVariantToProductVariant(v: BackendProductVariant): ProductVariant {
  return {
    variantId: v.variantId,
    productId: v.productId,
    sku: v.sku,
    colorName: v.colorName,
    colorHex: v.colorHex,
    size: v.size,
    price: v.price,
    originalPrice: v.originalPrice,
    weightGrams: v.weightGrams,
    available: v.available ?? 1,
  };
}

function mapDetailToProduct(
  detail: BackendProductDetail,
  extraVariants?: BackendProductVariant[],
): Product {
  const variants = (detail.variants && detail.variants.length > 0
    ? detail.variants
    : extraVariants ?? []
  ).map(mapVariantToProductVariant);

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
    images: detail.images,
    sizeGuide: [],
    ratingAverage: 0,
    reviewCount: 0,
    badges: [],
  };
}

function sortProducts(items: Product[], sort: ProductSort = "featured"): Product[] {
  const minPrice = (p: Product) => Math.min(...p.variants.map((v) => v.price));
  switch (sort) {
    case "price-asc":
      return [...items].sort((a, b) => minPrice(a) - minPrice(b));
    case "price-desc":
      return [...items].sort((a, b) => minPrice(b) - minPrice(a));
    case "rating":
      return [...items].sort((a, b) => b.ratingAverage - a.ratingAverage);
    case "newest":
      return [...items].sort(
        (a, b) => Number(b.badges.includes("Má»›i")) - Number(a.badges.includes("Má»›i")),
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
      const colors = new Set(product.variants.map((v) => v.colorName));
      if (!query.colors.some((c) => colors.has(c))) return false;
    }
    if (query.fitTypes?.length && !query.fitTypes.includes(product.fitType ?? "")) {
      return false;
    }
    if (query.sizes?.length) {
      const sizes = new Set(product.variants.filter((v) => v.available > 0).map((v) => v.size));
      if (!query.sizes.some((s) => sizes.has(s))) return false;
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
  if (query.search) params.set("searchName", query.search);
  if (query.gender && query.gender !== "All") params.set("gender", query.gender);
  if (query.fitTypes?.length) params.set("fitType", query.fitTypes[0] ?? "");
  if (query.categoryId) params.set("categoryId", query.categoryId);
  params.set("page", String(query.page ?? 1));
  params.set("pageSize", String(query.pageSize ?? 12));

  const response = await request<BackendProductsResponse | BackendProductItem[]>(`/api/products?${params.toString()}`);
  const items = Array.isArray(response) ? response : response?.items || [];

  return {
    items: items.map(mapListItemToProduct),
    totalCount: Array.isArray(response) ? items.length : response?.totalCount || items.length,
    page: Array.isArray(response) ? 1 : response?.page || 1,
    pageSize: Array.isArray(response) ? items.length : response?.pageSize || 12,
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
    let extraVariants: BackendProductVariant[] = [];

    if (!detail.variants || detail.variants.length === 0) {
      try {
        extraVariants = await request<BackendProductVariant[]>(
          `/api/products/${detail.productId}/variants`,
        );
      } catch {
        // bỏ qua nếu endpoint /variants rỗng hoặc chưa có dữ liệu
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
  const map = new Map<string, string>();
  MOCK_PRODUCTS.forEach((p) =>
    p.variants.forEach((v) => map.set(v.colorName, v.colorHex ?? "#111111")),
  );
  return [...map].map(([name, hex]) => ({ name, hex }));
}

export function getAllSizes(): string[] {
  return ["XS", "S", "M", "L", "XL"];
}

export function getAllFitTypes(): string[] {
  return [...new Set(MOCK_PRODUCTS.map((p) => p.fitType).filter((f): f is string => !!f))];
}

export function getCategoryOptions(): { slug: string; name: string }[] {
  return [...MOCK_CATEGORIES]
    .sort((a, b) => a.displayOrder - b.displayOrder)
    .map((c) => ({ slug: c.slug, name: c.name }));
}
