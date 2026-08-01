import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

export function Rating({
  value,
  count,
  className,
}: {
  value: number;
  count?: number;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center gap-1.5", className)}>
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={cn(
              "size-3.5",
              star <= Math.round(value) ? "fill-current text-foreground" : "text-muted-foreground/40",
            )}
          />
        ))}
      </div>
      <span className="text-xs text-muted-foreground">
        {value.toFixed(1)}
        {count != null ? ` (${count})` : ""}
      </span>
    </div>
  );
}
