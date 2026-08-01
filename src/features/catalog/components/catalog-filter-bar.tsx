import { PRODUCT_SORTS, type Gender, type ProductSort } from "@/entities/catalog/types";
import { getAllColors, getAllSizes } from "@/entities/catalog/services";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface CatalogFilters {
  gender: Gender | "All";
  colors: string[];
  sizes: string[];
  sort: ProductSort;
}

const GENDERS: { value: Gender | "All"; label: string }[] = [
  { value: "All", label: "Tất cả" },
  { value: "Men", label: "Nam" },
  { value: "Women", label: "Nữ" },
  { value: "Unisex", label: "Unisex" },
];

export function CatalogFilterBar({
  filters,
  total,
  onChange,
}: {
  filters: CatalogFilters;
  total: number;
  onChange: (next: Partial<CatalogFilters>) => void;
}) {
  const toggle = (list: string[], value: string) =>
    list.includes(value) ? list.filter((v) => v !== value) : [...list, value];

  return (
    <div className="space-y-6 border-b border-border pb-6">
      <div className="flex flex-wrap items-center gap-2">
        {GENDERS.map((item) => (
          <button
            key={item.value}
            type="button"
            onClick={() => onChange({ gender: item.value })}
            className={cn(
              "eyebrow border border-border px-4 py-2 transition-colors",
              filters.gender === item.value
                ? "bg-primary text-primary-foreground"
                : "hover:bg-accent",
            )}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap items-start gap-8">
        <div>
          <p className="eyebrow mb-2 text-muted-foreground">Màu</p>
          <div className="flex flex-wrap gap-2">
            {getAllColors().map((color) => (
              <button
                key={color.name}
                type="button"
                title={color.name}
                aria-label={color.name}
                onClick={() => onChange({ colors: toggle(filters.colors, color.name) })}
                className={cn(
                  "size-7 rounded-full border-2",
                  filters.colors.includes(color.name) ? "border-primary" : "border-border",
                )}
                style={{ backgroundColor: color.hex }}
              />
            ))}
          </div>
        </div>

        <div>
          <p className="eyebrow mb-2 text-muted-foreground">Size</p>
          <div className="flex flex-wrap gap-2">
            {getAllSizes().map((size) => (
              <button
                key={size}
                type="button"
                onClick={() => onChange({ sizes: toggle(filters.sizes, size) })}
                className={cn(
                  "min-w-10 border px-3 py-1.5 text-xs font-semibold",
                  filters.sizes.includes(size)
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border hover:bg-accent",
                )}
              >
                {size}
              </button>
            ))}
          </div>
        </div>

        <div className="ml-auto flex items-end gap-3">
          <select
            value={filters.sort}
            onChange={(event) => onChange({ sort: event.target.value as ProductSort })}
            className="h-10 border border-input bg-background px-3 text-sm"
            aria-label="Sắp xếp"
          >
            {PRODUCT_SORTS.map((sort) => (
              <option key={sort.value} value={sort.value}>
                {sort.label}
              </option>
            ))}
          </select>
          <Button
            variant="ghost"
            onClick={() => onChange({ gender: "All", colors: [], sizes: [], sort: "featured" })}
          >
            Xoá lọc
          </Button>
        </div>
      </div>

      <p className="text-xs text-muted-foreground">{total} sản phẩm</p>
    </div>
  );
}
