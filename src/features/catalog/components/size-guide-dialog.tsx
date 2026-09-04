import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import type { SizeGuideRow } from "@/entities/catalog/types";
import { getProductSizeGuideApi, recommendSizeApi } from "@/entities/sizeguide/services";
import type { SizeGuideItem, RecommendSizeResponse } from "@/entities/sizeguide/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Ruler, Loader2, CheckCircle2, Info } from "lucide-react";
import { toast } from "sonner";

interface SizeGuideDialogProps {
  productId?: string;
  rows?: SizeGuideRow[];
}

export function SizeGuideDialog({ productId, rows }: SizeGuideDialogProps) {
  const [heightCm, setHeightCm] = useState<number | "">(170);
  const [weightKg, setWeightKg] = useState<number | "">(65);
  const [chestCm, setChestCm] = useState<number | "">("");
  const [waistCm, setWaistCm] = useState<number | "">("");
  const [recommendation, setRecommendation] = useState<RecommendSizeResponse | null>(null);

  // Fetch Size Guide Query if productId is passed
  const { data: fetchedGuide } = useQuery({
    queryKey: ["size-guide", productId],
    queryFn: () => getProductSizeGuideApi(productId!),
    enabled: !!productId && (!rows || rows.length === 0),
  });

  const guideItems: (SizeGuideItem | SizeGuideRow)[] =
    rows && rows.length > 0 ? rows : fetchedGuide?.items || [];

  // Recommend Size Mutation
  const recommendMutation = useMutation({
    mutationFn: async () => {
      if (!heightCm || !weightKg) {
        throw new Error("Vui lòng nhập Chiều cao và Cân nặng");
      }
      return recommendSizeApi({
        productId: productId || "demo-product",
        heightCm: Number(heightCm),
        weightKg: Number(weightKg),
        chestCm: chestCm ? Number(chestCm) : undefined,
        waistCm: waistCm ? Number(waistCm) : undefined,
      });
    },
    onSuccess: (res) => {
      setRecommendation(res);
      toast.success(`Đã tìm thấy size phù hợp: Size ${res.recommendedSize}`);
    },
    onError: (err: Error) => toast.error(err.message),
  });

  return (
    <Dialog>
      <DialogTrigger className="text-xs font-semibold text-primary underline underline-offset-4 flex items-center gap-1 hover:text-primary/80 transition-colors">
        <Ruler className="size-3.5" /> Bảng quy đổi & Gợi ý size
      </DialogTrigger>
      <DialogContent className="max-w-2xl sm:p-7 border border-border shadow-2xl rounded-2xl">
        <DialogHeader>
          <DialogTitle className="font-extrabold text-xl flex items-center gap-2 text-foreground">
            <Ruler className="size-5 text-primary" /> Hướng Dẫn Chọn Kích Cỡ (Size Guide)
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Tra cứu bảng size tiêu chuẩn hoặc sử dụng AI gợi ý kích cỡ vừa vặn nhất cho cơ thể bạn.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="table" className="w-full mt-2">
          <TabsList className="grid w-full grid-cols-2 h-10 bg-muted/60 p-1 rounded-xl">
            <TabsTrigger value="table" className="text-xs font-bold rounded-lg flex items-center gap-1.5">
              <Ruler className="size-3.5" /> Bảng Quy Đổi Size
            </TabsTrigger>
            <TabsTrigger value="recommend" className="text-xs font-bold rounded-lg flex items-center gap-1.5 text-primary">
              <Sparkles className="size-3.5" /> Gợi Ý Size Cho Tôi
            </TabsTrigger>
          </TabsList>

          {/* Tab 1: Bảng Quy Đổi Size */}
          <TabsContent value="table" className="space-y-4 pt-4">
            {guideItems.length === 0 ? (
              <div className="py-8 text-center text-xs text-muted-foreground">
                Sản phẩm chưa thiết lập bảng size chi tiết.
              </div>
            ) : (
              <div className="border border-border/80 rounded-xl overflow-hidden shadow-sm">
                <Table>
                  <TableHeader className="bg-muted/50">
                    <TableRow>
                      <TableHead className="font-bold text-xs">Kích cỡ (Size)</TableHead>
                      <TableHead className="font-bold text-xs">Vòng Ngực (cm)</TableHead>
                      <TableHead className="font-bold text-xs">Vòng Eo (cm)</TableHead>
                      <TableHead className="font-bold text-xs">Vòng Hông (cm)</TableHead>
                      <TableHead className="font-bold text-xs">Chiều Cao (cm)</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {guideItems.map((item, idx) => (
                      <TableRow key={"guideId" in item ? item.guideId : idx} className="hover:bg-muted/30">
                        <TableCell className="font-black text-sm text-primary">{item.size}</TableCell>
                        <TableCell className="text-xs font-medium">{item.chestCm || "N/A"}</TableCell>
                        <TableCell className="text-xs font-medium">{item.waistCm || "N/A"}</TableCell>
                        <TableCell className="text-xs font-medium">{item.hipsCm || "N/A"}</TableCell>
                        <TableCell className="text-xs font-medium">{item.heightRangeCm || "N/A"}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
            <p className="text-[11px] text-muted-foreground italic flex items-center gap-1">
              <Info className="size-3 flex-shrink-0" /> Số đo chuẩn được thiết kế co giãn tối ưu cho hoạt động tập luyện Gym & Sportswear.
            </p>
          </TabsContent>

          {/* Tab 2: Widget Gợi Ý Size AI */}
          <TabsContent value="recommend" className="space-y-5 pt-4">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                recommendMutation.mutate();
              }}
              className="space-y-4"
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="rec-height" className="text-xs font-bold">Chiều cao (cm) (*)</Label>
                  <Input
                    id="rec-height"
                    type="number"
                    placeholder="170"
                    value={heightCm}
                    onChange={(e) => setHeightCm(e.target.value === "" ? "" : Number(e.target.value))}
                    className="h-9 text-xs font-semibold"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="rec-weight" className="text-xs font-bold">Cân nặng (kg) (*)</Label>
                  <Input
                    id="rec-weight"
                    type="number"
                    placeholder="65"
                    value={weightKg}
                    onChange={(e) => setWeightKg(e.target.value === "" ? "" : Number(e.target.value))}
                    className="h-9 text-xs font-semibold"
                    required
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="rec-chest" className="text-xs font-bold">Vòng ngực (cm) (Tùy chọn)</Label>
                  <Input
                    id="rec-chest"
                    type="number"
                    placeholder="Ví dụ: 90"
                    value={chestCm}
                    onChange={(e) => setChestCm(e.target.value === "" ? "" : Number(e.target.value))}
                    className="h-9 text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="rec-waist" className="text-xs font-bold">Vòng eo (cm) (Tùy chọn)</Label>
                  <Input
                    id="rec-waist"
                    type="number"
                    placeholder="Ví dụ: 75"
                    value={waistCm}
                    onChange={(e) => setWaistCm(e.target.value === "" ? "" : Number(e.target.value))}
                    className="h-9 text-xs"
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={recommendMutation.isPending}
                className="w-full h-10 font-bold text-xs gap-2 shadow-sm"
              >
                {recommendMutation.isPending ? (
                  <>
                    <Loader2 className="size-4 animate-spin" /> Đang phân tích chỉ số cơ thể...
                  </>
                ) : (
                  <>
                    <Sparkles className="size-4 text-amber-300" /> Phân Tích & Phân Loại Size Vừa Vặn
                  </>
                )}
              </Button>
            </form>

            {/* Recommendation Output Card */}
            {recommendation && (
              <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-900 dark:text-emerald-200 space-y-2 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="size-5 text-emerald-600 dark:text-emerald-400" />
                    <span className="text-xs font-bold uppercase tracking-wider">Kích cỡ đề xuất:</span>
                    <Badge className="bg-emerald-600 text-white font-black text-sm px-3 py-0.5">
                      SIZE {recommendation.recommendedSize}
                    </Badge>
                  </div>
                  <Badge variant="outline" className="text-[11px] font-mono border-emerald-500/40 text-emerald-700 dark:text-emerald-300">
                    Độ tin cậy: {recommendation.confidence}
                  </Badge>
                </div>
                <p className="text-xs leading-relaxed text-emerald-800 dark:text-emerald-300">
                  {recommendation.explanation}
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
