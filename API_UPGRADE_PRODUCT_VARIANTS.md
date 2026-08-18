# Tài Liệu Yêu Cầu Nâng Cấp API Sản Phẩm (Product Details & Variants)

> **Mục đích**: Nâng cấp response của API Chi tiết sản phẩm (`GET /api/products/{id}` và `GET /api/products/slug/{slug}`) để trả về đầy đủ danh sách **Biến thể (Variants)**. Điều này giúp giao diện Frontend (trang Chi tiết sản phẩm) có thể hiển thị chọn Màu sắc (Color), Size, Giá tiền và Tồn kho để Khách hàng thêm sản phẩm vào giỏ hàng.

---

## 1. Vấn Đề Hiện Tại

- Hiện tại, endpoint `GET /api/products/{id}` chỉ trả về thông tin chung sản phẩm và danh sách hình ảnh (`images`), danh sách `variants` đang bị rỗng hoặc chưa được nhúng kèm:
  ```json
  {
    "productId": "b0000000-0000-0000-0000-000000000011",
    "categoryId": "c0000000-0000-0000-0000-000000000001",
    "name": "Onyx V1 Hoodie",
    "slug": "onyx-v1-hoodie",
    "description": "Mô tả sản phẩm...",
    "fitType": "Oversized",
    "gender": "Men",
    "isActive": true,
    "createdAt": "2026-08-08T18:28:24.858Z",
    "images": [...]
  }
  ```
- Endpoint `GET /api/products/{id}/variants` nằm riêng lẻ. Nếu Frontend phải gọi 2 API độc lập để dựng 1 trang chi tiết sản phẩm sẽ tốn 2 lượt RTT (Round Trip Time) và dễ gây lệch trạng thái dữ liệu.

---

## 2. Giải Pháp Đề Xuất (Phương Án Tối Ưu)

Nhúng danh sách **`variants`** trực tiếp vào trong Response DTO của `GET /api/products/{id}` và `GET /api/products/slug/{slug}`.

### 📄 JSON Response Mong Muốn (`ProductDetailDto`):

```json
{
  "productId": "b0000000-0000-0000-0000-000000000011",
  "categoryId": "c0000000-0000-0000-0000-000000000001",
  "name": "Onyx V1 Hoodie",
  "slug": "onyx-v1-hoodie",
  "description": "Áo hoodie thể thao phom rộng Onyx V1 chất liệu cao cấp...",
  "fitType": "Oversized",
  "gender": "Men",
  "isActive": true,
  "createdAt": "2026-08-08T18:28:24.858Z",
  "images": [
    {
      "imageId": "i0000000-0000-0000-0000-000000000001",
      "productId": "b0000000-0000-0000-0000-000000000011",
      "variantId": null,
      "imageUrl": "http://localhost:9000/gymkitten-media/images/2026/08/08/a7c50b08cbb3.jpg",
      "displayOrder": 1,
      "isPrimary": true
    }
  ],
  "variants": [
    {
      "variantId": "a0000000-0000-0000-0000-000000000021",
      "productId": "b0000000-0000-0000-0000-000000000011",
      "sku": "ONX-V1-BLK-M",
      "colorName": "Black",
      "colorHex": "#000000",
      "size": "M",
      "price": 950000,
      "originalPrice": 1100000,
      "weightGrams": 600,
      "available": 10
    },
    {
      "variantId": "a0000000-0000-0000-0000-000000000022",
      "productId": "b0000000-0000-0000-0000-000000000011",
      "sku": "ONX-V1-BLK-L",
      "colorName": "Black",
      "colorHex": "#000000",
      "size": "L",
      "price": 950000,
      "originalPrice": 1100000,
      "weightGrams": 620,
      "available": 5
    },
    {
      "variantId": "a0000000-0000-0000-0000-000000000023",
      "productId": "b0000000-0000-0000-0000-000000000011",
      "sku": "ONX-V1-LGRY-L",
      "colorName": "Light Grey",
      "colorHex": "#D3D3D3",
      "size": "L",
      "price": 950000,
      "originalPrice": 1100000,
      "weightGrams": 620,
      "available": 0
    }
  ]
}
```

> **Ghi chú trường `available`**: Đây là số lượng tồn kho thực tế khả dụng của variant (Nếu chưa tính chi tiết inventory, backend có thể tạm thời trả về số lượng mặc định `> 0` để frontend mở nút mua).

---

## 3. Hướng Dẫn Sửa Đổi Code Trong Backend (`GymKitten_Backend`)

### 🛠 BƯỚC 1: Cập nhật DTO trong Application Layer

Mở `GymKitten.Application/Features/Catalog/Products/Queries/GetProductById/GetProductByIdQuery.cs` (hoặc DTO liên quan):

```csharp
public sealed record ProductVariantDto(
    Guid VariantId,
    Guid ProductId,
    string Sku,
    string ColorName,
    string? ColorHex,
    string Size,
    decimal Price,
    decimal? OriginalPrice,
    int? WeightGrams,
    int Available);

public sealed record ProductDetailDto(
    Guid ProductId,
    Guid CategoryId,
    string Name,
    string Slug,
    string? Description,
    string? FitType,
    string Gender,
    bool IsActive,
    DateTime CreatedAt,
    List<ProductImageDto> Images,
    List<ProductVariantDto> Variants); // <-- Bổ sung trường Variants vào đây
```

---

### 🛠 BƯỚC 2: Cập nhật Repository Method (Entity Framework Core)

Mở `GymKitten.Infrastructure/Repositories/ProductRepository.cs`:
Cập nhật câu truy vấn EF Core để `.Include(p => p.Productvariants)` cùng với `.Include(p => p.Productimages)`:

```csharp
public async Task<Product?> GetProductWithDetailsAsync(Guid productId, CancellationToken cancellationToken)
{
    return await _dbContext.Products
        .Include(p => p.Productimages)
        .Include(p => p.Productvariants) // <-- Include thêm Productvariants
        .FirstOrDefaultAsync(p => p.Productid == productId, cancellationToken);
}
```

---

### 🛠 BƯỚC 3: Cập nhật Handler `GetProductByIdQueryHandler.cs`

Mở `GymKitten.Application/Features/Catalog/Products/Queries/GetProductById/GetProductByIdQueryHandler.cs`:

```csharp
var variantDtos = product.Productvariants.Select(v => new ProductVariantDto(
    v.Variantid,
    v.Productid,
    v.Sku,
    v.Colorname,
    v.Colorhex,
    v.Size,
    v.Price,
    v.Originalprice,
    v.Weightgrams,
    Available: 10 // Hoặc map từ bảng Inventory/Quantity nếu có
)).ToList();

var detailDto = new ProductDetailDto(
    product.Productid,
    product.Categoryid,
    product.Name,
    product.Slug,
    product.Description,
    product.Fittype,
    product.Gender,
    product.Isactive,
    product.Createdat,
    imageDtos,
    variantDtos); // <-- Truyền danh sách variantDtos vào DTO
```

---

## 4. Tùy Chọn Dự Phòng (Nếu Backend Chưa Thể Sửa `GET /api/products/{id}`)

Trong trường hợp Backend chưa kịp sửa endpoint `GET /api/products/{id}`, phía Frontend có thể tạm thời gọi thêm `GET /api/products/{productId}/variants` song song rồi gộp kết quả lại trên Client. Tuy nhiên **Phương án 2 (Tích hợp trực tiếp)** ở trên vẫn là khuyến nghị số 1 về hiệu năng và thiết kế chuẩn Clean Architecture.
