export interface InventoryItem {
  variantId: string;
  sku: string;
  productName: string;
  color: string;
  size: string;
  quantityOnHand: number;
  quantityReserved: number;
  availableStock: number;
}

export interface InventoryQueryParams {
  sku?: string;
  productName?: string;
  page?: number;
  pageSize?: number;
}

export interface InventoryPaginatedResponse {
  items: InventoryItem[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface RestockRequest {
  variantId: string;
  quantity: number;
  referenceId?: string;
}

export interface AdjustRequest {
  variantId: string;
  newQuantity: number;
  note?: string;
}

export interface TransactionItem {
  transactionId: string;
  orderCode: string;
  userEmail: string;
  gateway: "VnPay" | "MoMo" | "COD" | string;
  amount: number;
  status: "Success" | "Failed" | "Pending" | string;
  createdAt: string;
  paymentDate?: string;
}

export interface TransactionQueryParams {
  startDate?: string;
  endDate?: string;
  status?: string;
  gateway?: string;
  page?: number;
  pageSize?: number;
}

export interface TransactionPaginatedResponse {
  items: TransactionItem[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface AdminOrderItem {
  orderId: string;
  orderCode: string;
  userEmail: string;
  shippingAddress: string;
  totalAmount: number;
  currentStatus: "Pending" | "Processing" | "Shipped" | "Completed" | "Cancelled" | string;
  paymentStatus: "Unpaid" | "Paid" | string;
  paymentMethod: string;
  createdAt: string;
  itemsCount: number;
}

export interface ShipOrderResponse {
  orderId: string;
  status: string;
  shippedAt: string;
}

export interface CategoryDto {
  categoryId: string;
  parentCategoryId: string | null;
  name: string;
  slug: string;
  description: string | null;
  displayOrder: number;
}

export interface CreateCategoryRequest {
  parentCategoryId?: string | null;
  name: string;
  slug: string;
  description?: string;
  displayOrder?: number;
}

export interface ProductPaginatedResponse {
  items: AdminProductDto[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface OrderPaginatedResponse {
  items: AdminOrderItem[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface AdminProductDto {
  productId: string;
  categoryId: string;
  categoryName?: string;
  name: string;
  slug: string;
  description: string | null;
  fitType: string | null;
  gender: string;
  isActive: boolean;
  createdAt: string;
  variantsCount?: number;
  primaryImageUrl?: string | null;
}

export interface CreateProductRequest {
  categoryId: string;
  name: string;
  slug: string;
  description?: string;
  fitType?: string;
  gender: "Men" | "Women" | "Unisex";
}

export interface UpdateProductRequest extends CreateProductRequest {
  productId: string;
  isActive: boolean;
}

export interface VariantDto {
  variantId: string;
  productId: string;
  sku: string;
  colorName: string;
  colorHex: string;
  size: string;
  price: number;
  originalPrice: number | null;
  weightGrams: number | null;
  availableStock?: number;
}

export interface CreateVariantRequest {
  productId: string;
  sku: string;
  colorName: string;
  colorHex: string;
  size: string;
  price: number;
  originalPrice?: number | null;
  weightGrams?: number | null;
}
