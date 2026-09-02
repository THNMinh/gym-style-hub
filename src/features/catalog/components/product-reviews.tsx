import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { getProductReviewsApi } from "@/entities/social/services";
import { FIT_FEEDBACK_LABEL } from "@/entities/social/types";
import { Rating } from "@/shared/ui/rating";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { formatDate } from "@/shared/lib/format";
import {
  Image as ImageIcon,
  CheckCircle2,
  ShieldCheck,
  ShoppingBag,
  ArrowRight,
  MessageSquare,
} from "lucide-react";

export function ProductReviews({ productId }: { productId: string }) {
  // Filters State
  const [ratingFilter, setRatingFilter] = useState<number | undefined>(undefined);
  const [hasMediaFilter, setHasMediaFilter] = useState<boolean | undefined>(undefined);
  const [page, setPage] = useState(1);

  // Fetch Product Reviews Query
  const reviewsQuery = useQuery({
    queryKey: ["product-reviews", productId, ratingFilter, hasMediaFilter, page],
    queryFn: () =>
      getProductReviewsApi(productId, {
        rating: ratingFilter,
        hasMedia: hasMediaFilter,
        page,
        pageSize: 10,
      }),
  });

  const reviewData = reviewsQuery.data;
  const items = reviewData?.items || [];
  const fitSummary = reviewData?.fitFeedbackSummary;

  return (
    <section className="border-t border-border py-14 space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Đánh giá & Trải nghiệm mặc thử từ người mua</h2>
          <p className="text-xs text-muted-foreground mt-1">
            Tổng hợp nhận xét thực tế, bảng đo Form dáng chuẩn (TrueToSize) và hình ảnh mặc thử của khách hàng.
          </p>
        </div>

        <Link to="/account" search={{}}>
          <Button variant="outline" size="sm" className="gap-1.5 text-xs font-bold border-primary text-primary hover:bg-primary/10">
            <ShoppingBag className="size-3.5" /> Đánh giá sản phẩm đã mua <ArrowRight className="size-3.5" />
          </Button>
        </Link>
      </div>

      {/* Summary Header Card */}
      {reviewData && (
        <Card className="border border-border/80 shadow-sm bg-muted/20">
          <CardContent className="p-6 grid gap-6 md:grid-cols-3">
            {/* Average Rating Score */}
            <div className="flex flex-col items-center justify-center border-r-0 md:border-r border-border pr-0 md:pr-6 text-center space-y-2">
              <span className="text-4xl font-black text-primary">{reviewData.averageRating.toFixed(1)}</span>
              <Rating value={reviewData.averageRating} className="justify-center" />
              <p className="text-xs font-semibold text-muted-foreground">Dựa trên {reviewData.totalReviews} đánh giá thực tế</p>
            </div>

            {/* Fit Feedback Percentage Bars */}
            <div className="space-y-2 text-xs border-r-0 md:border-r border-border pr-0 md:pr-6">
              <h4 className="font-bold text-foreground flex items-center gap-1.5">
                <CheckCircle2 className="size-4 text-emerald-600" /> Bảng đo Form dáng thực tế từ người dùng:
              </h4>
              <div className="space-y-2">
                <div>
                  <div className="flex justify-between font-semibold">
                    <span>Vừa vặn chuẩn size (TrueToSize):</span>
                    <span className="text-emerald-600 font-bold">{fitSummary?.trueToSizePercentage.toFixed(0)}%</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-muted overflow-hidden mt-0.5">
                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${fitSummary?.trueToSizePercentage}%` }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between font-semibold">
                    <span>Form hơi nhỏ - Chật (RunsSmall):</span>
                    <span className="text-amber-600 font-bold">{fitSummary?.runsSmallPercentage.toFixed(0)}%</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-muted overflow-hidden mt-0.5">
                    <div className="h-full bg-amber-500 rounded-full" style={{ width: `${fitSummary?.runsSmallPercentage}%` }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between font-semibold">
                    <span>Form rộng rãi - Thoải mái (RunsLarge):</span>
                    <span className="text-blue-600 font-bold">{fitSummary?.runsLargePercentage.toFixed(0)}%</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-muted overflow-hidden mt-0.5">
                    <div className="h-full bg-blue-500 rounded-full" style={{ width: `${fitSummary?.runsLargePercentage}%` }} />
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Filter Buttons */}
            <div className="space-y-2 text-xs">
              <h4 className="font-bold text-foreground">Lọc bài đánh giá:</h4>
              <div className="flex flex-wrap gap-1.5">
                <Button
                  size="sm"
                  variant={ratingFilter === undefined && hasMediaFilter === undefined ? "default" : "outline"}
                  onClick={() => {
                    setRatingFilter(undefined);
                    setHasMediaFilter(undefined);
                  }}
                  className="h-7 text-xs font-semibold"
                >
                  Tất cả ({reviewData.totalReviews})
                </Button>
                {[5, 4, 3, 2, 1].map((s) => (
                  <Button
                    key={s}
                    size="sm"
                    variant={ratingFilter === s ? "default" : "outline"}
                    onClick={() => {
                      setRatingFilter(s);
                      setHasMediaFilter(undefined);
                    }}
                    className="h-7 text-xs"
                  >
                    {s} ⭐
                  </Button>
                ))}
                <Button
                  size="sm"
                  variant={hasMediaFilter === true ? "default" : "outline"}
                  onClick={() => {
                    setHasMediaFilter(true);
                    setRatingFilter(undefined);
                  }}
                  className="h-7 text-xs gap-1"
                >
                  <ImageIcon className="size-3" /> Có Ảnh/Video
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Shopee Style Callout Banner for Reviews */}
      <div className="p-4 rounded-xl border border-primary/20 bg-primary/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5 text-foreground">
          <MessageSquare className="size-5 text-primary shrink-0" />
          <span>
            <strong>Bạn đã mua sản phẩm này tại GymKitten?</strong> Hãy truy cập vào trang <strong>Đơn hàng của tôi</strong> để gửi đánh giá và nhận điểm thưởng Shopee style!
          </span>
        </div>
        <Link to="/account" search={{}}>
          <Button size="sm" className="h-8 text-xs font-bold bg-primary text-primary-foreground gap-1 shrink-0">
            Tới Đơn hàng của tôi <ArrowRight className="size-3.5" />
          </Button>
        </Link>
      </div>

      {/* Full-width Reviews List */}
      <div className="space-y-6">
        {reviewsQuery.isLoading ? (
          <div className="py-16 text-center text-xs text-muted-foreground">Đang nạp danh sách đánh giá...</div>
        ) : items.length === 0 ? (
          <div className="py-16 text-center text-xs text-muted-foreground border border-dashed rounded-xl bg-background">
            Chưa có đánh giá nào phù hợp với bộ lọc đã chọn.
          </div>
        ) : (
          items.map((review) => {
            const mediaItems = review.mediaList || review.medias || [];
            return (
              <article key={review.reviewId} className="border-b border-border/80 pb-6 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="size-9 rounded-full bg-primary/10 text-primary flex items-center justify-center font-extrabold text-xs uppercase">
                      {review.userFullName.slice(0, 2)}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-foreground flex items-center gap-2">
                        {review.userFullName}
                        <Badge variant="secondary" className="text-[10px] text-emerald-600 bg-emerald-50 font-medium">
                          <ShieldCheck className="size-3 mr-0.5" /> Đã mua hàng
                        </Badge>
                      </p>
                      <span className="text-[11px] text-muted-foreground">{formatDate(review.createdAt)}</span>
                    </div>
                  </div>
                  {review.fitFeedback && (
                    <Badge variant="outline" className="text-xs font-semibold px-3 py-1">
                      Form: {FIT_FEEDBACK_LABEL[review.fitFeedback] || review.fitFeedback}
                    </Badge>
                  )}
                </div>

                <Rating value={review.rating} className="mt-1" />

                {review.comment && <p className="text-sm text-foreground leading-relaxed pt-1">{review.comment}</p>}

                {/* Try-on Media List (Photos & Videos) */}
                {mediaItems.length > 0 && (
                  <div className="flex flex-wrap gap-2.5 pt-2">
                    {mediaItems.map((m) => (
                      <div key={m.mediaId} className="size-24 rounded-lg border overflow-hidden bg-muted relative group">
                        {m.mediaType?.toLowerCase() === "video" ? (
                          <video src={m.mediaUrl} controls className="h-full w-full object-cover" />
                        ) : (
                          <img src={m.mediaUrl} alt="Ảnh mặc thử" className="h-full w-full object-cover" />
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </article>
            );
          })
        )}
      </div>
    </section>
  );
}
