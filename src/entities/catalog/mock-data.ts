import teePurple from "@/assets/image (4).jpg";
import teeBlack from "@/assets/image.jpg";
import leggingsBlack from "@/assets/image (5).jpg";
import braTaupe from "@/assets/image (3).jpg";
import hoodieCharcoal from "@/assets/image (2).jpg";
import shortsNavy from "@/assets/image (1).jpg";
import type { Category, Product, ProductImage, ProductVariant, SizeGuideRow } from "./types";
import type { ProductReview } from "@/entities/social/types";

export const MOCK_CATEGORIES: Category[] = [
  {
    categoryId: "c1",
    parentCategoryId: null,
    name: "Nam",
    slug: "men",
    description: "Đồ tập nam",
    displayOrder: 1,
  },
  {
    categoryId: "c2",
    parentCategoryId: null,
    name: "Nữ",
    slug: "women",
    description: "Đồ tập nữ",
    displayOrder: 2,
  },
  {
    categoryId: "c3",
    parentCategoryId: "c1",
    name: "Áo nam",
    slug: "men-tops",
    description: "Áo thun, tank top nam",
    displayOrder: 3,
  },
  {
    categoryId: "c4",
    parentCategoryId: "c1",
    name: "Quần nam",
    slug: "men-bottoms",
    description: "Quần short, jogger nam",
    displayOrder: 4,
  },
  {
    categoryId: "c5",
    parentCategoryId: "c2",
    name: "Áo nữ",
    slug: "women-tops",
    description: "Áo bra, crop top",
    displayOrder: 5,
  },
  {
    categoryId: "c6",
    parentCategoryId: "c2",
    name: "Quần nữ",
    slug: "women-bottoms",
    description: "Legging, short nữ",
    displayOrder: 6,
  },
  {
    categoryId: "c7",
    parentCategoryId: null,
    name: "Outerwear",
    slug: "outerwear",
    description: "Hoodie, jacket",
    displayOrder: 7,
  },
];

const SIZE_SET = ["XS", "S", "M", "L", "XL"];

function buildVariants(
  productId: string,
  skuBase: string,
  colors: { name: string; hex: string }[],
  price: number,
  originalPrice: number | null,
  sizes: string[] = SIZE_SET,
): ProductVariant[] {
  return colors.flatMap((color, ci) =>
    sizes.map((size, si) => ({
      variantId: `${productId}-v${ci}${si}`,
      productId,
      sku: `${skuBase}-${color.name.slice(0, 3).toUpperCase()}-${size}`,
      colorName: color.name,
      colorHex: color.hex,
      size,
      price,
      originalPrice,
      weightGrams: 220,
      available: (ci + si) % 7 === 0 ? 0 : 4 + ((ci * 5 + si * 3) % 20),
    })),
  );
}

function buildImages(productId: string, urls: string[]): ProductImage[] {
  return urls.map((imageUrl, i) => ({
    imageId: `${productId}-img${i}`,
    productId,
    variantId: null,
    imageUrl,
    displayOrder: i,
    isPrimary: i === 0,
  }));
}

function buildSizeGuide(productId: string, sizes: string[] = SIZE_SET): SizeGuideRow[] {
  const base = 84;
  return sizes.map((size, i) => ({
    guideId: `${productId}-sg${i}`,
    productId,
    size,
    chestCm: `${base + i * 6}-${base + 5 + i * 6}`,
    waistCm: `${base - 14 + i * 6}-${base - 9 + i * 6}`,
    hipsCm: `${base + 4 + i * 6}-${base + 9 + i * 6}`,
    heightRangeCm: `${160 + i * 5}-${168 + i * 5}`,
  }));
}

