import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { createProductReview, getProductReviews } from "@/entities/social/services";
import { FIT_FEEDBACK_LABEL, type FitFeedback } from "@/entities/social/types";
import { Rating } from "@/shared/ui/rating";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { formatDate } from "@/shared/lib/format";
import { useAuthStore } from "@/features/auth/store";
import { cn } from "@/lib/utils";

export function ProductReviews({ productId }: { productId: string }) {
  const queryClient = useQueryClient();
  const user = useAuthStore((s) => s.user);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [fit, setFit] = useState<FitFeedback>("TrueToSize");
  const [name, setName] = useState("");

  const reviews = useQuery({
    queryKey: ["reviews", productId],
    queryFn: () => getProductReviews(productId),
  });

  const mutation = useMutation({
    mutationFn: () =>
      createProductReview({
        productId,
        rating,
        comment: comment.trim() || null,
        fitFeedback: fit,
        authorName: user?.fullName ?? name.trim() ?? "Khách",
      }),
    onSuccess: () => {
      setComment("");
      toast.success("Cảm ơn bạn đã đánh giá!");
      queryClient.invalidateQueries({ queryKey: ["reviews", productId] });
    },
  });

  const items = reviews.data ?? [];

  return (
    <section className="border-t border-border py-14">
      <h2 className="text-2xl">Đánh giá từ khách hàng</h2>

      <div className="mt-8 grid gap-12 lg:grid-cols-[1fr_360px]">
        <div className="space-y-8">
          {items.length === 0 ? (
            <p className="text-sm text-muted-foreground">Chưa có đánh giá nào cho sản phẩm này.</p>
          ) : (
            items.map((review) => (
              <article key={review.reviewId} className="border-b border-border pb-6">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-bold">{review.authorName}</p>
                  <span className="text-xs text-muted-foreground">{formatDate(review.createdAt)}</span>
                </div>
                <Rating value={review.rating} className="mt-1" />
                {review.comment ? <p className="mt-3 text-sm">{review.comment}</p> : null}
                {review.fitFeedback ? (
                  <p className="mt-2 text-xs text-muted-foreground">
                    Form dáng: {FIT_FEEDBACK_LABEL[review.fitFeedback]}
                  </p>
                ) : null}
              </article>
            ))
          )}
        </div>

        <form
          className="h-fit border border-border p-6"
          onSubmit={(event) => {
            event.preventDefault();
            mutation.mutate();
          }}
        >
          <h3 className="text-lg">Viết đánh giá</h3>

          <div className="mt-4 flex gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                className={cn(
                  "size-9 border text-sm font-bold",
                  star <= rating ? "border-primary bg-primary text-primary-foreground" : "border-border",
                )}
              >
                {star}
              </button>
            ))}
          </div>

          {!user ? (
            <Input
              className="mt-4"
              placeholder="Tên hiển thị"
              value={name}
              onChange={(event) => setName(event.target.value)}
              required
            />
          ) : null}

          <Textarea
            className="mt-4"
            rows={4}
            placeholder="Chất liệu, form dáng, cảm nhận khi tập..."
            value={comment}
            onChange={(event) => setComment(event.target.value)}
          />

          <div className="mt-4 flex flex-wrap gap-2">
            {(Object.keys(FIT_FEEDBACK_LABEL) as FitFeedback[]).map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => setFit(key)}
                className={cn(
                  "border px-3 py-1.5 text-xs",
                  fit === key ? "border-primary bg-primary text-primary-foreground" : "border-border",
                )}
              >
                {FIT_FEEDBACK_LABEL[key]}
              </button>
            ))}
          </div>

          <Button type="submit" className="mt-5 w-full" disabled={mutation.isPending}>
            {mutation.isPending ? "Đang gửi..." : "Gửi đánh giá"}
          </Button>
        </form>
      </div>
    </section>
  );
}
