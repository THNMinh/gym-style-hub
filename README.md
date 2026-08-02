# Gym Style Hub

bạn có thể giúp tôi tạo 1 bản clone của Gymshark được không ? và nó sẽ dựa trên cấu trúc được mô tả chi tiết trong file markdown này. 
Cũng như bên dưới là các entity hiện có ở server 

https://row.gymshark.com/

https://row.gymshark.com/products/gymshark-devant-seamless-t-shirt-ss-tops-purple-aw26


-- ==========================================

-- GYMKITTEN E-COMMERCE DATABASE (POSTGRESQL)

-- ==========================================

-- 1. CREATE SCHEMAS

CREATE SCHEMA IF NOT EXISTS identity;

CREATE SCHEMA IF NOT EXISTS catalog;

CREATE SCHEMA IF NOT EXISTS inventory;

CREATE SCHEMA IF NOT EXISTS "order";

CREATE SCHEMA IF NOT EXISTS promotion;

CREATE SCHEMA IF NOT EXISTS social_proof;

CREATE SCHEMA IF NOT EXISTS payment;

CREATE SCHEMA IF NOT EXISTS system;

-- 2. SCHEMA: identity

CREATE TABLE identity.Users (

    UserId UUID PRIMARY KEY,

    Email VARCHAR(255) NOT NULL UNIQUE,

    PasswordHash VARCHAR(255) NULL,

    FullName VARCHAR(100) NULL,

    Phone VARCHAR(20) NULL,

    AvatarUrl VARCHAR(500) NULL,

    Role VARCHAR(20) NOT NULL DEFAULT 'Customer',

    IdentityId VARCHAR(255) NULL UNIQUE,

    IsEmailVerified BOOLEAN NOT NULL DEFAULT FALSE,

    IsActive BOOLEAN NOT NULL DEFAULT TRUE,

    FcmToken VARCHAR(500) NULL,

    CreatedAt TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    UpdatedAt TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    DeletedAt TIMESTAMPTZ NULL

);

CREATE TABLE identity.UserAddresses (

    AddressId UUID PRIMARY KEY,

    UserId UUID NOT NULL REFERENCES identity.Users(UserId) ON DELETE CASCADE,

    ReceiverName VARCHAR(100) NOT NULL,

    PhoneNumber VARCHAR(20) NOT NULL,

    AddressLine1 VARCHAR(255) NOT NULL,

    Ward VARCHAR(100) NOT NULL,

    District VARCHAR(100) NOT NULL,

    City VARCHAR(100) NOT NULL,

    IsDefault BOOLEAN NOT NULL DEFAULT FALSE,

    AddressType VARCHAR(20) NOT NULL DEFAULT 'Home',

    CreatedAt TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    UpdatedAt TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    DeletedAt TIMESTAMPTZ NULL

);

CREATE TABLE identity.RefreshTokens (

    RefreshTokenId UUID PRIMARY KEY,

    UserId UUID NOT NULL REFERENCES identity.Users(UserId) ON DELETE CASCADE,

    Token VARCHAR(500) NOT NULL UNIQUE,

    JwtId VARCHAR(255) NOT NULL,

    IsUsed BOOLEAN NOT NULL DEFAULT FALSE,

    IsRevoked BOOLEAN NOT NULL DEFAULT FALSE,

    ExpiryDate TIMESTAMPTZ NOT NULL,

    CreatedAt TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    UpdatedAt TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    DeletedAt TIMESTAMPTZ NULL

);

-- 3. SCHEMA: catalog

CREATE TABLE catalog.Categories (

    CategoryId UUID PRIMARY KEY,

    ParentCategoryId UUID NULL REFERENCES catalog.Categories(CategoryId) ON DELETE SET NULL,

    Name VARCHAR(100) NOT NULL,

    Slug VARCHAR(150) NOT NULL UNIQUE,

    Description TEXT NULL,

    DisplayOrder INT NOT NULL DEFAULT 0,

    CreatedAt TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    UpdatedAt TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    DeletedAt TIMESTAMPTZ NULL

);