export const MOCK_PRODUCTS: Product[] = [
  {
    productId: "p1",
    categoryId: "c3",
    name: "Devant Seamless T-Shirt",
    slug: "devant-seamless-t-shirt",
    description:
      "Áo thun seamless dệt liền mạch, ôm form nhưng vẫn co giãn tối đa khi tập. Vùng sườn dệt thoáng khí giúp thoát ẩm nhanh, đường may tối giản chống cọ xát.",
    fitType: "Muscle Fit",
    gender: "Men",
    isActive: true,
    variants: buildVariants(
      "p1",
      "GS-DEV-TEE",
      [
        { name: "Rich Purple", hex: "#7b3fa0" },
        { name: "Black", hex: "#111111" },
      ],
      890_000,
      1_190_000,
    ),
    images: buildImages("p1", [teePurple, teeBlack]),
    sizeGuide: buildSizeGuide("p1"),
    ratingAverage: 4.6,
    reviewCount: 128,
    badges: ["Bán chạy", "Giảm giá"],
  },
  {
    productId: "p2",
    categoryId: "c7",
    name: "Crest Oversized Hoodie",
    slug: "crest-oversized-hoodie",
    description:
      "Hoodie cotton pha nỉ chải mềm, dáng oversized thoải mái cho ngày nghỉ hoặc khởi động trước buổi tập.",
    fitType: "Oversized Fit",
    gender: "Unisex",
    isActive: true,
    variants: buildVariants(
      "p2",
      "GS-CRE-HOD",
      [
        { name: "Charcoal", hex: "#3a3f45" },
        { name: "Black", hex: "#111111" },
      ],
      1_490_000,
      null,
    ),
    images: buildImages("p2", [hoodieCharcoal]),
    sizeGuide: buildSizeGuide("p2"),
    ratingAverage: 4.8,
    reviewCount: 96,
    badges: ["Mới"],
  },
  {
    productId: "p3",
    categoryId: "c4",
    name: 'Arrival 5" Training Shorts',
    slug: "arrival-5-training-shorts",
    description:
      "Quần short chạy bộ siêu nhẹ, vải dệt chống nước nhẹ, có túi khoá kéo và lớp lót trong thoáng khí.",
    fitType: "Regular Fit",
    gender: "Men",
    isActive: true,
    variants: buildVariants(
      "p3",
      "GS-ARR-SHT",
      [
        { name: "Navy", hex: "#1f2f4d" },
        { name: "Black", hex: "#111111" },
      ],
      690_000,
      850_000,
    ),
    images: buildImages("p3", [shortsNavy]),
    sizeGuide: buildSizeGuide("p3"),
    ratingAverage: 4.4,
    reviewCount: 214,
    badges: ["Giảm giá"],
  },
  {
    productId: "p4",
    categoryId: "c6",
    name: "Vital Seamless Leggings",
    slug: "vital-seamless-leggings",
    description:
      "Legging cạp cao seamless, chất vải dày dặn không lộ, đường dệt ôm dáng nâng đỡ vùng hông và đùi.",
    fitType: "High Waisted",
    gender: "Women",
    isActive: true,
    variants: buildVariants(
      "p4",
      "GS-VIT-LEG",
      [
        { name: "Black", hex: "#111111" },
        { name: "Slate", hex: "#5b6169" },
      ],
      1_190_000,
      null,
    ),
    images: buildImages("p4", [leggingsBlack]),
    sizeGuide: buildSizeGuide("p4"),
    ratingAverage: 4.9,
    reviewCount: 512,
    badges: ["Bán chạy"],
  },
  {
    productId: "p5",
    categoryId: "c5",
    name: "Adapt Seamless Sports Bra",
    slug: "adapt-seamless-sports-bra",
    description:
      "Bra thể thao nâng đỡ mức trung bình, dây lưng bản rộng ôm nhẹ, phù hợp tập tạ và pilates.",
    fitType: "Medium Support",
    gender: "Women",
    isActive: true,
    variants: buildVariants(
      "p5",
      "GS-ADA-BRA",
      [
        { name: "Taupe", hex: "#b09a8c" },
        { name: "Black", hex: "#111111" },
      ],
      790_000,
      990_000,
    ),
    images: buildImages("p5", [braTaupe]),
    sizeGuide: buildSizeGuide("p5"),
    ratingAverage: 4.5,
    reviewCount: 187,
    badges: ["Giảm giá"],
  },
  {
    productId: "p6",
    categoryId: "c3",
    name: "Essential Training Tee",
    slug: "essential-training-tee",
    description:
      "Áo thun tập cơ bản, vải cotton pha co giãn 4 chiều, form regular dễ mặc hằng ngày.",
    fitType: "Regular Fit",
    gender: "Men",
    isActive: true,
    variants: buildVariants(
      "p6",
      "GS-ESS-TEE",
      [
        { name: "Black", hex: "#111111" },
        { name: "Rich Purple", hex: "#7b3fa0" },
      ],
      590_000,
      null,
    ),
    images: buildImages("p6", [teeBlack, teePurple]),
    sizeGuide: buildSizeGuide("p6"),
    ratingAverage: 4.3,
    reviewCount: 64,
    badges: [],
  },
  {
    productId: "p7",
    categoryId: "c6",
    name: "Studio Flow Shorts",
    slug: "studio-flow-shorts",
    description: "Short tập nữ cạp cao, ôm nhẹ, không lộ khi squat, có túi bên hông.",
    fitType: "High Waisted",
    gender: "Women",
    isActive: true,
    variants: buildVariants(
      "p7",
      "GS-STU-SHT",
      [
        { name: "Black", hex: "#111111" },
        { name: "Taupe", hex: "#b09a8c" },
      ],
      650_000,
      null,
    ),
    images: buildImages("p7", [leggingsBlack, braTaupe]),
    sizeGuide: buildSizeGuide("p7"),
    ratingAverage: 4.2,
    reviewCount: 41,
    badges: ["Mới"],
  },
  {
    productId: "p8",
    categoryId: "c7",
    name: "Legacy Fitness Hoodie",
    slug: "legacy-fitness-hoodie",
    description: "Hoodie nỉ dày dáng regular, mũ hai lớp, phù hợp mùa lạnh và ngày phục hồi.",
    fitType: "Regular Fit",
    gender: "Unisex",
    isActive: true,
    variants: buildVariants(
      "p8",
      "GS-LEG-HOD",
      [
        { name: "Charcoal", hex: "#3a3f45" },
        { name: "Slate", hex: "#5b6169" },
      ],
      1_690_000,
      1_990_000,
    ),
    images: buildImages("p8", [hoodieCharcoal]),
    sizeGuide: buildSizeGuide("p8"),
    ratingAverage: 4.7,
    reviewCount: 73,
    badges: ["Giảm giá"],
  },
];

