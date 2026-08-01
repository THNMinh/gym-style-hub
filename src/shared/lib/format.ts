import { env } from "@/core/config/env";

export function formatPrice(value: number): string {
  return new Intl.NumberFormat(env.locale, {
    style: "currency",
    currency: env.currency,
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatDate(value: string): string {
  return new Intl.DateTimeFormat(env.locale, {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(value));
}

export function discountPercent(price: number, originalPrice?: number | null): number | null {
  if (!originalPrice || originalPrice <= price) return null;
  return Math.round(((originalPrice - price) / originalPrice) * 100);
}
