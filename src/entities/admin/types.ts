export interface InventoryItem {
  variantId: string;
  sku: string;
  productName: string;
  color: string;
  colorHex?: string | null;
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

// ==========================================
// Inventory Transactions
// ==========================================
export interface InventoryTransactionDto {
  transactionId: string;
  variantId: string;
  sku: string;
  productName: string;
  colorName: string;
  size: string;
  quantityChange: number;
  type: "Import" | "Export" | "Reserve" | "Adjust" | string;
  referenceId: string | null;
  performer: string;
  createdAt: string;
}

export interface InventoryTransactionsQueryParams {
  variantId?: string;
  sku?: string;
  type?: string;
  fromDate?: string;
  toDate?: string;
  page?: number;
  pageSize?: number;
}

export interface InventoryTransactionsResponse {
  items: InventoryTransactionDto[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// ==========================================
// System Audit Logs
// ==========================================
export interface SystemLogDto {
  logId: string;
  userId: string | null;
  action: string;
  message: string;
  logLevel: "Information" | "Warning" | "Error" | string;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: string;
}

export interface SystemLogsQueryParams {
  action?: string;
  logLevel?: string;
  userId?: string;
  fromDate?: string;
  toDate?: string;
  page?: number;
  pageSize?: number;
}

export interface SystemLogsResponse {
  items: SystemLogDto[];
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

export interface ProductImageDto {
  imageId: string;
  productId: string;
  variantId: string | null;
  imageUrl: string;
  displayOrder: number;
  isPrimary: boolean;
}

export interface SystemLogDetailDto {
  logId: string;
  userId: string | null;
  userEmail: string | null;
  action: string;
  message: string;
  logLevel: string;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: string;
  updatedAt: string;
}
