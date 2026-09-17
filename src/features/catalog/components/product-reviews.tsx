import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { getProductReviewsApi } from "@/entities/social/services";
import { FIT_FEEDBACK_LABEL } from "@/entities/social/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { formatDate } from "@/shared/lib/format";
import {
  Star,
  CheckCircle2,
  ShoppingBag,
  ArrowRight,
  MessageSquare,
  Search,
  Image as ImageIcon,
  ThumbsUp,
  ThumbsDown,
  RotateCcw,
  Check,
  Maximize2,
  SlidersHorizontal,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export function ProductReviews({ productId }: { productId: string }) {
  // Query Filters State
  const [ratingFilter, setRatingFilter] = useState<number | undefined>(undefined);
  const [hasMediaFilter, setHasMediaFilter] = useState<boolean | undefined>(undefined);
  const [page, setPage] = useState(1);

  // Local Search & Sort State (Gymshark Style)
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"newest" | "highest" | "lowest">("newest");
  const [activeTab, setActiveTab] = useState<"fit" | "quality">("fit");

  // Lightbox Media Preview
  const [previewMedia, setPreviewMedia] = useState<{ url: string; type: string } | null>(null);

  // Helpfulness reactions state (reviewId -> { likes, dislikes, action })
  const [reactions, setReactions] = useState<
    Record<string, { likes: number; dislikes: number; userAction: "like" | "dislike" | null }>
  >({});

  // Fetch Reviews Query
  const reviewsQuery = useQuery({
    queryKey: ["product-reviews", productId, ratingFilter, hasMediaFilter, page],
    queryFn: () =>
      getProductReviewsApi(productId, {
        rating: ratingFilter,
        hasMedia: hasMediaFilter,
        page,
        pageSize: 20,
      }),
  });

  const reviewData = reviewsQuery.data;
  const rawItems = reviewData?.items || [];
  const fitSummary = reviewData?.fitFeedbackSummary;
  const fitTotal = useMemo(() => {
    if (!fitSummary) return 0;
    return (fitSummary.trueToSizeCount || 0) + (fitSummary.runsSmallCount || 0) + (fitSummary.runsLargeCount || 0);
  }, [fitSummary]);
  const hasFitData = fitTotal > 0;
  const trueToSize = hasFitData ? (fitSummary?.trueToSizePercentage ?? 0) : 0;
  const runsSmall = hasFitData ? (fitSummary?.runsSmallPercentage ?? 0) : 0;
  const runsLarge = hasFitData ? (fitSummary?.runsLargePercentage ?? 0) : 0;
  const breakdown = reviewData?.ratingBreakdown;
  const totalReviews = reviewData?.totalReviews || 0;
  const averageRating = reviewData?.averageRating || 0;

  // Calculate Breakdown counts and percentages
  const counts = useMemo(() => {
    return {
      5: breakdown?.fiveStar ?? rawItems.filter((r) => r.rating === 5).length,
      4: breakdown?.fourStar ?? rawItems.filter((r) => r.rating === 4).length,
      3: breakdown?.threeStar ?? rawItems.filter((r) => r.rating === 3).length,
      2: breakdown?.twoStar ?? rawItems.filter((r) => r.rating === 2).length,
      1: breakdown?.oneStar ?? rawItems.filter((r) => r.rating === 1).length,
    };
  }, [breakdown, rawItems]);

  // % of customers who recommend (4 & 5 stars)
  const recommendPercentage = useMemo(() => {
    if (!totalReviews) return 0;
    const positive = counts[5] + counts[4];
    return Math.min(100, Math.round((positive / totalReviews) * 100));
  }, [totalReviews, counts]);

  // Filter & Sort reviews locally
  const filteredAndSortedItems = useMemo(() => {
    let list = [...rawItems];

    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      list = list.filter(
        (r) =>
          r.comment?.toLowerCase().includes(q) ||
          (r.userFullName || r.authorName || "").toLowerCase().includes(q)
      );
    }

    if (sortBy === "highest") {
      list.sort((a, b) => b.rating - a.rating);
    } else if (sortBy === "lowest") {
      list.sort((a, b) => a.rating - b.rating);
    } else {
      list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    return list;
  }, [rawItems, searchQuery, sortBy]);

  // Handle Helpfulness Thumbs
  const handleReaction = (reviewId: string, type: "like" | "dislike") => {
    setReactions((prev) => {
      const curr = prev[reviewId] || { likes: 0, dislikes: 0, userAction: null };
      if (curr.userAction === type) {
        // Toggle off
        return {
          ...prev,
          [reviewId]: {
            ...curr,
            likes: type === "like" ? Math.max(0, curr.likes - 1) : curr.likes,
            dislikes: type === "dislike" ? Math.max(0, curr.dislikes - 1) : curr.dislikes,
            userAction: null,
          },
        };
      }
      // Switch or vote
      return {
        ...prev,
        [reviewId]: {
          likes: type === "like" ? curr.likes + 1 : curr.userAction === "like" ? curr.likes - 1 : curr.likes,
          dislikes:
            type === "dislike" ? curr.dislikes + 1 : curr.userAction === "dislike" ? curr.dislikes - 1 : curr.dislikes,
          userAction: type,
        },
      };
    });
  };

  const handleResetFilters = () => {
    setRatingFilter(undefined);
    setHasMediaFilter(undefined);
    setSearchQuery("");
    setSortBy("newest");
    setPage(1);
  };

  return (
    <section className="border-t border-border py-12 md:py-16 space-y-10">
      {/* 1. Header & Call-to-action */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-black uppercase tracking-wider text-foreground">
            REVIEWS ({totalReviews})
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Tổng hợp nhận xét thực tế, đánh giá form dáng chuẩn và hình ảnh mặc thử từ người mua.
          </p>
        </div>

        <Link to="/account" search={{}}>
          <Button
            size="sm"
            variant="outline"
            className="text-xs font-bold gap-2 border-foreground/20 hover:border-foreground transition-all"
          >
            <ShoppingBag className="size-3.5" />
            Đánh giá sản phẩm đã mua
            <ArrowRight className="size-3.5" />
          </Button>
        </Link>
      </div>

      {/* 2. Top Summary Section - Gymshark 2-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 pb-8 border-b border-border/80">
        {/* Left Column: Big Score, Gold Stars, Recommendation, Rating Snapshot (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <span className="text-5xl md:text-6xl font-black text-foreground tracking-tight">
                {averageRating.toFixed(1)}
              </span>
              <div className="space-y-1">
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      className={`size-5 ${
                        s <= Math.round(averageRating)
                          ? "fill-amber-400 text-amber-400"
                          : "fill-muted text-muted-foreground/30"
                      }`}
                    />
                  ))}
                </div>
                <div className="text-xs font-semibold text-muted-foreground">
                  Dựa trên {totalReviews} đánh giá thực tế
                </div>
              </div>
            </div>

            {totalReviews > 0 ? (
              <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-foreground/90 pt-1">
                <Check className="size-4 text-emerald-600 dark:text-emerald-400 stroke-[3]" />
                <span>{recommendPercentage}% khách hàng khuyên dùng sản phẩm này</span>
              </div>
            ) : (
              <div className="text-xs text-muted-foreground pt-1">
                Chưa có đánh giá nào cho sản phẩm này
              </div>
            )}
          </div>

          {/* RATING SNAPSHOT (Gymshark Style) */}
          <div className="space-y-2 pt-2">
            <div className="text-xs font-extrabold uppercase tracking-wider text-foreground">
              RATING SNAPSHOT
            </div>

            <div className="space-y-1.5">
              {[5, 4, 3, 2, 1].map((star) => {
                const count = counts[star as keyof typeof counts] || 0;
                const pct = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
                const isSelected = ratingFilter === star;

                return (
                  <button
                    key={star}
                    type="button"
                    onClick={() => {
                      setRatingFilter(isSelected ? undefined : star);
                      setPage(1);
                    }}
                    className={`group w-full flex items-center gap-3 text-xs py-1 px-1.5 rounded transition-colors text-left ${
                      isSelected ? "bg-muted font-bold text-foreground" : "hover:bg-muted/40 text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <span className="w-10 shrink-0 font-bold">
                      {star} <span className="font-normal opacity-80">({count})</span>
                    </span>

                    {/* Progress Bar (Gymshark Thin Solid Bar) */}
                    <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden relative">
                      <div
                        className="h-full bg-foreground rounded-full transition-all duration-300 group-hover:bg-primary"
                        style={{ width: `${pct}%` }}
                      />
                    </div>

                    <span className="w-10 text-right text-[11px] font-mono shrink-0">
                      {pct.toFixed(0)}%
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Gymshark Style AVERAGE RATINGS / FIT & SIZING (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="text-xs font-extrabold uppercase tracking-wider text-foreground">
              ĐÁNH GIÁ FORM DÁNG (FIT & SIZING)
            </div>

            {/* Quality / Value Toggle */}
            <div className="flex rounded-md border border-border p-0.5 bg-muted/30 text-[11px] font-bold">
              <button
                type="button"
                onClick={() => setActiveTab("fit")}
                className={`px-2.5 py-1 rounded transition-colors ${
                  activeTab === "fit" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Form dáng
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("quality")}
                className={`px-2.5 py-1 rounded transition-colors ${
                  activeTab === "quality" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Chất lượng
              </button>
            </div>
          </div>

          {activeTab === "fit" ? (
            <div className="space-y-4 p-4 rounded-xl border border-border bg-card/60">
              {/* Sizing Slider Scale (Gymshark Style) */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-[11px] font-bold text-muted-foreground uppercase">
                  <span>Hơi nhỏ</span>
                  <span className="text-foreground font-black">Chuẩn size (True to size)</span>
                  <span>Hơi rộng</span>
                </div>

                <div className="relative h-2 w-full bg-muted rounded-full overflow-hidden">
                  {hasFitData && trueToSize > 0 && (
                    <div
                      className="absolute top-0 bottom-0 bg-emerald-500 rounded-full transition-all"
                      style={{
                        left: `${runsSmall}%`,
                        width: `${trueToSize}%`,
                      }}
                    />
                  )}
                </div>
              </div>

              {/* Breakdown Bars for Fit */}
              <div className="space-y-2.5 pt-1 text-xs">
                <div>
                  <div className="flex justify-between font-semibold">
                    <span className="flex items-center gap-1.5 text-foreground">
                      <CheckCircle2 className="size-3.5 text-emerald-600" /> Vừa vặn chuẩn size (TrueToSize)
                    </span>
                    <span className="font-bold text-emerald-600">
                      {trueToSize.toFixed(0)}%
                    </span>
                  </div>
                  <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden mt-1">
                    <div
                      className="h-full bg-emerald-500 rounded-full"
                      style={{ width: `${trueToSize}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between font-semibold">
                    <span className="text-muted-foreground">Form hơi nhỏ - Chật (RunsSmall)</span>
                    <span className="font-bold text-amber-600">
                      {runsSmall.toFixed(0)}%
                    </span>
                  </div>
                  <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden mt-1">
                    <div
                      className="h-full bg-amber-500 rounded-full"
                      style={{ width: `${runsSmall}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between font-semibold">
                    <span className="text-muted-foreground">Form rộng rãi - Thoải mái (RunsLarge)</span>
                    <span className="font-bold text-blue-600">
                      {runsLarge.toFixed(0)}%
                    </span>
                  </div>
                  <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden mt-1">
                    <div
                      className="h-full bg-blue-500 rounded-full"
                      style={{ width: `${runsLarge}%` }}
                    />
                  </div>
                </div>

                {!hasFitData && (
                  <p className="text-[11px] text-muted-foreground text-center pt-1 italic">
                    Chưa có đánh giá form dáng cho sản phẩm này.
                  </p>
                )}
              </div>
            </div>
          ) : (
            /* Quality & Durability Gauge */
            <div className="space-y-4 p-4 rounded-xl border border-border bg-card/60">
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold text-foreground">
                  <span>Mức độ hài lòng chất liệu vải</span>
                  <span className="text-primary font-black">{averageRating.toFixed(1)} / 5.0</span>
                </div>

                <div className="flex justify-between text-[10px] text-muted-foreground uppercase font-semibold">
                  <span>1 Star</span>
                  <span>5 Star</span>
                </div>

                <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-foreground rounded-full"
                    style={{ width: `${(averageRating / 5) * 100}%` }}
                  />
                </div>
              </div>

              <p className="text-xs text-muted-foreground leading-relaxed">
                Vải co giãn 4 chiều, kiểm soát mồ hôi và thoáng khí đạt chuẩn thi đấu theo phản hồi từ khách hàng.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* 3. Shopee Style Encouragement Banner */}
      <div className="p-4 rounded-xl border border-border bg-muted/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5 text-foreground">
          <MessageSquare className="size-4 text-primary shrink-0" />
          <span>
            <strong>Bạn đã mua sản phẩm này tại GymKitten?</strong> Truy cập vào <strong>Đơn hàng của tôi</strong> để gửi đánh giá và nhận điểm thưởng thành viên!
          </span>
        </div>
        <Link to="/account" search={{}}>
          <Button size="sm" className="h-8 text-xs font-bold bg-primary text-primary-foreground gap-1 shrink-0">
            Tới Đơn hàng của tôi <ArrowRight className="size-3" />
          </Button>
        </Link>
      </div>

      {/* 4. Filter & Search Toolbar (Gymshark Style) */}
      <div className="space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              id="input-search-reviews"
              placeholder="Tìm kiếm nhận xét (chất vải, form dáng, độ bền...)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-10 text-xs bg-background"
            />
          </div>

          {/* Quick Filters / Controls */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Sort Dropdown */}
            <div className="flex items-center gap-1.5 text-xs font-semibold">
              <span className="text-muted-foreground whitespace-nowrap">Sắp xếp:</span>
              <select
                id="select-sort-reviews"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="h-9 px-2.5 text-xs bg-background border border-input rounded-md focus:outline-none focus:ring-1 focus:ring-ring font-medium"
              >
                <option value="newest">Mới nhất</option>
                <option value="highest">Đánh giá cao nhất</option>
                <option value="lowest">Đánh giá thấp nhất</option>
              </select>
            </div>

            {/* Media Filter Button */}
            <Button
              id="btn-filter-media"
              type="button"
              size="sm"
              variant={hasMediaFilter ? "default" : "outline"}
              onClick={() => {
                setHasMediaFilter(!hasMediaFilter ? true : undefined);
                setPage(1);
              }}
              className="h-9 text-xs gap-1.5 font-semibold"
            >
              <ImageIcon className="size-3.5" />
              Có hình ảnh / video
            </Button>

            {/* Clear Filters */}
            {(ratingFilter !== undefined || hasMediaFilter !== undefined || searchQuery) && (
              <Button
                id="btn-clear-review-filters"
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleResetFilters}
                className="h-9 text-xs text-muted-foreground hover:text-foreground gap-1"
              >
                <RotateCcw className="size-3" /> Đặt lại bộ lọc
              </Button>
            )}
          </div>
        </div>

        {/* Rating Pills (All, 5, 4, 3, 2, 1) */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          <Button
            size="sm"
            variant={ratingFilter === undefined ? "default" : "outline"}
            onClick={() => {
              setRatingFilter(undefined);
              setPage(1);
            }}
            className="h-7 text-xs font-semibold px-3"
          >
            Tất cả ({totalReviews})
          </Button>

          {[5, 4, 3, 2, 1].map((star) => {
            const count = counts[star as keyof typeof counts] || 0;
            const isSelected = ratingFilter === star;

            return (
              <Button
                key={star}
                size="sm"
                variant={isSelected ? "default" : "outline"}
                onClick={() => {
                  setRatingFilter(isSelected ? undefined : star);
                  setPage(1);
                }}
                className="h-7 text-xs px-2.5 gap-1"
              >
                <span>{star}</span>
                <Star className="size-3 fill-amber-400 text-amber-400" />
                <span className="text-[10px] opacity-75">({count})</span>
              </Button>
            );
          })}
        </div>
      </div>

      {/* 5. Reviews List (Gymshark 2-Column Responsive Layout) */}
      <div className="divide-y divide-border">
        {reviewsQuery.isLoading ? (
          <div className="py-16 text-center text-xs text-muted-foreground flex flex-col items-center gap-2">
            <div className="size-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            <span>Đang tải danh sách đánh giá...</span>
          </div>
        ) : filteredAndSortedItems.length === 0 ? (
          <div className="py-16 text-center text-xs text-muted-foreground border border-dashed rounded-xl bg-background mt-4 space-y-2">
            <SlidersHorizontal className="size-6 mx-auto text-muted-foreground/50" />
            <p className="font-semibold text-sm text-foreground">Không tìm thấy bài đánh giá nào</p>
            <p className="text-xs">Hãy thử thay đổi điều kiện lọc hoặc từ khóa tìm kiếm</p>
            <Button size="sm" variant="outline" onClick={handleResetFilters} className="text-xs mt-2">
              Xóa bộ lọc
            </Button>
          </div>
        ) : (
          filteredAndSortedItems.map((review) => {
            const mediaItems = review.mediaList || review.medias || [];
            const reactionState = reactions[review.reviewId] || { likes: 0, dislikes: 0, userAction: null };

            return (
              <article
                key={review.reviewId}
                className="py-7 grid grid-cols-1 md:grid-cols-[220px_1fr] gap-4 md:gap-8 items-start group"
              >
                {/* Left Column: Reviewer Metadata (Gymshark Style) */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2.5">
                    <div className="size-9 rounded-full bg-primary/10 text-primary font-black text-xs flex items-center justify-center uppercase shrink-0">
                      {(review.userFullName || review.authorName || "GK").slice(0, 2)}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-foreground truncate">
                        {review.userFullName || review.authorName || "Khách hàng"}
                      </p>
                      <div className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                        <CheckCircle2 className="size-3 text-emerald-500 shrink-0" />
                        <span>Đã mua hàng</span>
                      </div>
                    </div>
                  </div>

                  {/* Fit Feedback Badge */}
                  {review.fitFeedback && (
                    <div className="pt-1">
                      <Badge
                        variant="outline"
                        className="text-[11px] font-medium px-2 py-0.5 border-border bg-muted/30"
                      >
                        {FIT_FEEDBACK_LABEL[review.fitFeedback] || review.fitFeedback}
                      </Badge>
                    </div>
                  )}

                  <div className="text-[11px] text-muted-foreground">
                    {formatDate(review.createdAt)}
                  </div>
                </div>

                {/* Right Column: Stars, Comment, Media Gallery, Helpfulness */}
                <div className="space-y-3">
                  {/* Rating Stars */}
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-0.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`size-4 ${
                            star <= review.rating
                              ? "fill-amber-400 text-amber-400"
                              : "fill-muted text-muted-foreground/30"
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-xs font-bold text-foreground">{review.rating}.0</span>
                  </div>

                  {/* Review Text */}
                  {review.comment ? (
                    <p className="text-sm text-foreground/90 leading-relaxed font-normal whitespace-pre-line">
                      {review.comment}
                    </p>
                  ) : (
                    <p className="text-xs italic text-muted-foreground">
                      Người mua không để lại nhận xét bằng lời.
                    </p>
                  )}

                  {/* Try-on Media Thumbnails */}
                  {mediaItems.length > 0 && (
                    <div className="flex flex-wrap gap-2.5 pt-1">
                      {mediaItems.map((m) => (
                        <button
                          key={m.mediaId}
                          type="button"
                          onClick={() => setPreviewMedia({ url: m.mediaUrl, type: m.mediaType })}
                          className="size-20 rounded-lg border border-border overflow-hidden bg-muted relative group/media cursor-pointer transition-transform hover:scale-105"
                          title="Nhấp để xem toàn màn hình"
                        >
                          {m.mediaType?.toLowerCase() === "video" ? (
                            <video src={m.mediaUrl} className="h-full w-full object-cover" />
                          ) : (
                            <img src={m.mediaUrl} alt="Ảnh mặc thử" className="h-full w-full object-cover" />
                          )}
                          <div className="absolute inset-0 bg-black/30 opacity-0 group-hover/media:opacity-100 flex items-center justify-center transition-opacity text-white">
                            <Maximize2 className="size-4" />
                          </div>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Helpful Reaction Bar (Gymshark Style) */}
                  <div className="flex items-center gap-3 pt-2 text-xs text-muted-foreground">
                    <span className="text-[11px]">Đánh giá này hữu ích?</span>
                    <button
                      type="button"
                      onClick={() => handleReaction(review.reviewId, "like")}
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded border text-[11px] transition-colors ${
                        reactionState.userAction === "like"
                          ? "border-primary bg-primary/10 text-primary font-bold"
                          : "border-border hover:bg-muted text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <ThumbsUp className="size-3" />
                      <span>{reactionState.likes}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleReaction(review.reviewId, "dislike")}
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded border text-[11px] transition-colors ${
                        reactionState.userAction === "dislike"
                          ? "border-destructive bg-destructive/10 text-destructive font-bold"
                          : "border-border hover:bg-muted text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <ThumbsDown className="size-3" />
                      <span>{reactionState.dislikes}</span>
                    </button>
                  </div>
                </div>
              </article>
            );
          })
        )}
      </div>

      {/* 6. Media Lightbox Modal */}
      <Dialog open={!!previewMedia} onOpenChange={(open) => !open && setPreviewMedia(null)}>
        <DialogContent className="max-w-3xl p-2 bg-black/95 border-neutral-800 text-white">
          <DialogHeader className="p-2">
            <DialogTitle className="text-sm font-bold text-neutral-300">
              Hình ảnh & Video trải nghiệm mặc thử
            </DialogTitle>
          </DialogHeader>

          <div className="flex items-center justify-center p-2 max-h-[75vh] overflow-hidden">
            {previewMedia?.type?.toLowerCase() === "video" ? (
              <video src={previewMedia.url} controls autoPlay className="max-h-[70vh] w-auto rounded-md" />
            ) : (
              <img
                src={previewMedia?.url}
                alt="Xem ảnh lớn"
                className="max-h-[70vh] w-auto object-contain rounded-md"
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
}
