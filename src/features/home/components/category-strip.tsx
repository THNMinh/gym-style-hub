import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { getCategories } from "@/entities/catalog/services";
import type { Category } from "@/entities/catalog/types";

export function CategoryStrip() {
  const query = useQuery({ queryKey: ["categories"], queryFn: getCategories });

  const categoryList: Category[] = Array.isArray(query.data)
    ? query.data
    : (query.data as any)?.items || [];

  const categories = categoryList.filter((c) => c.parentCategoryId !== null);

  return (
    <section className="mx-auto max-w-[1600px] px-4 pt-14 lg:px-8">
      <h2 className="text-2xl md:text-3xl">Mua theo danh mục</h2>
      <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-5">
        {categories.map((category) => (
          <Link
            key={category.categoryId}
            to="/products"
            search={{}}
            className="border border-border px-5 py-8 transition-colors hover:bg-primary hover:text-primary-foreground"
          >
            <p className="font-display text-lg font-extrabold uppercase">{category.name}</p>
            <p className="mt-1 text-xs opacity-70">{category.description}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