CREATE TABLE catalog.Products (

    ProductId UUID PRIMARY KEY,

    CategoryId UUID NOT NULL REFERENCES catalog.Categories(CategoryId) ON DELETE RESTRICT,

    Name VARCHAR(200) NOT NULL,

    Slug VARCHAR(250) NOT NULL UNIQUE,

    Description TEXT NULL,

    FitType VARCHAR(50) NULL,

    Gender VARCHAR(20) NOT NULL DEFAULT 'Unisex',

    IsActive BOOLEAN NOT NULL DEFAULT TRUE,

    CreatedAt TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    UpdatedAt TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    DeletedAt TIMESTAMPTZ NULL

);

CREATE TABLE catalog.ProductVariants (

    VariantId UUID PRIMARY KEY,

    ProductId UUID NOT NULL REFERENCES catalog.Products(ProductId) ON DELETE CASCADE,

    Sku VARCHAR(50) NOT NULL UNIQUE,

    ColorName VARCHAR(50) NOT NULL,

    ColorHex VARCHAR(10) NULL,

    Size VARCHAR(10) NOT NULL,

    Price DECIMAL(10,2) NOT NULL,

    OriginalPrice DECIMAL(10,2) NULL,

    WeightGrams INT NULL,

    CreatedAt TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    UpdatedAt TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    DeletedAt TIMESTAMPTZ NULL

);

CREATE TABLE catalog.ProductImages (

    ImageId UUID PRIMARY KEY,

    ProductId UUID NOT NULL REFERENCES catalog.Products(ProductId) ON DELETE CASCADE,

    VariantId UUID NULL REFERENCES catalog.ProductVariants(VariantId) ON DELETE SET NULL,

    ImageUrl VARCHAR(500) NOT NULL,

    DisplayOrder INT NOT NULL DEFAULT 0,

    IsPrimary BOOLEAN NOT NULL DEFAULT FALSE,

    CreatedAt TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    UpdatedAt TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    DeletedAt TIMESTAMPTZ NULL

);

CREATE TABLE catalog.SizeGuides (

    GuideId UUID PRIMARY KEY,

    ProductId UUID NOT NULL REFERENCES catalog.Products(ProductId) ON DELETE CASCADE,

    Size VARCHAR(10) NOT NULL,

    ChestCm VARCHAR(50) NULL,

    WaistCm VARCHAR(50) NULL,

    HipsCm VARCHAR(50) NULL,

    HeightRangeCm VARCHAR(50) NULL,

    CreatedAt TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    UpdatedAt TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    DeletedAt TIMESTAMPTZ NULL

);

-- 4. SCHEMA: inventory

CREATE TABLE inventory.InventoryItems (

    InventoryId UUID PRIMARY KEY,

    VariantId UUID NOT NULL UNIQUE REFERENCES catalog.ProductVariants(VariantId) ON DELETE CASCADE,

    QuantityOnHand INT NOT NULL DEFAULT 0,

    QuantityReserved INT NOT NULL DEFAULT 0,

    SafetyStock INT NOT NULL DEFAULT 5,

    RowVersion INT NOT NULL DEFAULT 1,

    CreatedAt TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    UpdatedAt TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    DeletedAt TIMESTAMPTZ NULL

);

CREATE TABLE inventory.InventoryTransactions (

    TransactionId UUID PRIMARY KEY,

    VariantId UUID NOT NULL REFERENCES catalog.ProductVariants(VariantId) ON DELETE RESTRICT,

    QuantityChange INT NOT NULL,

    Type VARCHAR(30) NOT NULL,

    ReferenceId VARCHAR(100) NULL,

    CreatedAt TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    UpdatedAt TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    DeletedAt TIMESTAMPTZ NULL

);

-- 5. SCHEMA: promotion

CREATE TABLE promotion.Coupons (

    CouponId UUID PRIMARY KEY,

    Code VARCHAR(50) NOT NULL UNIQUE,

    DiscountType VARCHAR(20) NOT NULL,

    DiscountValue DECIMAL(10,2) NOT NULL,

    MinOrderValue DECIMAL(10,2) NOT NULL DEFAULT 0,

    MaxDiscountAmount DECIMAL(10,2) NULL,

    UsageLimit INT NULL,

    UsedCount INT NOT NULL DEFAULT 0,

    StartDate TIMESTAMPTZ NOT NULL,

    EndDate TIMESTAMPTZ NOT NULL,

    IsActive BOOLEAN NOT NULL DEFAULT TRUE,

    CreatedAt TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    UpdatedAt TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    DeletedAt TIMESTAMPTZ NULL

);

