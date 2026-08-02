import { ChevronDown, X } from "lucide-react";
import { PRODUCT_SORTS, type Gender, type ProductSort } from "@/entities/catalog/types";
import {
  getAllColors,
  getAllFitTypes,
  getAllSizes,
  getCategoryOptions,
} from "@/entities/catalog/services";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export interface CatalogFilters {
  gender: Gender | "All";
  categorySlug: string | null;
  colors: string[];
  sizes: string[];
  fitTypes: string[];
  sort: ProductSort;
}

export const EMPTY_FILTERS: CatalogFilters = {
  gender: "All",
  categorySlug: null,
  colors: [],
  sizes: [],
  fitTypes: [],
  sort: "featured",
};

const GENDERS: { value: Gender | "All"; label: string }[] = [
  { value: "All", label: "Tất cả" },
  { value: "Men", label: "Nam" },
  { value: "Women", label: "Nữ" },
  { value: "Unisex", label: "Unisex" },
];

function FilterDropdown({
  label,
  count,
  children,
  className,
}: {
  label: string;
  count?: number;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Popover>
      <PopoverTrigger
        className={cn(
          "eyebrow flex items-center gap-2 border border-border px-4 py-2.5 transition-colors hover:bg-accent data-[state=open]:bg-primary data-[state=open]:text-primary-foreground",
          className,
        )}
      >
        {label}
        {count ? <span className="text-[11px]">({count})</span> : null}
        <ChevronDown className="size-3.5" />
      </PopoverTrigger>
      <PopoverContent align="start" className="w-64 rounded-none p-4">
        {children}
      </PopoverContent>
    </Popover>
  );
}

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

  const categories = getCategoryOptions();
  const activeCategory = categories.find((c) => c.slug === filters.categorySlug);

  const chips: { label: string; clear: () => void }[] = [
    ...(filters.gender !== "All"
      ? [
          {
            label: GENDERS.find((g) => g.value === filters.gender)?.label ?? filters.gender,
            clear: () => onChange({ gender: "All" }),
          },
        ]
      : []),
    ...(activeCategory
      ? [{ label: activeCategory.name, clear: () => onChange({ categorySlug: null }) }]
      : []),
    ...filters.colors.map((c) => ({
      label: c,
      clear: () => onChange({ colors: filters.colors.filter((v) => v !== c) }),
    })),
    ...filters.sizes.map((s) => ({
      label: `Size ${s}`,
      clear: () => onChange({ sizes: filters.sizes.filter((v) => v !== s) }),
    })),
    ...filters.fitTypes.map((f) => ({
      label: f,
      clear: () => onChange({ fitTypes: filters.fitTypes.filter((v) => v !== f) }),
    })),
  ];

  return (
    <div className="space-y-4 border-b border-border pb-5">
      <div className="flex flex-wrap items-center gap-2">
        <FilterDropdown label="Giới tính" count={filters.gender !== "All" ? 1 : 0}>
          <div className="flex flex-col">
            {GENDERS.map((item) => (
              <button
                key={item.value}
                type="button"
                onClick={() => onChange({ gender: item.value })}
                className={cn(
                  "flex items-center justify-between py-2 text-left text-sm",
                  filters.gender === item.value ? "font-bold" : "text-muted-foreground",
                )}
              >
                {item.label}
                {filters.gender === item.value ? <span className="size-2 bg-primary" /> : null}
              </button>
            ))}
          </div>
        </FilterDropdown>

        <FilterDropdown label="Danh mục" count={filters.categorySlug ? 1 : 0}>
          <div className="flex max-h-64 flex-col overflow-y-auto">
            <button
              type="button"
              onClick={() => onChange({ categorySlug: null })}
              className={cn(
                "py-2 text-left text-sm",
                filters.categorySlug ? "text-muted-foreground" : "font-bold",
              )}
            >
              Tất cả danh mục
            </button>
            {categories.map((category) => (
              <button
                key={category.slug}
                type="button"
                onClick={() =>
                  onChange({
                    categorySlug: filters.categorySlug === category.slug ? null : category.slug,
                  })
                }
                className={cn(
                  "py-2 text-left text-sm",
                  filters.categorySlug === category.slug ? "font-bold" : "text-muted-foreground",
                )}
              >
                {category.name}
              </button>
            ))}
          </div>
        </FilterDropdown>

        <FilterDropdown label="Màu" count={filters.colors.length}>
          <div className="grid grid-cols-2 gap-2">
            {getAllColors().map((color) => (
              <button
                key={color.name}
                type="button"
                onClick={() => onChange({ colors: toggle(filters.colors, color.name) })}
                className={cn(
                  "flex items-center gap-2 border px-2 py-1.5 text-left text-xs",
                  filters.colors.includes(color.name)
                    ? "border-primary font-semibold"
                    : "border-transparent hover:bg-accent",
                )}
              >
                <span
                  className="size-4 rounded-full border border-border"
                  style={{ backgroundColor: color.hex }}
                />
                {color.name}
              </button>
            ))}
          </div>
        </FilterDropdown>

        <FilterDropdown label="Size" count={filters.sizes.length}>
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
        </FilterDropdown>

        <FilterDropdown label="Kiểu dáng" count={filters.fitTypes.length}>
          <div className="flex flex-col">
            {getAllFitTypes().map((fit) => (
              <button
                key={fit}
                type="button"
                onClick={() => onChange({ fitTypes: toggle(filters.fitTypes, fit) })}
                className={cn(
                  "py-2 text-left text-sm",
                  filters.fitTypes.includes(fit) ? "font-bold" : "text-muted-foreground",
                )}
              >
                {fit}
              </button>
            ))}
          </div>
        </FilterDropdown>

        <div className="ml-auto">
          <FilterDropdown
            label={`Sắp xếp: ${PRODUCT_SORTS.find((s) => s.value === filters.sort)?.label ?? ""}`}
          >
            <div className="flex flex-col">
              {PRODUCT_SORTS.map((sort) => (
                <button
                  key={sort.value}
                  type="button"
                  onClick={() => onChange({ sort: sort.value })}
                  className={cn(
                    "py-2 text-left text-sm",
                    filters.sort === sort.value ? "font-bold" : "text-muted-foreground",
                  )}
                >
                  {sort.label}
                </button>
              ))}
            </div>
          </FilterDropdown>
        </div>
      </div>

      {chips.length ? (
        <div className="flex flex-wrap items-center gap-2">
          {chips.map((chip) => (
            <button
              key={chip.label}
              type="button"
              onClick={chip.clear}
              className="flex items-center gap-1.5 bg-secondary px-3 py-1.5 text-xs font-semibold"
            >
              {chip.label}
              <X className="size-3" />
            </button>
          ))}
          <Button variant="ghost" size="sm" onClick={() => onChange(EMPTY_FILTERS)}>
            Xoá tất cả
          </Button>
        </div>
      ) : null}

      <p className="text-xs text-muted-foreground">{total} sản phẩm</p>
    </div>
  );
}
