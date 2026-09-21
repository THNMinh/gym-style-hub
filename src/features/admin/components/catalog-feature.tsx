import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import {
  Plus,
  Trash2,
  Upload,
  Tag,
  PackageCheck,
  Edit3,
  Image as ImageIcon,
  Palette,
  Check,
  Layers,
  Ruler,
  RefreshCw,
  Sparkles,
  ChevronRight,
  Zap,
  Search,
} from "lucide-react";
import {
  getCategoriesApi,
  createCategoryApi,
  updateCategoryApi,
  deleteCategoryApi,
  getProductsAdminApi,
  createProductAdminApi,
  updateProductAdminApi,
  deleteProductAdminApi,
  getVariantsAdminApi,
  getVariantsGroupedByColorApi,
  createVariantAdminApi,
  updateVariantAdminApi,
  deleteVariantAdminApi,
  uploadProductImagesApi,
  getProductImagesApi,
  deleteProductImageApi,
} from "@/entities/admin/services";
import {
  getProductSizeGuideApi,
  createAdminSizeGuideApi,
  updateAdminSizeGuideApi,
} from "@/entities/sizeguide/services";
import type { SizeGuideItem, CreateSizeGuidePayload } from "@/entities/sizeguide/types";
import type { AdminProductDto, CategoryDto, VariantDto, ProductColorGroupDto, ProductImageDto } from "@/entities/admin/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { formatPrice } from "@/shared/lib/format";
import { AdminPagination } from "./admin-pagination";
import { cn } from "@/lib/utils";

// Zod Schemas for Product, Variant & Category Forms
const categorySchema = z.object({
  name: z.string().min(2, "Tên danh mục ít nhất 2 ký tự"),
  slug: z.string().min(2, "Slug ít nhất 2 ký tự"),
  description: z.string().optional(),
});

const productSchema = z.object({
  categoryId: z.string().min(1, "Vui lòng chọn danh mục"),
  name: z.string().min(2, "Tên sản phẩm ít nhất 2 ký tự"),
  slug: z.string().min(2, "Slug ít nhất 2 ký tự"),
  description: z.string().optional(),
  fitType: z.string().optional(),
  gender: z.enum(["Men", "Women", "Unisex"]),
});

const updateProductSchema = productSchema.extend({
  productId: z.string().min(1),
  isActive: z.boolean(),
});

const variantSchema = z.object({
  productId: z.string().min(1, "Vui lòng chọn sản phẩm"),
  sku: z.string().min(3, "Mã SKU ít nhất 3 ký tự"),
  colorName: z.string().min(1, "Nhập tên màu"),
  colorHex: z.string().min(4, "Mã màu hex (VD: #000000)"),
  size: z.string().min(1, "Vui lòng nhập size (S, M, L, XL...)"),
  price: z.coerce
    .number({ invalid_type_error: "Giá sản phẩm phải là số" })
    .min(1000, "Giá sản phẩm phải lớn hơn 1.000đ")
    .max(1000000000, "Giá sản phẩm không được vượt quá 1.000.000.000đ"),
  originalPrice: z.coerce
    .number()
    .max(1000000000, "Giá gốc không được vượt quá 1.000.000.000đ")
    .optional(),
});

type CategoryFormValues = z.infer<typeof categorySchema>;
type ProductFormValues = z.infer<typeof productSchema>;
type UpdateProductFormValues = z.infer<typeof updateProductSchema>;
type VariantFormValues = z.infer<typeof variantSchema>;

// Bảng màu sắc gợi ý chuẩn GymKitten
const PRESET_COLORS = [
  { name: "Black", hex: "#000000" },
  { name: "White", hex: "#FFFFFF" },
  { name: "Charcoal", hex: "#262626" },
  { name: "Light Grey", hex: "#D4D4D8" },
  { name: "Navy", hex: "#0B192C" },
  { name: "Royal Blue", hex: "#1E3A8A" },
  { name: "Red", hex: "#DC2626" },
  { name: "Pink", hex: "#F472B6" },
  { name: "Purple", hex: "#7E22CE" },
  { name: "Olive", hex: "#4D7C0F" },
  { name: "Beige", hex: "#F5F5DC" },
  { name: "Espresso Brown", hex: "#4A2E18" },
];

export const STANDARD_SIZES = ["XS", "S", "M", "L", "XL", "XXL", "3XL"] as const;

export interface SizePresetValues {
  chestMin: number;
  chestMax: number;
  waistMin: number;
  waistMax: number;
  hipsMin: number;
  hipsMax: number;
  heightMin: number;
  heightMax: number;
}

export const MEN_SIZE_PRESETS: Record<string, SizePresetValues> = {
  XS: { chestMin: 80, chestMax: 86, waistMin: 68, waistMax: 74, hipsMin: 84, hipsMax: 90, heightMin: 155, heightMax: 165 },
  S: { chestMin: 86, chestMax: 92, waistMin: 72, waistMax: 78, hipsMin: 88, hipsMax: 94, heightMin: 160, heightMax: 170 },
  M: { chestMin: 92, chestMax: 98, waistMin: 78, waistMax: 84, hipsMin: 94, hipsMax: 100, heightMin: 165, heightMax: 175 },
  L: { chestMin: 98, chestMax: 104, waistMin: 84, waistMax: 90, hipsMin: 100, hipsMax: 106, heightMin: 170, heightMax: 180 },
  XL: { chestMin: 104, chestMax: 112, waistMin: 90, waistMax: 96, hipsMin: 106, hipsMax: 112, heightMin: 175, heightMax: 185 },
  XXL: { chestMin: 112, chestMax: 120, waistMin: 96, waistMax: 104, hipsMin: 112, hipsMax: 118, heightMin: 180, heightMax: 190 },
  "3XL": { chestMin: 120, chestMax: 128, waistMin: 104, waistMax: 112, hipsMin: 118, hipsMax: 126, heightMin: 185, heightMax: 195 },
  FreeSize: { chestMin: 90, chestMax: 105, waistMin: 75, waistMax: 90, hipsMin: 92, hipsMax: 108, heightMin: 165, heightMax: 180 },
};

export const WOMEN_SIZE_PRESETS: Record<string, SizePresetValues> = {
  XS: { chestMin: 76, chestMax: 82, waistMin: 58, waistMax: 64, hipsMin: 82, hipsMax: 88, heightMin: 150, heightMax: 158 },
  S: { chestMin: 82, chestMax: 88, waistMin: 64, waistMax: 70, hipsMin: 88, hipsMax: 94, heightMin: 155, heightMax: 163 },
  M: { chestMin: 88, chestMax: 94, waistMin: 70, waistMax: 76, hipsMin: 94, hipsMax: 100, heightMin: 160, heightMax: 168 },
  L: { chestMin: 94, chestMax: 100, waistMin: 76, waistMax: 82, hipsMin: 100, hipsMax: 106, heightMin: 165, heightMax: 173 },
  XL: { chestMin: 100, chestMax: 106, waistMin: 82, waistMax: 88, hipsMin: 106, hipsMax: 112, heightMin: 168, heightMax: 176 },
  XXL: { chestMin: 106, chestMax: 114, waistMin: 88, waistMax: 96, hipsMin: 112, hipsMax: 118, heightMin: 170, heightMax: 180 },
  "3XL": { chestMin: 114, chestMax: 122, waistMin: 96, waistMax: 104, hipsMin: 118, hipsMax: 126, heightMin: 172, heightMax: 182 },
  FreeSize: { chestMin: 82, chestMax: 96, waistMin: 64, waistMax: 78, hipsMin: 88, hipsMax: 102, heightMin: 155, heightMax: 170 },
};

export function slugify(str: string): string {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "d")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

const COLOR_CODE_MAP: Record<string, string> = {
  black: "BLK",
  white: "WHT",
  charcoal: "CHR",
  "light grey": "GRY",
  grey: "GRY",
  gray: "GRY",
  navy: "NVY",
  "royal blue": "RBL",
  blue: "BLU",
  red: "RED",
  pink: "PNK",
  "poise pink": "PNK",
  "strength pink": "SPK",
  purple: "PRP",
  olive: "OLV",
  beige: "BGE",
  "espresso brown": "BRN",
  brown: "BRN",
  green: "GRN",
};

export function generateSku(productSlug: string, colorName: string, size: string): string {
  const parts = productSlug
    .split("-")
    .filter((w) => !["ao", "quan", "tap", "gym", "seamless", "wide", "neck", "long", "sleeve"].includes(w.toLowerCase()));
  const slugCode = (parts.length > 0 ? parts.slice(0, 2).join("-") : productSlug.slice(0, 8))
    .replace(/[^a-zA-Z0-9]/g, "")
    .toUpperCase() || "PROD";

  const cleanColor = colorName.trim().toLowerCase();
  const colorCode = COLOR_CODE_MAP[cleanColor] || cleanColor.replace(/[^a-zA-Z0-9]/g, "").slice(0, 3).toUpperCase();
  const cleanSize = size.trim().toUpperCase();

  return `GK-${slugCode}-${colorCode}-${cleanSize}`;
}

