import { mock, request } from "@/core/lib/api-client";
import { useMockData } from "@/core/config/env";
import { MOCK_CATEGORIES, MOCK_PRODUCTS } from "./mock-data";
import type { Category, Product, ProductListQuery, ProductSort } from "./types";

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
      return [...items].sort((a, b) => Number(b.badges.includes("Mới")) - Number(a.badges.includes("Mới")));
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
    if (query.sizes?.length) {
      const sizes = new Set(product.variants.filter((v) => v.available > 0).map((v) => v.size));
      if (!query.sizes.some((s) => sizes.has(s))) return false;
    }
    return true;
  });
}

export async function getCategories(): Promise<Category[]> {
  if (useMockData) return mock(MOCK_CATEGORIES);
  return request<Category[]>("/catalog/categories");
}

export async function getProducts(query: ProductListQuery = {}): Promise<Product[]> {
  if (useMockData) return mock(sortProducts(filterProducts(query), query.sort));
  const params = new URLSearchParams();
  Object.entries(query).forEach(([key, value]) => {
    if (Array.isArray(value)) value.forEach((v) => params.append(key, v));
    else if (value != null) params.set(key, String(value));
  });
  return request<Product[]>(`/catalog/products?${params.toString()}`);
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  if (useMockData) return mock(MOCK_PRODUCTS.find((p) => p.slug === slug) ?? null);
  return request<Product | null>(`/catalog/products/${slug}`);
}

export async function getRelatedProducts(product: Product): Promise<Product[]> {
  if (useMockData) {
    const related = MOCK_PRODUCTS.filter(
      (p) => p.productId !== product.productId && p.gender === product.gender,
    ).slice(0, 4);
    return mock(related.length ? related : MOCK_PRODUCTS.slice(0, 4));
  }
  return request<Product[]>(`/catalog/products/${product.slug}/related`);
}

export async function getProductsByIds(ids: string[]): Promise<Product[]> {
  if (useMockData) return mock(MOCK_PRODUCTS.filter((p) => ids.includes(p.productId)));
  return request<Product[]>(`/catalog/products/by-ids?ids=${ids.join(",")}`);
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