export const MOCK_REVIEWS: ProductReview[] = [
  {
    reviewId: "r1",
    productId: "p1",
    userId: "u2",
    authorName: "Minh T.",
    orderId: "o1",
    rating: 5,
    comment: "Form ôm rất đẹp, vải mát và không bị bí khi tập nặng. Sẽ mua thêm màu đen.",
    fitFeedback: "TrueToSize",
    createdAt: "2026-06-12T09:12:00Z",
    medias: [],
  },
  {
    reviewId: "r2",
    productId: "p1",
    userId: "u3",
    authorName: "Hoàng L.",
    orderId: "o2",
    rating: 4,
    comment: "Chất seamless mềm, nhưng hơi ngắn thân với người cao 1m80.",
    fitFeedback: "TooSmall",
    createdAt: "2026-05-28T14:40:00Z",
    medias: [],
  },
  {
    reviewId: "r3",
    productId: "p4",
    userId: "u4",
    authorName: "Ngọc A.",
    orderId: "o3",
    rating: 5,
    comment: "Legging không lộ, cạp cao ôm bụng rất chắc chắn khi squat.",
    fitFeedback: "TrueToSize",
    createdAt: "2026-07-02T03:05:00Z",
    medias: [],
  },
  {
    reviewId: "r4",
    productId: "p2",
    userId: "u5",
    authorName: "Duy K.",
    orderId: "o4",
    rating: 5,
    comment: "Hoodie dày dặn, form oversized chuẩn như hình.",
    fitFeedback: "TooLarge",
    createdAt: "2026-07-19T11:25:00Z",
    medias: [],
  },
];
