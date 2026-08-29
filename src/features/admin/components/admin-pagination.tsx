import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AdminPaginationProps {
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  onPageChange: (newPage: number) => void;
}

export function AdminPagination({
  page,
  pageSize,
  totalCount,
  totalPages,
  onPageChange,
}: AdminPaginationProps) {
  if (totalCount === 0) return null;

  const fromIndex = (page - 1) * pageSize + 1;
  const toIndex = Math.min(page * pageSize, totalCount);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-4 py-3 bg-muted/30 border-t border-border text-xs">
      <div className="text-muted-foreground">
        Hiển thị <span className="font-bold text-foreground">{fromIndex}</span> -{" "}
        <span className="font-bold text-foreground">{toIndex}</span> trên tổng{" "}
        <span className="font-bold text-foreground">{totalCount}</span> bản ghi
      </div>

      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          className="h-8 px-2 text-xs font-semibold gap-1"
        >
          <ChevronLeft className="size-4" /> Trang trước
        </Button>

        <div className="px-3 py-1 bg-background border rounded font-mono font-bold text-foreground">
          Trang {page} / {totalPages || 1}
        </div>

        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
          className="h-8 px-2 text-xs font-semibold gap-1"
        >
          Trang sau <ChevronRight className="size-4" />
        </Button>
      </div>
    </div>
  );
}
