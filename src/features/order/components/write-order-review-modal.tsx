import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Star, Upload, ThumbsUp, ShoppingBag } from "lucide-react";
import { createProductReviewApi, uploadReviewMediaApi } from "@/entities/social/services";
import { FIT_FEEDBACK_LABEL, type FitFeedback } from "@/entities/social/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface WriteOrderReviewModalProps {
  open: boolean;
  onClose: () => void;
  orderId: string;
  orderCode?: string;
  productId: string;
  productName: string;
  imageUrl?: string | null;
}

export function WriteOrderReviewModal({
  open,
  onClose,
  orderId,
  orderCode,
  productId,
  productName,
  imageUrl,
}: WriteOrderReviewModalProps) {
  const queryClient = useQueryClient();

  const [rating, setRating] = useState(5);
  const [fit, setFit] = useState<FitFeedback>("TrueToSize");
  const [comment, setComment] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);

  const reviewMutation = useMutation({
    mutationFn: async () => {
      // Step 1: Create Review with orderId GUID & productId GUID
      const res = await createProductReviewApi({
        productId,
        orderId,
        rating,
        comment: comment.trim() || null,
        fitFeedback: fit,
      });

      // Step 2: Upload try-on media files if attached
      if (res.reviewId && selectedFiles && selectedFiles.length > 0) {
        const filesArray = Array.from(selectedFiles);
        await uploadReviewMediaApi(res.reviewId, filesArray);
      }

      return res;
    },
    onSuccess: () => {
      toast.success("Đánh giá sản phẩm & ảnh mặc thử đã được gửi thành công!");
      setComment("");
      setSelectedFiles(null);
      queryClient.invalidateQueries({ queryKey: ["product-reviews", productId] });
      onClose();
    },
    onError: (err: Error) => toast.error(err.message || "Gửi đánh giá thất bại"),
  });

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-bold text-lg flex items-center gap-2 text-primary">
            <ThumbsUp className="size-5" /> Đánh giá sản phẩm đã mua
          </DialogTitle>
          <DialogDescription className="text-xs">
            Chia sẻ cảm nhận chất liệu vải, độ co giãn và hình ảnh mặc thử để nhận quà & thưởng kinh nghiệm Shopee style!
          </DialogDescription>
        </DialogHeader>

        {/* Product Preview Card */}
        <div className="flex items-center gap-3 p-3 border rounded-lg bg-muted/30">
          <div className="size-14 rounded border bg-background overflow-hidden shrink-0">
            {imageUrl ? (
              <img src={imageUrl} alt={productName} className="h-full w-full object-cover" />
            ) : (
              <div className="h-full w-full flex items-center justify-center text-muted-foreground text-xs font-bold">
                <ShoppingBag className="size-5" />
              </div>
            )}
          </div>
          <div className="min-w-0 flex-1 space-y-0.5 text-xs">
            <h4 className="font-bold text-foreground line-clamp-1">{productName}</h4>
            <p className="text-muted-foreground">Mã đơn hàng: <span className="font-mono font-bold text-primary">{orderCode || orderId}</span></p>
          </div>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            reviewMutation.mutate();
          }}
          className="space-y-4 py-2"
        >
          {/* Star Rating Picker */}
          <div className="space-y-1.5">
            <Label className="text-xs font-bold">Đánh giá số sao (*)</Label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className={cn(
                    "size-9 rounded-md border text-xs font-bold flex items-center justify-center transition-all",
                    star <= rating
                      ? "border-primary bg-primary text-primary-foreground shadow-sm"
                      : "border-border hover:bg-muted"
                  )}
                >
                  {star} <Star className="size-3 ml-0.5 fill-current" />
                </button>
              ))}
            </div>
          </div>

          {/* Fit Feedback Selector */}
          <div className="space-y-1.5">
            <Label className="text-xs font-bold">Cảm nhận Form dáng (*)</Label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {[
                { key: "TrueToSize", label: "Vừa vặn chuẩn size" },
                { key: "RunsSmall", label: "Form nhỏ (+1 size)" },
                { key: "RunsLarge", label: "Form rộng (-1 size)" },
              ].map((item) => (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => setFit(item.key as FitFeedback)}
                  className={cn(
                    "border text-center px-2 py-2 rounded-md text-xs font-medium transition-all",
                    fit === item.key
                      ? "border-primary bg-primary/10 text-primary font-bold ring-1 ring-primary"
                      : "border-border hover:bg-muted"
                  )}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Comment Input */}
          <div className="space-y-1.5">
            <Label htmlFor="order-review-comment" className="text-xs font-bold">Nội dung đánh giá</Label>
            <Textarea
              id="order-review-comment"
              rows={3}
              placeholder="Vải thun co giãn 4 chiều tốt, mồ hôi thấm nhanh, form dáng mặc tập Gym rất ôm tôn dáng..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="text-xs"
            />
          </div>

          {/* Upload Try-on Media Files */}
          <div className="space-y-1.5">
            <Label htmlFor="order-review-files" className="text-xs font-bold flex items-center gap-1">
              <Upload className="size-3.5 text-primary" /> Upload Ảnh / Video mặc thử thực tế
            </Label>
            <Input
              id="order-review-files"
              type="file"
              multiple
              accept="image/*,video/*"
              onChange={(e) => setSelectedFiles(e.target.files)}
              className="text-xs h-9 cursor-pointer"
            />
          </div>

          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Hủy
            </Button>
            <Button type="submit" disabled={reviewMutation.isPending} className="font-bold bg-primary text-primary-foreground">
              {reviewMutation.isPending ? "Đang gửi..." : "Hoàn tất đánh giá"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
