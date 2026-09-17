import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Star,
  Trash2,
  RefreshCw,
  Eye,
  Mail,
  User,
  Package,
  ExternalLink,
  Calendar,
  Image as ImageIcon,
  CheckCircle2,
} from "lucide-react";
import { getAdminReviewsApi, deleteAdminReviewApi } from "@/entities/social/services";
import type { ReviewItemDto } from "@/entities/social/types";
import { FIT_FEEDBACK_LABEL } from "@/entities/social/types";
import { formatDate } from "@/shared/lib/format";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Rating } from "@/shared/ui/rating";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { AdminPagination } from "./admin-pagination";

export function ReviewsFeature() {
  const queryClient = useQueryClient();
  const [ratingFilter, setRatingFilter] = useState<number | undefined>(undefined);
  const [page, setPage] = useState(1);
  const [selectedReview, setSelectedReview] = useState<ReviewItemDto | null>(null);

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
      setSelectedReview(null);
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
            Xem tất cả đánh giá, kiểm tra ảnh/video mặc thử và kiểm duyệt bài viết spam hoặc vi phạm.
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
                <th className="py-3.5 px-4">Sản phẩm</th>
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
                  <td colSpan={8} className="py-12 text-center text-muted-foreground">
                    Đang nạp danh sách đánh giá...
                  </td>
                </tr>
              ) : !reviews || reviews.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-muted-foreground">
                    Chưa có bài đánh giá nào khớp với điều kiện lọc.
                  </td>
                </tr>
              ) : (
                reviews.map((rev) => {
                  const mediaItems = rev.mediaList || rev.medias || [];
                  const customerName = rev.customerFullName || rev.userFullName || "Khách hàng";
                  const customerEmail = rev.customerEmail || "Chưa có email";
                  const productName = rev.productName || "Sản phẩm";

                  return (
                    <tr key={rev.reviewId} className="hover:bg-muted/30 transition-colors">
                      {/* Người đánh giá (Họ tên + Email) */}
                      <td className="py-3.5 px-4">
                        <p className="font-bold text-foreground flex items-center gap-1.5">
                          <User className="size-3.5 text-muted-foreground shrink-0" />
                          <span>{customerName}</span>
                        </p>
                        <p className="text-xs text-muted-foreground flex items-center gap-1.5 mt-0.5">
                          <Mail className="size-3 text-muted-foreground shrink-0" />
                          <span>{customerEmail}</span>
                        </p>
                      </td>

                      {/* Sản phẩm */}
                      <td className="py-3.5 px-4 max-w-[200px]">
                        <p className="font-semibold text-foreground truncate">{productName}</p>
                        <a
                          href={`/products/${rev.productId}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[11px] text-primary hover:underline inline-flex items-center gap-1 mt-0.5"
                        >
                          <span>Xem sản phẩm</span>
                          <ExternalLink className="size-2.5" />
                        </a>
                      </td>

                      {/* Số sao */}
                      <td className="py-3.5 px-4 text-center">
                        <Rating value={rev.rating} className="justify-center" />
                      </td>

                      {/* Cảm nhận Form */}
                      <td className="py-3.5 px-4">
                        {rev.fitFeedback ? (
                          <Badge variant="outline" className="text-xs font-semibold">
                            {FIT_FEEDBACK_LABEL[rev.fitFeedback] || rev.fitFeedback}
                          </Badge>
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </td>

                      {/* Nội dung chia sẻ */}
                      <td className="py-3.5 px-4 max-w-xs">
                        <p className="text-xs text-foreground line-clamp-2">{rev.comment || "Không có bình luận"}</p>
                      </td>

                      {/* Ảnh / Video mặc thử */}
                      <td className="py-3.5 px-4">
                        {mediaItems.length > 0 ? (
                          <div className="flex gap-1.5">
                            {mediaItems.map((m) => (
                              <div
                                key={m.mediaId}
                                onClick={() => setSelectedReview(rev)}
                                className="size-10 rounded border overflow-hidden bg-muted cursor-pointer hover:opacity-80 transition-opacity shrink-0"
                              >
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

                      {/* Ngày tạo */}
                      <td className="py-3.5 px-4 text-xs text-muted-foreground whitespace-nowrap">
                        {formatDate(rev.createdAt)}
                      </td>

                      {/* Thao tác */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setSelectedReview(rev)}
                            className="h-8 text-xs font-semibold gap-1"
                          >
                            <Eye className="size-3.5" /> Chi tiết
                          </Button>
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
                            <Trash2 className="size-3.5 mr-1" /> Xóa
                          </Button>
                        </div>
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

      {/* Modal Chi Tiết Bài Đánh Giá */}
      <Dialog open={!!selectedReview} onOpenChange={(open) => !open && setSelectedReview(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold flex items-center gap-2">
              <Eye className="size-5 text-primary" /> Chi tiết đánh giá & kiểm duyệt
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Thông tin chi tiết người đánh giá, sản phẩm và nội dung phản hồi thực tế.
            </DialogDescription>
          </DialogHeader>

          {selectedReview && (
            <div className="space-y-5 py-2">
              {/* Box 1: Thông tin Sản phẩm */}
              <div className="rounded-lg border border-border p-4 bg-muted/20 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <Package className="size-3.5 text-primary" /> Sản phẩm được đánh giá
                  </span>
                  <a
                    href={`/products/${selectedReview.productId}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs font-semibold text-primary hover:underline inline-flex items-center gap-1"
                  >
                    Xem sản phẩm <ExternalLink className="size-3" />
                  </a>
                </div>
                <p className="text-base font-bold text-foreground">
                  {selectedReview.productName || "Sản phẩm"}
                </p>
                <p className="text-xs text-muted-foreground font-mono">
                  Mã sản phẩm: {selectedReview.productId}
                </p>
              </div>

              {/* Box 2: Thông tin Người đánh giá */}
              <div className="rounded-lg border border-border p-4 bg-muted/20 space-y-2.5">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <User className="size-3.5 text-primary" /> Thông tin Người đánh giá
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-muted-foreground">Họ và tên:</span>
                    <p className="font-semibold text-foreground mt-0.5">
                      {selectedReview.customerFullName || selectedReview.userFullName || "Khách hàng"}
                    </p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Email:</span>
                    <p className="font-semibold text-foreground mt-0.5">
                      {selectedReview.customerEmail || "Chưa có email"}
                    </p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">User ID:</span>
                    <p className="font-mono text-muted-foreground mt-0.5 break-all">
                      {selectedReview.userId}
                    </p>
                  </div>
                  {selectedReview.orderId && (
                    <div>
                      <span className="text-muted-foreground">Mã đơn hàng liên kết:</span>
                      <p className="font-mono text-muted-foreground mt-0.5 break-all">
                        {selectedReview.orderId}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Box 3: Nội dung Đánh giá */}
              <div className="rounded-lg border border-border p-4 space-y-3">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Nội dung đánh giá
                </span>

                <div className="flex flex-wrap items-center gap-4">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">Xếp hạng:</span>
                    <Rating value={selectedReview.rating} />
                    <span className="text-xs font-bold text-foreground">({selectedReview.rating} sao)</span>
                  </div>

                  {selectedReview.fitFeedback && (
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs text-muted-foreground">Form dáng:</span>
                      <Badge variant="outline" className="text-xs font-semibold">
                        <CheckCircle2 className="size-3 text-emerald-600 mr-1" />
                        {FIT_FEEDBACK_LABEL[selectedReview.fitFeedback] || selectedReview.fitFeedback}
                      </Badge>
                    </div>
                  )}

                  <div className="flex items-center gap-1 text-xs text-muted-foreground ml-auto">
                    <Calendar className="size-3.5" />
                    <span>{formatDate(selectedReview.createdAt)}</span>
                  </div>
                </div>

                <div className="rounded-md border border-border/70 bg-card p-3">
                  <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">
                    {selectedReview.comment || "Khách hàng không để lại nhận xét bằng lời."}
                  </p>
                </div>
              </div>

              {/* Box 4: Ảnh / Video đính kèm */}
              {((selectedReview.mediaList || selectedReview.medias || []).length > 0) && (
                <div className="space-y-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <ImageIcon className="size-3.5 text-primary" /> Hình ảnh / Video mặc thử thực tế
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {(selectedReview.mediaList || selectedReview.medias || []).map((m) => (
                      <div key={m.mediaId} className="rounded-lg border border-border overflow-hidden bg-muted aspect-square">
                        {m.mediaType?.toLowerCase() === "video" ? (
                          <video src={m.mediaUrl} controls className="h-full w-full object-cover" />
                        ) : (
                          <a href={m.mediaUrl} target="_blank" rel="noreferrer">
                            <img
                              src={m.mediaUrl}
                              alt="Review trial"
                              className="h-full w-full object-cover hover:scale-105 transition-transform"
                            />
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          <DialogFooter className="flex flex-col sm:flex-row justify-between gap-2 pt-2 border-t border-border">
            {selectedReview && (
              <Button
                variant="destructive"
                size="sm"
                disabled={deleteMutation.isPending}
                onClick={() => {
                  if (confirm("Bạn có chắc chắn muốn xóa bài đánh giá này? Hành động này không thể hoàn tác.")) {
                    deleteMutation.mutate(selectedReview.reviewId);
                  }
                }}
                className="font-semibold gap-1.5"
              >
                <Trash2 className="size-3.5" /> Xóa bài đánh giá vi phạm
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={() => setSelectedReview(null)}>
              Đóng
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