export function CatalogFeature() {
  const queryClient = useQueryClient();

  // Modals state
  const [showCatModal, setShowCatModal] = useState(false);
  const [editCategory, setEditCategory] = useState<CategoryDto | null>(null);

  const [showProductModal, setShowProductModal] = useState(false);
  const [editProduct, setEditProduct] = useState<AdminProductDto | null>(null);

  const [variantProduct, setVariantProduct] = useState<AdminProductDto | null>(null);
  const [editingVariant, setEditingVariant] = useState<VariantDto | null>(null);
  const [selectedColorTab, setSelectedColorTab] = useState<string | null>(null);
  const [isAddingNewColor, setIsAddingNewColor] = useState(false);
  const [customSizeInput, setCustomSizeInput] = useState("");
  const [showCustomSize, setShowCustomSize] = useState(false);

  const [imageProduct, setImageProduct] = useState<AdminProductDto | null>(null);
  const [selectedVariantId, setSelectedVariantId] = useState<string>("");

  // File upload state
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Size Guide Modal State
  const [sizeGuideProduct, setSizeGuideProduct] = useState<AdminProductDto | null>(null);
  const [editingGuideId, setEditingGuideId] = useState<string | null>(null);
  const [guideSize, setGuideSize] = useState("M");
  
  // Numeric Min/Max range states
  const [chestMin, setChestMin] = useState<number | "">("");
  const [chestMax, setChestMax] = useState<number | "">("");
  const [waistMin, setWaistMin] = useState<number | "">("");
  const [waistMax, setWaistMax] = useState<number | "">("");
  const [hipsMin, setHipsMin] = useState<number | "">("");
  const [hipsMax, setHipsMax] = useState<number | "">("");
  const [heightMin, setHeightMin] = useState<number | "">("");
  const [heightMax, setHeightMax] = useState<number | "">("");

  const [isSeedingAllSizes, setIsSeedingAllSizes] = useState(false);

  // Điền tự động số đo chuẩn cho từng size
  const applyPresetForSize = (targetSize: string, targetProduct?: AdminProductDto | null) => {
    const prod = targetProduct !== undefined ? targetProduct : sizeGuideProduct;
    const isFemale = prod?.gender?.toLowerCase() === "women";
    const presets = isFemale ? WOMEN_SIZE_PRESETS : MEN_SIZE_PRESETS;
    const preset = presets[targetSize] || presets["M"];

    if (preset) {
      setChestMin(preset.chestMin);
      setChestMax(preset.chestMax);
      setWaistMin(preset.waistMin);
      setWaistMax(preset.waistMax);
      setHipsMin(preset.hipsMin);
      setHipsMax(preset.hipsMax);
      setHeightMin(preset.heightMin);
      setHeightMax(preset.heightMax);
    }
  };

  const resetSizeGuideForm = (targetProduct?: AdminProductDto | null) => {
    setEditingGuideId(null);
    setGuideSize("M");
    applyPresetForSize("M", targetProduct);
  };

  // Tạo nhanh bảng size chuẩn (S, M, L, XL) cho sản phẩm
  const handleQuickSeedStandardSizes = async () => {
    if (!sizeGuideProduct) return;
    try {
      setIsSeedingAllSizes(true);
      const isFemale = sizeGuideProduct?.gender?.toLowerCase() === "women";
      const presets = isFemale ? WOMEN_SIZE_PRESETS : MEN_SIZE_PRESETS;
      const defaultSizes = ["S", "M", "L", "XL"];
      
      const existingSizes = new Set(sizeGuideQuery.data?.items?.map((i) => i.size.toUpperCase()) || []);
      const toAdd = defaultSizes.filter((s) => !existingSizes.has(s.toUpperCase()));

      if (toAdd.length === 0) {
        toast.info("Tất cả các size S, M, L, XL đã tồn tại trong bảng size!");
        return;
      }

      for (const size of toAdd) {
        const p = presets[size];
        await createAdminSizeGuideApi(sizeGuideProduct.productId, {
          size,
          chestCm: `${p.chestMin}-${p.chestMax}`,
          waistCm: `${p.waistMin}-${p.waistMax}`,
          hipsCm: `${p.hipsMin}-${p.hipsMax}`,
          heightRangeCm: `${p.heightMin}-${p.heightMax}`,
        });
      }

      toast.success(`Đã tự động tạo ${toAdd.length} dòng size chuẩn (${toAdd.join(", ")})!`);
      queryClient.invalidateQueries({ queryKey: ["admin-size-guide", sizeGuideProduct.productId] });
      queryClient.invalidateQueries({ queryKey: ["size-guide", sizeGuideProduct.productId] });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Đã có lỗi xảy ra";
      toast.error(`Lỗi khi tạo nhanh bảng size: ${msg}`);
    } finally {
      setIsSeedingAllSizes(false);
    }
  };

  const sizeGuideQuery = useQuery({
    queryKey: ["admin-size-guide", sizeGuideProduct?.productId],
    queryFn: () => (sizeGuideProduct ? getProductSizeGuideApi(sizeGuideProduct.productId) : Promise.resolve({ productId: "", items: [] })),
    enabled: !!sizeGuideProduct,
  });

  const saveSizeGuideMutation = useMutation({
    mutationFn: async () => {
      if (!sizeGuideProduct) return;

      // Validation: Check Min <= Max for each non-empty range
      const validateRange = (label: string, min: number | "", max: number | ""): string | null => {
        if (min !== "" && max !== "" && Number(min) > Number(max)) {
          return `${label}: Giá trị từ (${min}) phải nhỏ hơn hoặc bằng giá trị đến (${max})!`;
        }
        return null;
      };

      const chestErr = validateRange("Vòng Ngực", chestMin, chestMax);
      if (chestErr) throw new Error(chestErr);

      const waistErr = validateRange("Vòng Eo", waistMin, waistMax);
      if (waistErr) throw new Error(waistErr);

      const hipsErr = validateRange("Vòng Hông", hipsMin, hipsMax);
      if (hipsErr) throw new Error(hipsErr);

      const heightErr = validateRange("Chiều Cao", heightMin, heightMax);
      if (heightErr) throw new Error(heightErr);

      const formatRange = (min: number | "", max: number | ""): string => {
        if (min !== "" && max !== "") return `${min}-${max}`;
        if (min !== "") return `${min}`;
        if (max !== "") return `${max}`;
        return "";
      };

      const payload: CreateSizeGuidePayload = {
        size: guideSize.trim(),
        chestCm: formatRange(chestMin, chestMax),
        waistCm: formatRange(waistMin, waistMax),
        hipsCm: formatRange(hipsMin, hipsMax),
        heightRangeCm: formatRange(heightMin, heightMax),
      };

      if (editingGuideId) {
        return updateAdminSizeGuideApi(editingGuideId, payload);
      }
      return createAdminSizeGuideApi(sizeGuideProduct.productId, payload);
    },
    onSuccess: () => {
      toast.success(editingGuideId ? "Đã cập nhật dòng size!" : "Đã thêm dòng size mới!");
      queryClient.invalidateQueries({ queryKey: ["admin-size-guide", sizeGuideProduct?.productId] });
      queryClient.invalidateQueries({ queryKey: ["size-guide", sizeGuideProduct?.productId] });
      resetSizeGuideForm();
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const [page, setPage] = useState(1);
  const [productSearch, setProductSearch] = useState("");
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>("all");

  // Data Queries
  const categoriesQuery = useQuery({
    queryKey: ["admin-categories"],
    queryFn: getCategoriesApi,
  });

  const productsQuery = useQuery({
    queryKey: ["admin-products", page, productSearch, selectedCategoryFilter],
    queryFn: () => getProductsAdminApi(page, 15, productSearch, selectedCategoryFilter),
  });

  // Variants Query for selected product modal
  const variantsQuery = useQuery({
    queryKey: ["admin-variants", variantProduct?.productId],
    queryFn: () => (variantProduct ? getVariantsAdminApi(variantProduct.productId) : Promise.resolve([])),
    enabled: !!variantProduct,
  });

  // Query biến thể gom nhóm theo màu (Data thật từ backend API)
  const colorGroupsQuery = useQuery({
    queryKey: ["admin-variants-by-color", variantProduct?.productId],
    queryFn: () => (variantProduct ? getVariantsGroupedByColorApi(variantProduct.productId) : Promise.resolve([])),
    enabled: !!variantProduct,
  });

  // Query biến thể khi upload hình ảnh
  const imageProductVariantsQuery = useQuery({
    queryKey: ["admin-variants", imageProduct?.productId],
    queryFn: () => (imageProduct ? getVariantsAdminApi(imageProduct.productId) : Promise.resolve([])),
    enabled: !!imageProduct,
  });

  // Query biến thể gom nhóm theo màu khi upload hình ảnh (Data thật)
  const imageProductColorGroupsQuery = useQuery({
    queryKey: ["admin-variants-by-color", imageProduct?.productId],
    queryFn: () => (imageProduct ? getVariantsGroupedByColorApi(imageProduct.productId) : Promise.resolve([])),
    enabled: !!imageProduct,
  });

  // Query hình ảnh của sản phẩm khi mở modal quản lý biến thể
  const variantProductImagesQuery = useQuery({
    queryKey: ["admin-product-images", variantProduct?.productId],
    queryFn: () => (variantProduct ? getProductImagesApi(variantProduct.productId) : Promise.resolve([])),
    enabled: !!variantProduct,
  });

  // Query hình ảnh hiện có của sản phẩm
  const productImagesQuery = useQuery({
    queryKey: ["admin-product-images", imageProduct?.productId],
    queryFn: () => (imageProduct ? getProductImagesApi(imageProduct.productId) : Promise.resolve([])),
    enabled: !!imageProduct,
  });

  // Image Delete Mutation
  const deleteImageMutation = useMutation({
    mutationFn: deleteProductImageApi,
    onSuccess: () => {
      toast.success("Xóa hình ảnh thành công!");
      queryClient.invalidateQueries({ queryKey: ["admin-product-images", imageProduct?.productId] });
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
    },
    onError: (err: Error) => toast.error(`Lỗi xóa ảnh: ${err.message}`),
  });

  // Category Mutations
  const createCatMutation = useMutation({
    mutationFn: createCategoryApi,
    onSuccess: () => {
      toast.success("Tạo danh mục mới thành công!");
      setShowCatModal(false);
      queryClient.invalidateQueries({ queryKey: ["admin-categories"] });
    },
    onError: (err: Error) => toast.error(`Lỗi: ${err.message}`),
  });

  const updateCatMutation = useMutation({
    mutationFn: ({ id, body }: { id: string; body: CategoryFormValues }) =>
      updateCategoryApi(id, body),
    onSuccess: () => {
      toast.success("Cập nhật danh mục thành công!");
      setEditCategory(null);
      queryClient.invalidateQueries({ queryKey: ["admin-categories"] });
    },
    onError: (err: Error) => toast.error(`Lỗi: ${err.message}`),
  });

  const deleteCatMutation = useMutation({
    mutationFn: deleteCategoryApi,
    onSuccess: () => {
      toast.success("Xóa danh mục thành công!");
      queryClient.invalidateQueries({ queryKey: ["admin-categories"] });
    },
    onError: (err: Error) => toast.error(`Lỗi: ${err.message}`),
  });

  // Product Mutations
  const createProductMutation = useMutation({
    mutationFn: createProductAdminApi,
    onSuccess: () => {
      toast.success("Tạo sản phẩm mới thành công!");
      setShowProductModal(false);
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
    },
    onError: (err: Error) => toast.error(`Lỗi: ${err.message}`),
  });

  const updateProductMutation = useMutation({
    mutationFn: updateProductAdminApi,
    onSuccess: () => {
      toast.success("Cập nhật sản phẩm thành công!");
      setEditProduct(null);
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
    },
    onError: (err: Error) => toast.error(`Lỗi: ${err.message}`),
  });

  const deleteProductMutation = useMutation({
    mutationFn: deleteProductAdminApi,
    onSuccess: () => {
      toast.success("Xóa sản phẩm thành công!");
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
    },
    onError: (err: Error) => toast.error(`Lỗi: ${err.message}`),
  });

  // Variant Mutations
  const createVariantMutation = useMutation({
    mutationFn: createVariantAdminApi,
    onSuccess: () => {
      toast.success("Thêm biến thể thành công!");
      queryClient.invalidateQueries({ queryKey: ["admin-variants", variantProduct?.productId] });
      queryClient.invalidateQueries({ queryKey: ["admin-variants-by-color", variantProduct?.productId] });
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
    },
    onError: (err: any) => {
      const msg = err?.message || "Thêm biến thể thất bại";
      const code = err?.code || "";
      const isSkuConflict =
        code.includes("SkuAlreadyExists") ||
        msg.toLowerCase().includes("sku") ||
        code.includes("Conflict");
      const isDuplicateVariant =
        code.includes("DuplicateColorAndSize") ||
        msg.toLowerCase().includes("màu sắc và kích cỡ") ||
        msg.toLowerCase().includes("kích cỡ này");

      if (isSkuConflict) {
        variantForm.setError("sku", {
          type: "manual",
          message: msg,
        });
      } else if (isDuplicateVariant) {
        variantForm.setError("size", {
          type: "manual",
          message: msg,
        });
      }

      toast.error(`Lỗi: ${msg}`);
    },
  });

  const updateVariantMutation = useMutation({
    mutationFn: ({ variantId, payload }: { variantId: string; payload: Partial<VariantFormValues> }) =>
      updateVariantAdminApi(variantId, payload),
    onSuccess: () => {
      toast.success("Cập nhật biến thể thành công!");
      setEditingVariant(null);
      queryClient.invalidateQueries({ queryKey: ["admin-variants", variantProduct?.productId] });
      queryClient.invalidateQueries({ queryKey: ["admin-variants-by-color", variantProduct?.productId] });
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
    },
    onError: (err: any) => {
      const msg = err?.message || "Cập nhật biến thể thất bại";
      const code = err?.code || "";
      const isSkuConflict =
        code.includes("SkuAlreadyExists") ||
        msg.toLowerCase().includes("sku") ||
        code.includes("Conflict");
      const isDuplicateVariant =
        code.includes("DuplicateColorAndSize") ||
        msg.toLowerCase().includes("màu sắc và kích cỡ") ||
        msg.toLowerCase().includes("kích cỡ này");

      if (isSkuConflict) {
        variantForm.setError("sku", {
          type: "manual",
          message: msg,
        });
      } else if (isDuplicateVariant) {
        variantForm.setError("size", {
          type: "manual",
          message: msg,
        });
      }

      toast.error(`Lỗi: ${msg}`);
    },
  });

  const deleteVariantMutation = useMutation({
    mutationFn: deleteVariantAdminApi,
    onSuccess: () => {
      toast.success("Xóa biến thể thành công!");
      queryClient.invalidateQueries({ queryKey: ["admin-variants", variantProduct?.productId] });
      queryClient.invalidateQueries({ queryKey: ["admin-variants-by-color", variantProduct?.productId] });
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
    },
    onError: (err: any) => toast.error(`Lỗi: ${err?.message || "Không thể xóa biến thể này"}`),
  });

  // Form Hooks
  const catForm = useForm<CategoryFormValues>({ resolver: zodResolver(categorySchema) });
  const editCatForm = useForm<CategoryFormValues>({ resolver: zodResolver(categorySchema) });

  const productForm = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: { gender: "Men" },
  });

  const editProductForm = useForm<UpdateProductFormValues>({
    resolver: zodResolver(updateProductSchema),
  });

  const variantForm = useForm<VariantFormValues>({
    resolver: zodResolver(variantSchema),
    defaultValues: {
      colorName: "Black",
      colorHex: "#000000",
      size: "M",
      price: 299000,
    },
  });

  const handleOpenEditProduct = (product: AdminProductDto) => {
    setEditProduct(product);
    editProductForm.reset({
      productId: product.productId,
      categoryId: product.categoryId,
      name: product.name,
      slug: product.slug,
      description: product.description || "",
      fitType: product.fitType || "",
      gender: (product.gender as "Men" | "Women" | "Unisex") || "Men",
      isActive: product.isActive,
    });
  };

  const handleOpenEditCat = (cat: CategoryDto) => {
    setEditCategory(cat);
    editCatForm.reset({
      name: cat.name,
      slug: cat.slug,
      description: cat.description || "",
    });
  };

  const handleUploadImages = async () => {
    if (!imageProduct || !selectedFiles || selectedFiles.length === 0) {
      toast.error("Vui lòng chọn ít nhất 1 file ảnh");
      return;
    }

    setIsUploading(true);
    try {
      const filesArray = Array.from(selectedFiles);
      await uploadProductImagesApi(
        imageProduct.productId,
        filesArray,
        selectedVariantId ? selectedVariantId : undefined
      );
      toast.success("Upload hình ảnh sản phẩm thành công!");
      setSelectedFiles(null);
      queryClient.invalidateQueries({ queryKey: ["admin-product-images", imageProduct.productId] });
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Upload thất bại");
    } finally {
      setIsUploading(false);
    }
  };

  const categoryList: CategoryDto[] = Array.isArray(categoriesQuery.data)
    ? categoriesQuery.data
    : (categoriesQuery.data as any)?.items || [];

  const productList: AdminProductDto[] = Array.isArray(productsQuery.data)
    ? productsQuery.data
    : (productsQuery.data as any)?.items || [];

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      {/* Title Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Quản lý Catalog & Sản phẩm</h1>
          <p className="text-xs text-muted-foreground mt-1">
            Thêm / Sửa / Xóa Sản phẩm, Biến thể Màu/Size, Danh mục và Upload/Xóa hình ảnh.
          </p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={() => setShowCatModal(true)} className="gap-1.5">
            <Tag className="size-4" /> + Danh mục mới
          </Button>
          <Button size="sm" onClick={() => setShowProductModal(true)} className="gap-1.5 font-bold">
            <Plus className="size-4" /> + Sản phẩm mới
          </Button>
        </div>
      </div>

      {/* Categories Summary */}
      <Card className="border border-border/80 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <Tag className="size-4 text-primary" /> Danh mục sản phẩm ({categoryList.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          {categoryList.map((cat) => (
            <Badge key={cat.categoryId} variant="secondary" className="px-3 py-1 text-xs gap-2 items-center">
              <span>{cat.name}</span>
              <button
                type="button"
                onClick={() => handleOpenEditCat(cat)}
                className="text-muted-foreground hover:text-primary transition-colors"
                title="Chỉnh sửa danh mục"
              >
                <Edit3 className="size-3" />
              </button>
              <button
                type="button"
                onClick={() => deleteCatMutation.mutate(cat.categoryId)}
                className="text-muted-foreground hover:text-destructive transition-colors"
                title="Xóa danh mục"
              >
                <Trash2 className="size-3" />
              </button>
            </Badge>
          ))}
        </CardContent>
      </Card>

      {/* Bộ lọc sản phẩm Catalog (Giống bộ lọc ở trang Quản lý Tồn kho) */}
      <Card className="border border-border/80 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Search className="size-4 text-muted-foreground" /> Bộ lọc sản phẩm Catalog
            </div>
            {(productSearch || selectedCategoryFilter !== "all") && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setProductSearch("");
                  setSelectedCategoryFilter("all");
                  setPage(1);
                }}
                className="h-7 text-xs text-muted-foreground hover:text-foreground"
              >
                Xóa bộ lọc
              </Button>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              placeholder="Lọc theo Tên sản phẩm, Slug (Ví dụ: Onyx, Seamless, Devant, Hoodie)..."
              value={productSearch}
              onChange={(e) => {
                setProductSearch(e.target.value);
                setPage(1);
              }}
              className="pl-9 text-xs"
            />
          </div>
          <div className="w-full sm:w-64">
            <select
              value={selectedCategoryFilter}
              onChange={(e) => {
                setSelectedCategoryFilter(e.target.value);
                setPage(1);
              }}
              className="w-full h-9 px-3 rounded-lg border border-input bg-background text-xs font-semibold text-foreground shadow-xs"
            >
              <option value="all">Tất cả danh mục ({categoryList.length})</option>
              {categoryList.map((cat) => (
                <option key={cat.categoryId} value={cat.categoryId}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Products Data Table */}
      <Card className="border border-border/80 shadow-sm overflow-hidden">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-bold flex items-center justify-between">
            <div className="flex items-center gap-2">
              <PackageCheck className="size-4 text-primary" /> Danh sách sản phẩm Catalog
            </div>
            <span className="text-xs font-medium text-muted-foreground">
              Tổng cộng: <strong className="text-foreground font-bold">{productsQuery.data?.totalCount || productList.length}</strong> sản phẩm
            </span>
          </CardTitle>
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted/50 border-b border-border text-xs uppercase font-bold text-muted-foreground">
              <tr>
                <th className="py-3.5 px-4">Ảnh</th>
                <th className="py-3.5 px-4">Tên Sản phẩm / Slug</th>
                <th className="py-3.5 px-4">Giới tính / Fit</th>
                <th className="py-3.5 px-4">Trạng thái</th>
                <th className="py-3.5 px-4 text-right">Thao tác Quản lý</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {productsQuery.isLoading ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-muted-foreground">
                    Đang nạp danh sách sản phẩm...
                  </td>
                </tr>
              ) : !productList || productList.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-muted-foreground">
                    {productSearch || selectedCategoryFilter !== "all"
                      ? "Không tìm thấy sản phẩm nào khớp với bộ lọc."
                      : "Chưa có sản phẩm nào trong catalog."}
                  </td>
                </tr>
              ) : (
                productList.map((product) => (
                  <tr key={product.productId} className="hover:bg-muted/30 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="size-12 rounded bg-muted overflow-hidden border">
                        {product.primaryImageUrl ? (
                          <img src={product.primaryImageUrl} alt={product.name} className="h-full w-full object-cover" />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center text-muted-foreground">
                            <ImageIcon className="size-5" />
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <p className="font-bold text-foreground">{product.name}</p>
                      <p className="text-xs text-muted-foreground font-mono">{product.slug}</p>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex gap-1">
                        <Badge variant="outline" className="text-[10px]">
                          {product.gender}
                        </Badge>
                        {product.fitType && (
                          <Badge variant="secondary" className="text-[10px]">
                            {product.fitType}
                          </Badge>
                        )}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <Badge className={product.isActive ? "bg-emerald-500/15 text-emerald-600" : "bg-slate-500/15 text-slate-500"}>
                        {product.isActive ? "Đang hiển thị" : "Ẩn"}
                      </Badge>
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleOpenEditProduct(product)}
                        className="h-8 text-xs font-semibold text-amber-600 hover:text-amber-700 hover:bg-amber-50 dark:hover:bg-amber-950/40"
                      >
                        <Edit3 className="size-3.5 mr-1" /> Sửa
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setVariantProduct(product);
                          variantForm.reset({
                            productId: product.productId,
                            sku: `GK-${product.slug.toUpperCase().slice(0, 8)}-BLK-M`,
                            colorName: "Black",
                            colorHex: "#000000",
                            size: "M",
                            price: 299000,
                          });
                        }}
                        className="h-8 text-xs font-semibold"
                      >
                        Biến thể (Variants)
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setImageProduct(product);
                          setSelectedVariantId("");
                        }}
                        className="h-8 text-xs font-semibold text-blue-600 hover:text-blue-700"
                      >
                        <Upload className="size-3.5 mr-1" /> Quản lý Ảnh
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSizeGuideProduct(product);
                          resetSizeGuideForm(product);
                        }}
                        className="h-8 text-xs font-semibold text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/40"
                      >
                        <Ruler className="size-3.5 mr-1" /> Bảng Size
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          if (confirm(`Bạn có chắc chắn muốn xóa sản phẩm "${product.name}"?`)) {
                            deleteProductMutation.mutate(product.productId);
                          }
                        }}
                        className="h-8 text-xs text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="size-3.5" />
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Thanh Phân Trang (Pagination) */}
        <AdminPagination
          page={page}
          pageSize={15}
          totalCount={productsQuery.data?.totalCount || productList.length}
          totalPages={productsQuery.data?.totalPages || 1}
          onPageChange={setPage}
        />
      </Card>

      {/* ------------------------------------------------------------- */}
      {/* EDIT PRODUCT MODAL (PUT /api/products/{id})                   */}
      {/* ------------------------------------------------------------- */}
      <Dialog open={editProduct !== null} onOpenChange={(open) => !open && setEditProduct(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-bold flex items-center gap-2 text-amber-600">
              <Edit3 className="size-5" /> Chỉnh sửa Sản phẩm: {editProduct?.name}
            </DialogTitle>
            <DialogDescription>
              Cập nhật thông tin chi tiết và ẩn/hiện sản phẩm trên trang bán hàng.
            </DialogDescription>
          </DialogHeader>

          <form
            onSubmit={editProductForm.handleSubmit((values) => updateProductMutation.mutate(values))}
            className="space-y-4 py-2"
          >
            <input type="hidden" {...editProductForm.register("productId")} />

            <div className="space-y-2">
              <Label htmlFor="edit-prod-cat">Danh mục (*)</Label>
              <select
                id="edit-prod-cat"
                className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                {...editProductForm.register("categoryId")}
              >
                <option value="">-- Chọn danh mục --</option>
                {categoryList.map((cat) => (
                  <option key={cat.categoryId} value={cat.categoryId}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="edit-prod-name">Tên sản phẩm (*)</Label>
                <Input id="edit-prod-name" {...editProductForm.register("name")} />
                {editProductForm.formState.errors.name && (
                  <p className="text-xs text-destructive">{editProductForm.formState.errors.name.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-prod-slug">Slug (*)</Label>
                <Input id="edit-prod-slug" {...editProductForm.register("slug")} />
                {editProductForm.formState.errors.slug && (
                  <p className="text-xs text-destructive">{editProductForm.formState.errors.slug.message}</p>
                )}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="edit-prod-gender">Giới tính (*)</Label>
                <select
                  id="edit-prod-gender"
                  className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                  {...editProductForm.register("gender")}
                >
                  <option value="Men">Nam (Men)</option>
                  <option value="Women">Nữ (Women)</option>
                  <option value="Unisex">Unisex</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-prod-fit">Fit Type (Slim / Regular / Oversized)</Label>
                <Input id="edit-prod-fit" {...editProductForm.register("fitType")} />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-prod-desc">Mô tả sản phẩm</Label>
              <Textarea id="edit-prod-desc" rows={3} {...editProductForm.register("description")} />
            </div>

            <div className="flex items-center gap-3 p-3 rounded-lg border bg-muted/30">
              <input
                id="edit-prod-active"
                type="checkbox"
                className="size-4 rounded border-gray-300 accent-primary"
                {...editProductForm.register("isActive")}
              />
              <Label htmlFor="edit-prod-active" className="cursor-pointer font-bold">
                Bật hiển thị sản phẩm trên trang bán hàng (Client)
              </Label>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setEditProduct(null)}>
                Hủy
              </Button>
              <Button type="submit" disabled={updateProductMutation.isPending} className="font-bold">
                {updateProductMutation.isPending ? "Đang lưu..." : "Lưu thay đổi"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ------------------------------------------------------------- */}
      {/* MANAGE VARIANTS MODAL (GET/POST/PUT/DELETE /api/products/variants) */}
      {/* ------------------------------------------------------------- */}
      {/* ------------------------------------------------------------- */}
      {/* MANAGE VARIANTS MODAL (Grouped by Real Color API Data)        */}
      {/* ------------------------------------------------------------- */}
      <Dialog
        open={variantProduct !== null}
        onOpenChange={(open) => {
          if (!open) {
            setVariantProduct(null);
            setEditingVariant(null);
            setSelectedColorTab(null);
            setIsAddingNewColor(false);
            setShowCustomSize(false);
          }
        }}
      >
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-bold flex items-center justify-between">
              <span>Quản lý Biến thể (Variants) — {variantProduct?.name}</span>
            </DialogTitle>
            <DialogDescription>
              Tổ chức biến thể theo từng Màu sắc và Kích cỡ. Dữ liệu màu sắc được đồng bộ thực tế từ database.
            </DialogDescription>
          </DialogHeader>

          {(() => {
            const colorGroups = colorGroupsQuery.data ?? [];
            const activeColorName = selectedColorTab || colorGroups[0]?.colorName || null;
            const activeGroup = isAddingNewColor
              ? null
              : colorGroups.find((g) => g.colorName.toLowerCase() === (activeColorName || "").toLowerCase()) || colorGroups[0] || null;

            const currentColorName = isAddingNewColor
              ? (variantForm.watch("colorName") || "Black")
              : (activeGroup?.colorName || "Black");
            const currentColorHex = isAddingNewColor
              ? (variantForm.watch("colorHex") || "#000000")
              : (activeGroup?.colorHex || "#000000");

            return (
              <div className="space-y-6 py-2">
                {/* 1. Color Navigation Tabs (Real Data from API) */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-bold uppercase text-muted-foreground flex items-center gap-1.5">
                      <Palette className="size-3.5 text-primary" /> Màu sắc hiện có ({colorGroups.length}):
                    </Label>
                    <Button
                      type="button"
                      size="sm"
                      variant={isAddingNewColor ? "default" : "outline"}
                      className="h-7 text-xs gap-1"
                      onClick={() => {
                        setIsAddingNewColor(true);
                        setEditingVariant(null);
                        setShowCustomSize(false);
                        if (variantProduct) {
                          const defaultColor = "Navy";
                          const defaultSize = "M";
                          variantForm.reset({
                            productId: variantProduct.productId,
                            colorName: defaultColor,
                            colorHex: "#0B192C",
                            size: defaultSize,
                            price: 299000,
                            sku: generateSku(variantProduct.slug, defaultColor, defaultSize),
                          });
                        }
                      }}
                    >
                      <Plus className="size-3.5" /> Thêm màu mới
                    </Button>
                  </div>

                  {colorGroupsQuery.isLoading ? (
                    <div className="p-3 text-center text-xs text-muted-foreground">Đang tải nhóm màu...</div>
                  ) : colorGroups.length === 0 && !isAddingNewColor ? (
                    <div className="p-4 text-center text-xs text-muted-foreground border border-dashed rounded-lg bg-muted/20">
                      Chưa có biến thể màu nào. Hãy bấm <strong>"+ Thêm màu mới"</strong> ở trên để tạo màu đầu tiên!
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {colorGroups.map((group) => {
                        const isSelected = !isAddingNewColor && (activeGroup?.colorName.toLowerCase() === group.colorName.toLowerCase());
                        return (
                          <button
                            key={group.colorName}
                            type="button"
                            onClick={() => {
                              setSelectedColorTab(group.colorName);
                              setIsAddingNewColor(false);
                              setEditingVariant(null);
                              setShowCustomSize(false);
                              if (variantProduct) {
                                const defaultSize = STANDARD_SIZES.find((s) => !group.availableSizes.includes(s)) || "M";
                                variantForm.reset({
                                  productId: variantProduct.productId,
                                  colorName: group.colorName,
                                  colorHex: group.colorHex || "#000000",
                                  size: defaultSize,
                                  price: group.variants[0]?.price || 299000,
                                  originalPrice: group.variants[0]?.originalPrice ?? undefined,
                                  sku: generateSku(variantProduct.slug, group.colorName, defaultSize),
                                });
                              }
                            }}
                            className={cn(
                              "flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-semibold transition-all",
                              isSelected
                                ? "border-primary bg-primary/10 ring-1 ring-primary shadow-xs"
                                : "border-border bg-background hover:bg-muted/50 text-muted-foreground hover:text-foreground",
                            )}
                          >
                            <span
                              className="size-3.5 rounded-full border shadow-xs shrink-0"
                              style={{ backgroundColor: group.colorHex || "#000000" }}
                            />
                            <span>{group.colorName}</span>
                            <Badge variant="secondary" className="font-bold text-[10px] px-1.5 py-0 h-4">
                              {group.variants.length} size
                            </Badge>
                            <span className="text-[10px] text-muted-foreground">({group.totalAvailableStock} tồn)</span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* 2. Existing Sizes Table for Selected Color */}
                {activeGroup && !isAddingNewColor && (
                  <div className="border rounded-lg overflow-hidden bg-background shadow-xs">
                    <div className="bg-muted/50 px-4 py-2 text-xs font-bold flex items-center justify-between border-b">
                      <div className="flex items-center gap-2">
                        <span
                          className="size-3 rounded-full border shadow-xs"
                          style={{ backgroundColor: activeGroup.colorHex || "#000000" }}
                        />
                        <span>Kích cỡ hiện có của màu {activeGroup.colorName} ({activeGroup.variants.length})</span>
                      </div>
                      <span className="text-[11px] font-normal text-muted-foreground">
                        Tổng khả dụng: <strong className="text-foreground">{activeGroup.totalAvailableStock}</strong>
                      </span>
                    </div>

                    <div className="divide-y max-h-48 overflow-y-auto">
                      {activeGroup.variants.map((v) => {
                        const isBeingEdited = editingVariant?.variantId === v.variantId;
                        return (
                          <div
                            key={v.variantId}
                            className={cn(
                              "p-3 flex items-center justify-between text-xs hover:bg-muted/30 transition-colors",
                              isBeingEdited && "bg-primary/5 ring-1 ring-primary/40 font-medium",
                            )}
                          >
                            <div className="flex items-center gap-3">
                              <Badge variant="secondary" className="font-bold text-xs h-6 px-2.5">
                                {v.size}
                              </Badge>
                              <div>
                                <div className="font-mono font-bold text-primary">{v.sku}</div>
                                <div className="text-muted-foreground flex items-center gap-2">
                                  <span>{formatPrice(v.price)}</span>
                                  {v.originalPrice != null && v.originalPrice > 0 ? (
                                    <span className="line-through text-[11px] text-muted-foreground/80">
                                      {formatPrice(v.originalPrice)}
                                    </span>
                                  ) : null}
                                  <span className="text-border">|</span>
                                  <span className="text-[11px]">Tồn khả dụng: <strong className="text-foreground">{v.availableStock ?? v.available ?? 0}</strong></span>
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-1">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => {
                                  setEditingVariant(v);
                                  setShowCustomSize(!STANDARD_SIZES.includes(v.size as any));
                                  variantForm.reset({
                                    productId: v.productId,
                                    sku: v.sku,
                                    colorName: v.colorName,
                                    colorHex: v.colorHex || "#000000",
                                    size: v.size,
                                    price: v.price,
                                    originalPrice: v.originalPrice ?? undefined,
                                  });
                                }}
                                className="h-7 text-xs text-primary hover:bg-primary/10"
                              >
                                <Edit3 className="size-3.5 mr-1" /> Sửa
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => {
                                  if (confirm(`Bạn có chắc muốn xóa biến thể ${v.colorName} - Size ${v.size} (${v.sku})?`)) {
                                    deleteVariantMutation.mutate(v.variantId);
                                  }
                                }}
                                className="h-7 text-destructive hover:bg-destructive/10 text-xs"
                              >
                                <Trash2 className="size-3.5 mr-1" /> Xóa
                              </Button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* 3. Add / Edit Variant Form */}
                <form
                  onSubmit={variantForm.handleSubmit((values) => {
                    if (editingVariant) {
                      updateVariantMutation.mutate({
                        variantId: editingVariant.variantId,
                        payload: {
                          ...values,
                          price: Number(values.price),
                        },
                      });
                    } else {
                      createVariantMutation.mutate({
                        ...values,
                        price: Number(values.price),
                      });
                    }
                  })}
                  className="space-y-4 p-4 border rounded-lg bg-muted/20"
                >
                  <div className="flex items-center justify-between border-b pb-2">
                    <h4 className="text-xs font-bold uppercase text-foreground flex items-center gap-1.5">
                      {editingVariant ? (
                        <>
                          <Edit3 className="size-4 text-primary" /> Chỉnh sửa biến thể — Size {editingVariant.size} ({editingVariant.sku})
                        </>
                      ) : isAddingNewColor ? (
                        <>
                          <Plus className="size-4 text-primary" /> Thêm biến thể cho Màu sắc mới
                        </>
                      ) : (
                        <>
                          <Plus className="size-4 text-primary" /> Thêm Size mới cho màu {activeGroup?.colorName}
                        </>
                      )}
                    </h4>
                    {editingVariant && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-6 text-xs text-muted-foreground"
                        onClick={() => {
                          setEditingVariant(null);
                          if (activeGroup && variantProduct) {
                            const defaultSize = STANDARD_SIZES.find((s) => !activeGroup.availableSizes.includes(s)) || "M";
                            variantForm.reset({
                              productId: variantProduct.productId,
                              colorName: activeGroup.colorName,
                              colorHex: activeGroup.colorHex || "#000000",
                              size: defaultSize,
                              price: activeGroup.variants[0]?.price || 299000,
                              sku: generateSku(variantProduct.slug, activeGroup.colorName, defaultSize),
                            });
                          }
                        }}
                      >
                        Hủy chỉnh sửa
                      </Button>
                    )}
                  </div>

                  {/* Color Section (Editable if new color or editing, fixed if adding size to existing color) */}
                  {isAddingNewColor || editingVariant ? (
                    <div className="space-y-3">
                      <div className="grid gap-3 sm:grid-cols-2">
                        <div>
                          <Label htmlFor="var-color" className="text-xs">Tên màu (*)</Label>
                          <Input
                            id="var-color"
                            className="h-9 text-xs"
                            placeholder="Black"
                            {...variantForm.register("colorName", {
                              onChange: (e) => {
                                if (variantProduct) {
                                  const currentSize = variantForm.getValues("size") || "M";
                                  variantForm.setValue("sku", generateSku(variantProduct.slug, e.target.value, currentSize));
                                }
                              },
                            })}
                          />
                        </div>
                        <div>
                          <Label htmlFor="var-hex" className="text-xs">Bảng chọn màu (Picker) (*)</Label>
                          <div className="flex items-center gap-2">
                            <input
                              type="color"
                              value={variantForm.watch("colorHex") || "#000000"}
                              onChange={(e) => variantForm.setValue("colorHex", e.target.value.toUpperCase())}
                              className="size-9 p-0.5 rounded cursor-pointer border bg-background shrink-0"
                            />
                            <Input
                              id="var-hex"
                              className="h-9 text-xs font-mono"
                              placeholder="#000000"
                              {...variantForm.register("colorHex")}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Preset GymKitten Color Palette */}
                      <div className="space-y-1.5 pt-1">
                        <Label className="text-[11px] font-semibold text-muted-foreground flex items-center gap-1">
                          <Palette className="size-3 text-primary" /> Bấm chọn nhanh màu GymKitten:
                        </Label>
                        <div className="flex flex-wrap gap-1.5">
                          {PRESET_COLORS.map((preset) => {
                            const selected = variantForm.watch("colorHex")?.toUpperCase() === preset.hex.toUpperCase();
                            return (
                              <button
                                key={preset.name}
                                type="button"
                                onClick={() => {
                                  variantForm.setValue("colorName", preset.name);
                                  variantForm.setValue("colorHex", preset.hex);
                                  if (variantProduct) {
                                    const currentSize = variantForm.getValues("size") || "M";
                                    variantForm.setValue("sku", generateSku(variantProduct.slug, preset.name, currentSize));
                                  }
                                }}
                                className={cn(
                                  "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border transition-all",
                                  selected
                                    ? "border-primary bg-primary/10 ring-1 ring-primary font-bold"
                                    : "border-border bg-background hover:bg-muted",
                                )}
                              >
                                <span
                                  className="size-3 rounded-full border shadow-xs"
                                  style={{ backgroundColor: preset.hex }}
                                />
                                <span>{preset.name}</span>
                                {selected && <Check className="size-3 text-primary" />}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between p-2.5 rounded-lg border bg-background/80 text-xs">
                      <div className="flex items-center gap-2">
                        <span
                          className="size-3.5 rounded-full border shadow-xs shrink-0"
                          style={{ backgroundColor: currentColorHex }}
                        />
                        <span>Đang thêm vào màu: <strong className="font-bold">{currentColorName}</strong></span>
                      </div>
                      <Badge variant="outline" className="text-[11px]">Đồng bộ màu tự động</Badge>
                    </div>
                  )}

                  {/* Standard Size Selector (Pills) */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs font-bold flex items-center gap-1.5">
                        <Ruler className="size-3.5 text-primary" /> Chọn Kích cỡ (Size) (*):
                      </Label>
                      <button
                        type="button"
                        onClick={() => setShowCustomSize(!showCustomSize)}
                        className="text-[11px] text-primary hover:underline"
                      >
                        {showCustomSize ? "Dùng size chuẩn (XS-3XL)" : "Nhập size khác..."}
                      </button>
                    </div>

                    {!showCustomSize ? (
                      <div className="flex flex-wrap gap-2">
                        {STANDARD_SIZES.map((sz) => {
                          const currentSelectedSize = variantForm.watch("size");
                          const isSelected = currentSelectedSize === sz;
                          const alreadyExists =
                            !editingVariant &&
                            activeGroup?.availableSizes.some((s) => s.toUpperCase() === sz.toUpperCase());

                          return (
                            <button
                              key={sz}
                              type="button"
                              disabled={alreadyExists}
                              onClick={() => {
                                variantForm.setValue("size", sz, { shouldValidate: true });
                                if (variantProduct) {
                                  const autoSku = generateSku(variantProduct.slug, currentColorName, sz);
                                  variantForm.setValue("sku", autoSku, { shouldValidate: true });
                                }
                              }}
                              className={cn(
                                "min-w-12 h-9 px-3 rounded-md text-xs font-bold border transition-all flex items-center justify-center gap-1",
                                isSelected
                                  ? "border-primary bg-primary text-primary-foreground shadow-xs"
                                  : alreadyExists
                                  ? "opacity-40 bg-muted border-dashed border-border cursor-not-allowed line-through text-muted-foreground"
                                  : "border-border bg-background hover:bg-muted text-foreground",
                              )}
                              title={alreadyExists ? `Màu ${currentColorName} đã có Size ${sz}` : `Chọn Size ${sz}`}
                            >
                              <span>{sz}</span>
                              {alreadyExists && <span className="text-[9px] font-normal no-underline">(Đã có)</span>}
                            </button>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="space-y-1">
                        <Input
                          id="var-size-custom"
                          className={cn(
                            "h-9 text-xs font-bold",
                            variantForm.formState.errors.size && "border-destructive focus-visible:ring-destructive"
                          )}
                          placeholder="Nhập kích cỡ (VD: Freesize, One Size, 700ml...)"
                          {...variantForm.register("size", {
                            onChange: (e) => {
                              if (variantProduct) {
                                const autoSku = generateSku(variantProduct.slug, currentColorName, e.target.value);
                                variantForm.setValue("sku", autoSku);
                              }
                            },
                          })}
                        />
                      </div>
                    )}
                    {variantForm.formState.errors.size && (
                      <p className="text-xs text-destructive">{variantForm.formState.errors.size.message}</p>
                    )}
                  </div>

                  {/* SKU Input with Auto-generate & Refresh */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="var-sku" className="text-xs">Mã SKU (*)</Label>
                      <button
                        type="button"
                        onClick={() => {
                          if (variantProduct) {
                            const curSize = variantForm.getValues("size") || "M";
                            const newSku = generateSku(variantProduct.slug, currentColorName, curSize);
                            variantForm.setValue("sku", newSku, { shouldValidate: true });
                            toast.info(`Đã tái tạo SKU: ${newSku}`);
                          }
                        }}
                        className="text-[11px] text-primary hover:underline flex items-center gap-1"
                      >
                        <RefreshCw className="size-3" /> Tự sinh lại SKU
                      </button>
                    </div>
                    <Input
                      id="var-sku"
                      className={cn(
                        "h-9 text-xs font-mono font-bold text-primary",
                        variantForm.formState.errors.sku && "border-destructive focus-visible:ring-destructive"
                      )}
                      {...variantForm.register("sku")}
                    />
                    {variantForm.formState.errors.sku && (
                      <p className="text-xs text-destructive">{variantForm.formState.errors.sku.message}</p>
                    )}
                  </div>

                  {/* Price and Original Price */}
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <Label htmlFor="var-price" className="text-xs">Giá niêm yết (đ) (*)</Label>
                      <Input
                        id="var-price"
                        type="number"
                        className="h-9 text-xs"
                        {...variantForm.register("price", { valueAsNumber: true })}
                      />
                      {variantForm.formState.errors.price && (
                        <p className="text-xs text-destructive">{variantForm.formState.errors.price.message}</p>
                      )}
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="var-orig-price" className="text-xs">Giá gốc (đ) (Tùy chọn)</Label>
                      <Input
                        id="var-orig-price"
                        type="number"
                        placeholder="VD: 399000"
                        className="h-9 text-xs"
                        {...variantForm.register("originalPrice", {
                          setValueAs: (v) => (v === "" || v === null || isNaN(v) ? undefined : Number(v)),
                        })}
                      />
                    </div>
                  </div>

                  <DialogFooter className="pt-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setVariantProduct(null);
                        setEditingVariant(null);
                        setSelectedColorTab(null);
                        setIsAddingNewColor(false);
                      }}
                    >
                      Đóng
                    </Button>
                    <Button
                      type="submit"
                      size="sm"
                      disabled={createVariantMutation.isPending || updateVariantMutation.isPending}
                      className="font-bold"
                    >
                      {editingVariant
                        ? updateVariantMutation.isPending
                          ? "Đang lưu..."
                          : "Cập nhật biến thể"
                        : createVariantMutation.isPending
                          ? "Đang lưu..."
                          : "Lưu biến thể mới"}
                    </Button>
                  </DialogFooter>
                </form>
              </div>
            );
          })()}
        </DialogContent>
      </Dialog>

      {/* ------------------------------------------------------------- */}
      {/* CREATE CATEGORY MODAL (POST /api/categories)                  */}
      {/* ------------------------------------------------------------- */}
      <Dialog open={showCatModal} onOpenChange={setShowCatModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="font-bold">Tạo Danh mục Sản phẩm mới</DialogTitle>
          </DialogHeader>
          <form
            onSubmit={catForm.handleSubmit((values) => createCatMutation.mutate(values))}
            className="space-y-4 py-2"
          >
            <div className="space-y-2">
              <Label htmlFor="cat-name">Tên danh mục (*)</Label>
              <Input
                id="cat-name"
                placeholder="Áo Tập Gym Nam"
                {...catForm.register("name", {
                  onChange: (e) => {
                    catForm.setValue("slug", slugify(e.target.value), { shouldValidate: true });
                  },
                })}
              />
              {catForm.formState.errors.name && (
                <p className="text-xs text-destructive">{catForm.formState.errors.name.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="cat-slug">Slug (*)</Label>
                <span className="text-[10px] text-muted-foreground">Tự động sinh theo tên</span>
              </div>
              <Input id="cat-slug" placeholder="ao-tap-gym-nam" {...catForm.register("slug")} />
              {catForm.formState.errors.slug && (
                <p className="text-xs text-destructive">{catForm.formState.errors.slug.message}</p>
              )}
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowCatModal(false)}>
                Hủy
              </Button>
              <Button type="submit" disabled={createCatMutation.isPending} className="font-bold">
                Tạo danh mục
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ------------------------------------------------------------- */}
      {/* EDIT CATEGORY MODAL (PUT /api/categories/{id})                */}
      {/* ------------------------------------------------------------- */}
      <Dialog open={editCategory !== null} onOpenChange={(open) => !open && setEditCategory(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="font-bold">Chỉnh sửa Danh mục: {editCategory?.name}</DialogTitle>
          </DialogHeader>
          <form
            onSubmit={editCatForm.handleSubmit((values) =>
              updateCatMutation.mutate({ id: editCategory!.categoryId, body: values })
            )}
            className="space-y-4 py-2"
          >
            <div className="space-y-2">
              <Label htmlFor="edit-cat-name">Tên danh mục (*)</Label>
              <Input id="edit-cat-name" {...editCatForm.register("name")} />
              {editCatForm.formState.errors.name && (
                <p className="text-xs text-destructive">{editCatForm.formState.errors.name.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-cat-slug">Slug (*)</Label>
              <Input id="edit-cat-slug" {...editCatForm.register("slug")} />
              {editCatForm.formState.errors.slug && (
                <p className="text-xs text-destructive">{editCatForm.formState.errors.slug.message}</p>
              )}
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setEditCategory(null)}>
                Hủy
              </Button>
              <Button type="submit" disabled={updateCatMutation.isPending} className="font-bold">
                Lưu thay đổi
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ------------------------------------------------------------- */}
      {/* CREATE PRODUCT MODAL (POST /api/products)                     */}
      {/* ------------------------------------------------------------- */}
      <Dialog open={showProductModal} onOpenChange={setShowProductModal}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-bold">Tạo Sản phẩm mới trong Catalog</DialogTitle>
          </DialogHeader>
          <form
            onSubmit={productForm.handleSubmit((values) => createProductMutation.mutate(values))}
            className="space-y-4 py-2"
          >
            <div className="space-y-2">
              <Label htmlFor="prod-cat">Danh mục (*)</Label>
              <select
                id="prod-cat"
                className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                {...productForm.register("categoryId")}
              >
                <option value="">-- Chọn danh mục --</option>
                {categoryList.map((cat) => (
                  <option key={cat.categoryId} value={cat.categoryId}>
                    {cat.name}
                  </option>
                ))}
              </select>
              {productForm.formState.errors.categoryId && (
                <p className="text-xs text-destructive">{productForm.formState.errors.categoryId.message}</p>
              )}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="prod-name">Tên sản phẩm (*)</Label>
                <Input
                  id="prod-name"
                  placeholder="GymKitten Essential Tee"
                  {...productForm.register("name", {
                    onChange: (e) => {
                      productForm.setValue("slug", slugify(e.target.value), { shouldValidate: true });
                    },
                  })}
                />
                {productForm.formState.errors.name && (
                  <p className="text-xs text-destructive">{productForm.formState.errors.name.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="prod-slug">Slug (*)</Label>
                  <span className="text-[10px] text-muted-foreground">Tự động sinh theo tên</span>
                </div>
                <Input id="prod-slug" placeholder="gymkitten-essential-tee" {...productForm.register("slug")} />
                {productForm.formState.errors.slug && (
                  <p className="text-xs text-destructive">{productForm.formState.errors.slug.message}</p>
                )}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="prod-gender">Giới tính (*)</Label>
                <select
                  id="prod-gender"
                  className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                  {...productForm.register("gender")}
                >
                  <option value="Men">Nam (Men)</option>
                  <option value="Women">Nữ (Women)</option>
                  <option value="Unisex">Unisex</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="prod-fit">Fit Type (Slim / Regular)</Label>
                <Input id="prod-fit" placeholder="Slim" {...productForm.register("fitType")} />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="prod-desc">Mô tả sản phẩm</Label>
              <Textarea id="prod-desc" rows={3} {...productForm.register("description")} />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowProductModal(false)}>
                Hủy
              </Button>
              <Button type="submit" disabled={createProductMutation.isPending} className="font-bold">
                Tạo sản phẩm
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ------------------------------------------------------------- */}
      {/* UPLOAD & MANAGE IMAGES MODAL (GET/POST/DELETE /api/products/images) */}
      {/* ------------------------------------------------------------- */}
      <Dialog open={imageProduct !== null} onOpenChange={(open) => !open && setImageProduct(null)}>
        <DialogContent className="max-w-xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-bold flex items-center gap-2">
              <ImageIcon className="size-5 text-blue-600" /> Quản lý Hình ảnh — {imageProduct?.name}
            </DialogTitle>
            <DialogDescription>
              Xem danh sách ảnh hiện có, xóa ảnh bị lỗi hoặc Upload thêm ảnh cho Sản phẩm gốc hoặc Biến thể cụ thể.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-2">
            {/* Gallery ảnh hiện có */}
            <div className="space-y-2 border rounded-lg p-3 bg-muted/20">
              <h4 className="text-xs font-bold uppercase text-foreground flex items-center justify-between">
                <span>Hình ảnh hiện có ({productImagesQuery.data?.length || 0})</span>
                {productImagesQuery.isFetching && <span className="text-[10px] text-muted-foreground font-normal">Đang tải...</span>}
              </h4>

              {productImagesQuery.isLoading ? (
                <div className="py-8 text-center text-xs text-muted-foreground">Đang tải bộ sưu tập ảnh...</div>
              ) : !productImagesQuery.data || productImagesQuery.data.length === 0 ? (
                <div className="py-8 text-center text-xs text-muted-foreground border border-dashed rounded-lg bg-background">
                  Chưa có hình ảnh nào cho sản phẩm này. Hãy chọn ảnh và upload ở bên dưới!
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {productImagesQuery.data.map((img) => {
                    const matchedVariant = imageProductVariantsQuery.data?.find((v) => v.variantId === img.variantId);
                    const colorName = img.colorName || matchedVariant?.colorName;
                    const colorHex = img.colorHex || matchedVariant?.colorHex;
                    return (
                      <div key={img.imageId} className="group relative rounded-lg border bg-background overflow-hidden shadow-sm">
                        <div className="aspect-square w-full overflow-hidden bg-muted">
                          <img src={img.imageUrl} alt="Product image" className="h-full w-full object-cover transition-transform group-hover:scale-105" />
                        </div>
                        <div className="p-2 space-y-1">
                          <div className="flex items-center justify-between text-[10px] gap-1">
                            {img.variantId && colorName ? (
                              <Badge variant="secondary" className="font-bold text-[9px] truncate max-w-[140px] flex items-center gap-1.5 py-0.5">
                                <span
                                  className="size-2.5 rounded-full border shadow-xs shrink-0"
                                  style={{ backgroundColor: colorHex || "#000000" }}
                                />
                                <span className="truncate">Màu {colorName}</span>
                                {colorHex && <span className="font-mono text-[8px] opacity-75 shrink-0">({colorHex})</span>}
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="text-[9px]">Gốc (Product)</Badge>
                            )}
                            {img.isPrimary && <Badge className="bg-amber-500 text-white text-[9px] py-0 px-1 shrink-0 font-bold">Chính</Badge>}
                          </div>
                        </div>

                        {/* Delete Image Overlay Button */}
                        <button
                          type="button"
                          onClick={() => {
                            if (confirm("Bạn có chắc chắn muốn xóa hình ảnh này?")) {
                              deleteImageMutation.mutate(img.imageId);
                            }
                          }}
                          className="absolute top-1.5 right-1.5 p-1.5 rounded-full bg-destructive/90 text-white shadow-md hover:bg-destructive transition-colors opacity-90 sm:opacity-0 sm:group-hover:opacity-100"
                          title="Xóa hình ảnh này"
                        >
                          <Trash2 className="size-3.5" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Upload Form */}
            <div className="space-y-4 border rounded-lg p-4 bg-background">
              <h4 className="text-xs font-bold uppercase text-foreground flex items-center gap-1.5">
                <Upload className="size-4 text-blue-600" /> Upload ảnh mới
              </h4>

              {/* Target Variant Selector (Grouped by Color) */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="target-variant" className="text-xs font-semibold">Áp dụng hình ảnh cho (*)</Label>
                  <span className="text-[10px] text-muted-foreground">Bấm chọn màu hoặc chọn trong danh sách</span>
                </div>

                {/* Quick Color Swatches Click */}
                {imageProductColorGroupsQuery.data && imageProductColorGroupsQuery.data.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    <button
                      type="button"
                      onClick={() => setSelectedVariantId("")}
                      className={cn(
                        "px-2.5 py-1 rounded-md border text-xs transition-all",
                        selectedVariantId === ""
                          ? "border-primary bg-primary/10 ring-1 ring-primary font-bold text-foreground"
                          : "border-border bg-background hover:bg-muted text-muted-foreground"
                      )}
                    >
                      Sản phẩm gốc
                    </button>
                    {imageProductColorGroupsQuery.data.map((g) => {
                      const isSelected = selectedVariantId === g.representativeVariantId;
                      return (
                        <button
                          key={g.representativeVariantId}
                          type="button"
                          onClick={() => setSelectedVariantId(g.representativeVariantId)}
                          className={cn(
                            "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-xs transition-all",
                            isSelected
                              ? "border-primary bg-primary/10 ring-1 ring-primary font-bold text-foreground shadow-xs"
                              : "border-border bg-background hover:bg-muted text-muted-foreground hover:text-foreground"
                          )}
                        >
                          <span
                            className="size-3 rounded-full border shadow-xs shrink-0"
                            style={{ backgroundColor: g.colorHex || "#000000" }}
                          />
                          <span>{g.colorName}</span>
                          {g.colorHex && <span className="font-mono text-[9px] opacity-75 font-normal">({g.colorHex})</span>}
                          {isSelected && <Check className="size-3 text-primary" />}
                        </button>
                      );
                    })}
                  </div>
                )}

                <select
                  id="target-variant"
                  value={selectedVariantId}
                  onChange={(e) => setSelectedVariantId(e.target.value)}
                  className="w-full h-9 px-3 rounded-md border border-input bg-background text-xs font-medium"
                >
                  <option value="">-- Sản phẩm gốc (Dùng chung cho tất cả biến thể) --</option>
                  {imageProductColorGroupsQuery.data && imageProductColorGroupsQuery.data.length > 0
                    ? imageProductColorGroupsQuery.data.map((g) => (
                        <option key={g.representativeVariantId} value={g.representativeVariantId}>
                          Màu sắc: {g.colorName} [ {g.colorHex || "N/A"} ] (Áp dụng cho {g.variants.length} size: {g.availableSizes.join(", ")})
                        </option>
                      ))
                    : imageProductVariantsQuery.data?.map((v) => (
                        <option key={v.variantId} value={v.variantId}>
                          Biến thể: {v.colorName} [ {v.colorHex || "N/A"} ] - Size {v.size} (SKU: {v.sku})
                        </option>
                      ))}
                </select>

                {/* Selected Color Visual Feedback */}
                {selectedVariantId ? (() => {
                  const selectedGroup = imageProductColorGroupsQuery.data?.find((g) => g.representativeVariantId === selectedVariantId);
                  const selectedVariant = imageProductVariantsQuery.data?.find((v) => v.variantId === selectedVariantId);
                  const cName = selectedGroup?.colorName || selectedVariant?.colorName;
                  const cHex = selectedGroup?.colorHex || selectedVariant?.colorHex;
                  return (
                    <div className="flex items-center justify-between p-2.5 rounded-lg border bg-primary/5 border-primary/20 text-xs">
                      <div className="flex items-center gap-2">
                        <span
                          className="size-4 rounded-full border shadow-xs shrink-0"
                          style={{ backgroundColor: cHex || "#000000" }}
                        />
                        <span>
                          Gán ảnh cho màu: <strong className="font-bold text-foreground">{cName}</strong>
                          {cHex && (
                            <span className="ml-2 font-mono text-[10px] px-1.5 py-0.5 rounded bg-muted border font-semibold">
                              {cHex}
                            </span>
                          )}
                        </span>
                      </div>
                      <Badge variant="secondary" className="text-[10px]">
                        {selectedGroup ? `${selectedGroup.variants.length} size (${selectedGroup.availableSizes.join(", ")})` : "1 biến thể"}
                      </Badge>
                    </div>
                  );
                })() : (
                  <div className="flex items-center justify-between p-2 rounded-lg border border-dashed bg-muted/20 text-[11px] text-muted-foreground">
                    <span>Đang chọn: <strong>Ảnh sản phẩm gốc</strong> (Hiển thị chung khi chưa chọn màu).</span>
                  </div>
                )}
                <p className="text-[11px] text-muted-foreground">Ảnh gán cho một màu sẽ tự động hiển thị cho mọi size của màu đó trên trang sản phẩm.</p>
              </div>

              {/* File Input */}
              <div className="space-y-2">
                <Label htmlFor="photo-upload" className="text-xs">Chọn file ảnh từ máy tính (*)</Label>
                <Input
                  id="photo-upload"
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={(e) => setSelectedFiles(e.target.files)}
                  className="h-9 text-xs cursor-pointer"
                />
              </div>

              <DialogFooter className="pt-2">
                <Button type="button" variant="outline" size="sm" onClick={() => setImageProduct(null)}>
                  Đóng
                </Button>
                <Button type="button" size="sm" disabled={isUploading} onClick={handleUploadImages} className="font-bold gap-1.5">
                  <Upload className="size-3.5" /> {isUploading ? "Đang upload..." : "Upload ngay"}
                </Button>
              </DialogFooter>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal Dialog Quản Lý Bảng Size Guide (Admin APIs 1.3 & 1.4) */}
      <Dialog open={!!sizeGuideProduct} onOpenChange={(open) => !open && setSizeGuideProduct(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="font-extrabold text-lg flex items-center gap-2 text-primary">
              <Ruler className="size-5" /> Quản Lý Bảng Size — {sizeGuideProduct?.name}
            </DialogTitle>
            <DialogDescription className="text-xs">
              Thiết lập thông số số đo chuẩn (Vòng ngực, Vòng eo, Vòng hông, Chiều cao) cho từng kích cỡ của sản phẩm này.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-2">
            {/* Existing Size Guide Rows Table */}
            <div className="space-y-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">
                  Danh sách số đo kích cỡ hiện tại ({sizeGuideQuery.data?.items?.length || 0})
                </h4>
                {sizeGuideQuery.data?.items && sizeGuideQuery.data.items.length > 0 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={isSeedingAllSizes}
                    onClick={handleQuickSeedStandardSizes}
                    className="h-7 text-xs font-semibold gap-1.5 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 border-emerald-300"
                  >
                    <Zap className="size-3 text-amber-500" />
                    {isSeedingAllSizes ? "Đang tạo..." : "Thêm nhanh các size chuẩn còn thiếu"}
                  </Button>
                )}
              </div>
              {sizeGuideQuery.isLoading ? (
                <div className="py-6 text-center text-xs text-muted-foreground">Đang nạp bảng size...</div>
              ) : !sizeGuideQuery.data?.items || sizeGuideQuery.data.items.length === 0 ? (
                <div className="p-6 text-center border border-dashed rounded-xl text-xs text-muted-foreground space-y-3 bg-muted/10">
                  <p>Sản phẩm này chưa được tạo bảng size. Bạn có thể tự điền bên dưới hoặc bấm nút dưới để tạo nhanh toàn bộ các size chuẩn.</p>
                  <Button
                    type="button"
                    size="sm"
                    disabled={isSeedingAllSizes}
                    onClick={handleQuickSeedStandardSizes}
                    className="font-bold gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs"
                  >
                    <Zap className="size-3.5 text-amber-300" />
                    {isSeedingAllSizes ? "Đang tạo bảng size..." : "Tạo nhanh bảng size chuẩn (S, M, L, XL)"}
                  </Button>
                </div>
              ) : (
                <div className="border rounded-xl overflow-hidden shadow-sm">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-muted/60 font-bold border-b text-muted-foreground">
                      <tr>
                        <th className="py-2.5 px-3">Size</th>
                        <th className="py-2.5 px-3">Vòng Ngực (cm)</th>
                        <th className="py-2.5 px-3">Vòng Eo (cm)</th>
                        <th className="py-2.5 px-3">Vòng Hông (cm)</th>
                        <th className="py-2.5 px-3">Chiều Cao (cm)</th>
                        <th className="py-2.5 px-3 text-right">Thao tác</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {sizeGuideQuery.data.items.map((item) => (
                        <tr key={item.guideId} className="hover:bg-muted/30">
                          <td className="py-2.5 px-3 font-black text-primary">{item.size}</td>
                          <td className="py-2.5 px-3">{item.chestCm || "N/A"}</td>
                          <td className="py-2.5 px-3">{item.waistCm || "N/A"}</td>
                          <td className="py-2.5 px-3">{item.hipsCm || "N/A"}</td>
                          <td className="py-2.5 px-3">{item.heightRangeCm || "N/A"}</td>
                          <td className="py-2.5 px-3 text-right">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                setEditingGuideId(item.guideId);
                                setGuideSize(item.size);

                                const parseStrRange = (str?: string): { min: number | ""; max: number | "" } => {
                                  if (!str) return { min: "", max: "" };
                                  const parts = str.split("-").map((p) => p.trim());
                                  const min: number | "" = parts[0] && !isNaN(Number(parts[0])) ? Number(parts[0]) : "";
                                  const max: number | "" = parts[1] && !isNaN(Number(parts[1])) ? Number(parts[1]) : "";
                                  return { min, max };
                                };

                                const c = parseStrRange(item.chestCm);
                                setChestMin(c.min);
                                setChestMax(c.max);

                                const w = parseStrRange(item.waistCm);
                                setWaistMin(w.min);
                                setWaistMax(w.max);

                                const h = parseStrRange(item.hipsCm);
                                setHipsMin(h.min);
                                setHipsMax(h.max);

                                const ht = parseStrRange(item.heightRangeCm);
                                setHeightMin(ht.min);
                                setHeightMax(ht.max);
                              }}
                              className="h-7 text-[11px] font-bold text-amber-600 px-2"
                            >
                              Sửa
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Form Add / Edit Size Guide Row */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                saveSizeGuideMutation.mutate();
              }}
              className="space-y-4 border rounded-2xl p-5 bg-muted/20 shadow-sm"
            >
              <div className="flex items-center justify-between pb-2 border-b border-border/60">
                <h4 className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-1.5">
                  <Ruler className="size-4 text-primary" />
                  {editingGuideId ? `Chỉnh sửa dòng quy đổi (Size ${guideSize})` : "Thêm dòng quy đổi size mới"}
                </h4>
                {editingGuideId && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => resetSizeGuideForm()}
                    className="h-7 text-xs text-muted-foreground hover:text-foreground font-semibold"
                  >
                    Hủy sửa (Tạo dòng mới)
                  </Button>
                )}
              </div>

              {/* Row 1: Size Selector & Quick Pills */}
              <div className="space-y-2.5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="gs-size" className="text-xs font-bold text-foreground">
                      Kích cỡ (Size) (*)
                    </Label>
                    <Badge variant="secondary" className="text-[10px] font-bold py-0.5 px-2 bg-primary/10 text-primary border border-primary/20">
                      {sizeGuideProduct?.gender?.toLowerCase() === "women" ? "Số đo chuẩn Nữ" : "Số đo chuẩn Nam"}
                    </Badge>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => applyPresetForSize(guideSize)}
                    className="h-7 text-xs font-semibold gap-1.5 text-primary border-primary/30 hover:bg-primary/10 self-start sm:self-auto"
                  >
                    <Sparkles className="size-3 text-amber-500" /> Tự động điền số đo chuẩn Size {guideSize}
                  </Button>
                </div>

                {/* Quick Size Select Pills */}
                <div className="flex flex-wrap items-center gap-1.5">
                  {["XS", "S", "M", "L", "XL", "XXL", "3XL", "FreeSize"].map((s) => {
                    const isSelected = guideSize === s;
                    const isExisting = sizeGuideQuery.data?.items?.some(
                      (item) => item.size.toUpperCase() === s.toUpperCase()
                    );
                    return (
                      <button
                        key={s}
                        type="button"
                        onClick={() => {
                          setGuideSize(s);
                          if (!editingGuideId) {
                            applyPresetForSize(s);
                          }
                        }}
                        className={cn(
                          "px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border",
                          isSelected
                            ? "bg-primary text-primary-foreground border-primary shadow-xs ring-2 ring-primary/30"
                            : isExisting
                            ? "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800 hover:border-emerald-500"
                            : "bg-background text-foreground border-border hover:border-primary/40 hover:bg-muted/40"
                        )}
                      >
                        <span>Size {s}</span>
                        {isExisting && (
                          <span className="size-1.5 rounded-full bg-emerald-500 shrink-0" title="Đã có trong bảng size" />
                        )}
                      </button>
                    );
                  })}
                </div>

                <div className="max-w-xs pt-1">
                  <select
                    id="gs-size"
                    value={guideSize}
                    onChange={(e) => {
                      const newSize = e.target.value;
                      setGuideSize(newSize);
                      if (!editingGuideId) {
                        applyPresetForSize(newSize);
                      }
                    }}
                    className="w-full h-9 px-3 rounded-lg border border-input bg-background text-xs font-black text-primary shadow-xs"
                  >
                    {["XS", "S", "M", "L", "XL", "XXL", "3XL", "FreeSize"].map((s) => (
                      <option key={s} value={s}>
                        Size {s}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Row 2: 2x2 Grid for Measurement Ranges */}
              <div className="grid gap-4 sm:grid-cols-2 pt-1">
                {/* Vòng Ngực Range */}
                <div className="p-3.5 bg-background border border-border/80 rounded-xl space-y-2 shadow-2xs">
                  <Label className="text-xs font-bold text-foreground">Vòng Ngực (cm)</Label>
                  <div className="grid grid-cols-2 gap-2.5 items-center">
                    <div>
                      <span className="text-[10px] text-muted-foreground font-medium block mb-1">Từ (Min)</span>
                      <Input
                        type="number"
                        placeholder="Ví dụ: 88"
                        value={chestMin}
                        onChange={(e) => setChestMin(e.target.value === "" ? "" : Number(e.target.value))}
                        className="h-8 text-xs font-semibold"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-muted-foreground font-medium block mb-1">Đến (Max)</span>
                      <Input
                        type="number"
                        placeholder="Ví dụ: 94"
                        value={chestMax}
                        onChange={(e) => setChestMax(e.target.value === "" ? "" : Number(e.target.value))}
                        className="h-8 text-xs font-semibold"
                      />
                    </div>
                  </div>
                </div>

                {/* Vòng Eo Range */}
                <div className="p-3.5 bg-background border border-border/80 rounded-xl space-y-2 shadow-2xs">
                  <Label className="text-xs font-bold text-foreground">Vòng Eo (cm)</Label>
                  <div className="grid grid-cols-2 gap-2.5 items-center">
                    <div>
                      <span className="text-[10px] text-muted-foreground font-medium block mb-1">Từ (Min)</span>
                      <Input
                        type="number"
                        placeholder="Ví dụ: 72"
                        value={waistMin}
                        onChange={(e) => setWaistMin(e.target.value === "" ? "" : Number(e.target.value))}
                        className="h-8 text-xs font-semibold"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-muted-foreground font-medium block mb-1">Đến (Max)</span>
                      <Input
                        type="number"
                        placeholder="Ví dụ: 78"
                        value={waistMax}
                        onChange={(e) => setWaistMax(e.target.value === "" ? "" : Number(e.target.value))}
                        className="h-8 text-xs font-semibold"
                      />
                    </div>
                  </div>
                </div>

                {/* Vòng Hông Range */}
                <div className="p-3.5 bg-background border border-border/80 rounded-xl space-y-2 shadow-2xs">
                  <Label className="text-xs font-bold text-foreground">Vòng Hông (cm)</Label>
                  <div className="grid grid-cols-2 gap-2.5 items-center">
                    <div>
                      <span className="text-[10px] text-muted-foreground font-medium block mb-1">Từ (Min)</span>
                      <Input
                        type="number"
                        placeholder="Ví dụ: 96"
                        value={hipsMin}
                        onChange={(e) => setHipsMin(e.target.value === "" ? "" : Number(e.target.value))}
                        className="h-8 text-xs font-semibold"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-muted-foreground font-medium block mb-1">Đến (Max)</span>
                      <Input
                        type="number"
                        placeholder="Ví dụ: 102"
                        value={hipsMax}
                        onChange={(e) => setHipsMax(e.target.value === "" ? "" : Number(e.target.value))}
                        className="h-8 text-xs font-semibold"
                      />
                    </div>
                  </div>
                </div>

                {/* Chiều Cao Range */}
                <div className="p-3.5 bg-background border border-border/80 rounded-xl space-y-2 shadow-2xs">
                  <Label className="text-xs font-bold text-foreground">Chiều cao (cm)</Label>
                  <div className="grid grid-cols-2 gap-2.5 items-center">
                    <div>
                      <span className="text-[10px] text-muted-foreground font-medium block mb-1">Từ (Min)</span>
                      <Input
                        type="number"
                        placeholder="Ví dụ: 168"
                        value={heightMin}
                        onChange={(e) => setHeightMin(e.target.value === "" ? "" : Number(e.target.value))}
                        className="h-8 text-xs font-semibold"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-muted-foreground font-medium block mb-1">Đến (Max)</span>
                      <Input
                        type="number"
                        placeholder="Ví dụ: 175"
                        value={heightMax}
                        onChange={(e) => setHeightMax(e.target.value === "" ? "" : Number(e.target.value))}
                        className="h-8 text-xs font-semibold"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <DialogFooter className="pt-3 border-t border-border/60">
                <Button type="button" variant="outline" size="sm" onClick={() => setSizeGuideProduct(null)}>
                  Đóng
                </Button>
                <Button type="submit" size="sm" disabled={saveSizeGuideMutation.isPending} className="font-bold gap-1.5 shadow-sm">
                  {saveSizeGuideMutation.isPending ? "Đang lưu..." : editingGuideId ? "Cập Nhật Dòng Size" : "Lưu Dòng Size Mới"}
                </Button>
              </DialogFooter>
            </form>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
