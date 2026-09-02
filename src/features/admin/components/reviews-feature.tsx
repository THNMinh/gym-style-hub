import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Star, Trash2, RefreshCw, ShieldAlert, Image as ImageIcon } from "lucide-react";
import { getAdminReviewsApi, deleteAdminReviewApi } from "@/entities/social/services";
import { FIT_FEEDBACK_LABEL } from "@/entities/social/types";
import { formatDate } from "@/shared/lib/format";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Rating } from "@/shared/ui/rating";
import { AdminPagination } from "./admin-pagination";

export function ReviewsFeature() {
  const queryClient = useQueryClient();
  const [ratingFilter, setRatingFilter] = useState<number | undefined>(undefined);
  const [page, setPage] = useState(1);

  // Admin Reviews Query
  const { data, isLoading, refetch } = useQuery({
    queryKey: ["admin-reviews", ratingFilter, page],
    queryFn: () =>
      getAdminReviewsApi({
        rating: ratingFilter,
        page,
        pageSize: 15,
      }),
  });

  const reviews = data?.items || [];

  // Delete Spam Review Mutation
  const deleteMutation = useMutation({
    mutationFn: deleteAdminReviewApi,
    onSuccess: () => {
      toast.success("Xóa đánh giá vi phạm thành công!");
      queryClient.invalidateQueries({ queryKey: ["admin-reviews"] });
    },
    onError: (err: Error) => toast.error(`Lỗi xóa đánh giá: ${err.message}`),
  });

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Quản lý Kiểm duyệt Đánh giá (Reviews Moderation)</h1>
          <p className="text-xs text-muted-foreground mt-1">
            Xem tất cả đánh giá, kiểm tra ảnh/video mặc thử và Xóa bài viết spam / vi phạm (`DELETE /api/admin/reviews/{`{id}`}`)
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => refetch()} className="gap-2">
          <RefreshCw className="size-4" /> Làm mới
        </Button>
      </div>

      {/* Filter Bar */}
      <Card className="border border-border/80 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-bold flex items-center gap-2">
            <Star className="size-4 text-amber-500 fill-amber-500" /> Bộ lọc số sao đánh giá
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Button
            size="sm"
            variant={ratingFilter === undefined ? "default" : "outline"}
            onClick={() => {
              setRatingFilter(undefined);
              setPage(1);
            }}
            className="h-8 text-xs font-semibold"
          >
            Tất cả sao
          </Button>
          {[5, 4, 3, 2, 1].map((s) => (
            <Button
              key={s}
              size="sm"
              variant={ratingFilter === s ? "default" : "outline"}
              onClick={() => {
                setRatingFilter(s);
                setPage(1);
              }}
              className="h-8 text-xs font-semibold gap-1"
            >
              {s} <Star className="size-3 fill-amber-500 text-amber-500" />
            </Button>
          ))}
        </CardContent>
      </Card>

      {/* Reviews Data Table */}
      <Card className="border border-border/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted/50 border-b border-border text-xs uppercase font-bold text-muted-foreground">
              <tr>
                <th className="py-3.5 px-4">Người đánh giá</th>
                <th className="py-3.5 px-4 text-center">Số sao</th>
                <th className="py-3.5 px-4">Cảm nhận Form</th>
                <th className="py-3.5 px-4">Nội dung chia sẻ</th>
                <th className="py-3.5 px-4">Ảnh / Video mặc thử</th>
                <th className="py-3.5 px-4">Ngày tạo</th>
                <th className="py-3.5 px-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-muted-foreground">
                    Đang nạp danh sách đánh giá...
                  </td>
                </tr>
              ) : !reviews || reviews.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-muted-foreground">
                    Chưa có bài đánh giá nào khớp với điều kiện lọc.
                  </td>
                </tr>
              ) : (
                reviews.map((rev) => {
                  const mediaItems = rev.mediaList || rev.medias || [];
                  return (
                    <tr key={rev.reviewId} className="hover:bg-muted/30 transition-colors">
                      <td className="py-3.5 px-4">
                        <p className="font-bold text-foreground">{rev.userFullName}</p>
                        <p className="text-[11px] text-muted-foreground font-mono">User ID: {rev.userId}</p>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <Rating value={rev.rating} className="justify-center" />
                      </td>
                      <td className="py-3.5 px-4">
                        {rev.fitFeedback ? (
                          <Badge variant="outline" className="text-xs">
                            {FIT_FEEDBACK_LABEL[rev.fitFeedback] || rev.fitFeedback}
                          </Badge>
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 max-w-xs">
                        <p className="text-xs text-foreground line-clamp-2">{rev.comment || "Không có bình luận"}</p>
                      </td>
                      <td className="py-3.5 px-4">
                        {mediaItems.length > 0 ? (
                          <div className="flex gap-1">
                            {mediaItems.map((m) => (
                              <div key={m.mediaId} className="size-10 rounded border overflow-hidden bg-muted">
                                {m.mediaType?.toLowerCase() === "video" ? (
                                  <video src={m.mediaUrl} className="h-full w-full object-cover" />
                                ) : (
                                  <img src={m.mediaUrl} alt="Review media" className="h-full w-full object-cover" />
                                )}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground">Không có media</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-xs text-muted-foreground font-mono">
                        {formatDate(rev.createdAt)}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <Button
                          size="sm"
                          variant="ghost"
                          disabled={deleteMutation.isPending}
                          onClick={() => {
                            if (confirm("Bạn có chắc chắn muốn xóa bài đánh giá này?")) {
                              deleteMutation.mutate(rev.reviewId);
                            }
                          }}
                          className="h-8 text-xs text-destructive hover:bg-destructive/10 font-semibold"
                        >
                          <Trash2 className="size-3.5 mr-1" /> Xóa bài
                        </Button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <AdminPagination
          page={page}
          pageSize={15}
          totalCount={data?.totalCount || reviews.length}
          totalPages={data?.totalPages || 1}
          onPageChange={setPage}
        />
      </Card>
    </div>
  );
}