-- 6. SCHEMA: order

CREATE TABLE "order".Carts (

    CartId UUID PRIMARY KEY,

    UserId UUID NULL REFERENCES identity.Users(UserId) ON DELETE CASCADE,

    SessionId VARCHAR(100) NULL,

    CreatedAt TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    UpdatedAt TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    DeletedAt TIMESTAMPTZ NULL

);

CREATE TABLE "order".CartItems (

    CartItemId UUID PRIMARY KEY,

    CartId UUID NOT NULL REFERENCES "order".Carts(CartId) ON DELETE CASCADE,

    VariantId UUID NOT NULL REFERENCES catalog.ProductVariants(VariantId) ON DELETE CASCADE,

    Quantity INT NOT NULL,

    CreatedAt TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    UpdatedAt TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    DeletedAt TIMESTAMPTZ NULL

);

CREATE TABLE "order".Orders (

    OrderId UUID PRIMARY KEY,

    OrderCode VARCHAR(30) NOT NULL UNIQUE,

    UserId UUID NULL REFERENCES identity.Users(UserId) ON DELETE RESTRICT,

    ShippingAddress TEXT NOT NULL,

    SubTotal DECIMAL(10,2) NOT NULL,

    ShippingFee DECIMAL(10,2) NOT NULL DEFAULT 0,

    DiscountAmount DECIMAL(10,2) NOT NULL DEFAULT 0,

    TotalAmount DECIMAL(10,2) NOT NULL,

    CurrentStatus VARCHAR(30) NOT NULL,

    PaymentMethod VARCHAR(20) NOT NULL,

    PaymentStatus VARCHAR(20) NOT NULL DEFAULT 'Unpaid',

    CustomerNote TEXT NULL,

    CreatedAt TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    UpdatedAt TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    DeletedAt TIMESTAMPTZ NULL

);

CREATE TABLE "order".OrderItems (

    OrderItemId UUID PRIMARY KEY,

    OrderId UUID NOT NULL REFERENCES "order".Orders(OrderId) ON DELETE CASCADE,

    VariantId UUID NOT NULL REFERENCES catalog.ProductVariants(VariantId) ON DELETE RESTRICT,

    Sku VARCHAR(50) NOT NULL,

    ProductName VARCHAR(255) NOT NULL,

    UnitPrice DECIMAL(10,2) NOT NULL,

    Quantity INT NOT NULL,

    TotalPrice DECIMAL(10,2) NOT NULL,

    CreatedAt TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    UpdatedAt TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    DeletedAt TIMESTAMPTZ NULL

);

CREATE TABLE "order".OrderTrackingHistories (

    TrackingId UUID PRIMARY KEY,

    OrderId UUID NOT NULL REFERENCES "order".Orders(OrderId) ON DELETE CASCADE,

    Status VARCHAR(30) NOT NULL,

    Title VARCHAR(150) NOT NULL,

    Description TEXT NULL,

    Location VARCHAR(150) NULL,

    Timestamp TIMESTAMPTZ NOT NULL,

    UpdatedBy VARCHAR(50) NULL,

    CreatedAt TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    UpdatedAt TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    DeletedAt TIMESTAMPTZ NULL

);

CREATE TABLE promotion.CouponUsages (

    UsageId UUID PRIMARY KEY,

    CouponId UUID NOT NULL REFERENCES promotion.Coupons(CouponId) ON DELETE CASCADE,

    UserId UUID NOT NULL REFERENCES identity.Users(UserId) ON DELETE CASCADE,

    OrderId UUID NOT NULL REFERENCES "order".Orders(OrderId) ON DELETE CASCADE,

    UsedAt TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CreatedAt TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    UpdatedAt TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    DeletedAt TIMESTAMPTZ NULL

);

-- 7. SCHEMA: social_proof

CREATE TABLE social_proof.ProductReviews (

    ReviewId UUID PRIMARY KEY,

    ProductId UUID NOT NULL REFERENCES catalog.Products(ProductId) ON DELETE CASCADE,

    UserId UUID NOT NULL REFERENCES identity.Users(UserId) ON DELETE RESTRICT,

    OrderId UUID NOT NULL REFERENCES "order".Orders(OrderId) ON DELETE RESTRICT,

    Rating INT NOT NULL CHECK (Rating >= 1 AND Rating <= 5),

    Comment TEXT NULL,

    FitFeedback VARCHAR(20) NULL,

    CreatedAt TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    UpdatedAt TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    DeletedAt TIMESTAMPTZ NULL

);

CREATE TABLE social_proof.ReviewMedias (

    MediaId UUID PRIMARY KEY,

    ReviewId UUID NOT NULL REFERENCES social_proof.ProductReviews(ReviewId) ON DELETE CASCADE,

    MediaUrl VARCHAR(500) NOT NULL,

    MediaType VARCHAR(20) NOT NULL DEFAULT 'Image',

    CreatedAt TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    UpdatedAt TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    DeletedAt TIMESTAMPTZ NULL

);

CREATE TABLE social_proof.Wishlists (

    WishlistId UUID PRIMARY KEY,

    UserId UUID NOT NULL REFERENCES identity.Users(UserId) ON DELETE CASCADE,

    ProductId UUID NOT NULL REFERENCES catalog.Products(ProductId) ON DELETE CASCADE,

    CreatedAt TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    UpdatedAt TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    DeletedAt TIMESTAMPTZ NULL,

    CONSTRAINT uq_wishlist_user_product UNIQUE (UserId, ProductId)

);

-- 8. SCHEMA: payment & system

CREATE TABLE payment.PaymentTransactions (

    TransactionId UUID PRIMARY KEY,

    OrderId UUID NOT NULL REFERENCES "order".Orders(OrderId) ON DELETE RESTRICT,

    Gateway VARCHAR(50) NOT NULL,

    GatewayTransactionId VARCHAR(100) NULL,

    Amount DECIMAL(10,2) NOT NULL,

    Status VARCHAR(20) NOT NULL,

    PaymentDate TIMESTAMPTZ NULL,

    CreatedAt TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    UpdatedAt TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    DeletedAt TIMESTAMPTZ NULL

);

CREATE TABLE system.Notifications (

    NotificationId UUID PRIMARY KEY,

    UserId UUID NOT NULL REFERENCES identity.Users(UserId) ON DELETE CASCADE,

    Title VARCHAR(200) NOT NULL,

    Content TEXT NOT NULL,

    Type VARCHAR(50) NOT NULL,

    IsRead BOOLEAN NOT NULL DEFAULT FALSE,

    TargetUrl VARCHAR(500) NULL,

    ReadAt TIMESTAMPTZ NULL,

    CreatedAt TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    UpdatedAt TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    DeletedAt TIMESTAMPTZ NULL

);

CREATE TABLE system.SystemLogs (

    LogId UUID PRIMARY KEY,

    UserId UUID NULL,

    LogLevel VARCHAR(20) NOT NULL,

    Action VARCHAR(100) NOT NULL,

    Message TEXT NOT NULL,

    IpAddress VARCHAR(50) NULL,

    UserAgent TEXT NULL,

    CreatedAt TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    UpdatedAt TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    DeletedAt TIMESTAMPTZ NULL

);

-- 9. INDEXES FOR PERFORMANCE

CREATE INDEX idx_products_category ON catalog.Products(CategoryId) WHERE DeletedAt IS NULL;

CREATE INDEX idx_variants_product ON catalog.ProductVariants(ProductId) WHERE DeletedAt IS NULL;

CREATE INDEX idx_orders_user ON "order".Orders(UserId) WHERE DeletedAt IS NULL;

CREATE INDEX idx_orders_code ON "order".Orders(OrderCode);

CREATE INDEX idx_tracking_order ON "order".OrderTrackingHistories(OrderId);

CREATE INDEX idx_inventory_variant ON inventory.InventoryItems(VariantId);

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/aa4291cf-60ac-4524-bb99-17db96ab3b1b).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
