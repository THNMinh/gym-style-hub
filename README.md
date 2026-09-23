# 🏋️‍♂️ GymKitten – Premium Fitness E-Commerce Frontend

[![React](https://img.shields.io/badge/React-18-blue?logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6.0-646CFF?logo=vite)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)
[![TanStack Router](https://img.shields.io/badge/TanStack_Router-v1-FF4154)](https://tanstack.com/router)
[![TanStack Query](https://img.shields.io/badge/TanStack_Query-v5-FF4154)](https://tanstack.com/query)

**GymKitten Web Client** là giao diện thương mại điện tử thời trang thể thao cao cấp lấy cảm hứng từ thương hiệu Gymshark. Dự án được thiết kế chuẩn mực với phong cách hiện đại, tối giản và hiệu năng cao, tích hợp mượt mà với hệ thống RESTful Web API từ Backend [.NET 8](https://github.com/THNMinh/GymKitten).

🔗 **Live Demo:** [https://gym-style-hub.vercel.app/](https://gym-style-hub.vercel.app/)  
🔗 **Backend Repository:** [GymKitten .NET 8 Backend](https://github.com/THNMinh/GymKitten)

---

## ✨ Điểm nổi bật về Trải nghiệm & Tính năng (Features)

### 1. Catalog & Bộ lọc thông minh (Smart Filtering)
- **Lọc đa tiêu chí:** Hỗ trợ lọc tức thì theo Giới tính (Men, Women, Unisex), Danh mục, Form dáng (Oversized, Slim, Muscle fit), Mức giá và Tỷ lệ giảm giá (Sale 50%+).
- **Color Swatches tương tác:** Hiển thị trực quan các chấm màu (Hex code chuẩn) bên dưới card sản phẩm. Click vào chấm màu sẽ tự động đổi hình ảnh và cập nhật SKU tương ứng.
- **Bảng Size Guide chuẩn xác:** Tra cứu số đo theo cm (Ngực, Eo, Mông, Chiều cao) cho từng size (S, M, L, XL...).

### 2. Bộ sưu tập Nổi bật & Collab Series
- **Athlete Collabs (`/collab`):** Không gian dành riêng cho các bộ sưu tập hợp tác với vận động viên thể hình nổi tiếng: *David Laid*, *Chris Bumstead (CBUM)*, *Carlos Belcast*.
- **Featured Highlights (`/featured`):** Trình diễn các dòng sản phẩm đặc trưng: *Power Collection*, *Cosy Luxe*, *Devant Series* và *Get 'Em In Pink*.

### 3. Quy trình Đặt hàng & Thanh toán (Checkout Flow)
- **Mini-cart Drawer:** Ngăn kéo giỏ hàng tiện lợi, thêm nhanh sản phẩm theo size mà không cần rời trang hiện tại.
- **Mã giảm giá (Coupon):** Kiểm tra và áp dụng voucher trực tiếp vào tổng tiền thanh toán.
- **Cổng thanh toán MoMo & COD:** Hỗ trợ quét mã QR MoMo và thanh toán khi nhận hàng.

### 4. Quản lý Tài khoản & Đơn hàng (User Portal)
- Đăng ký tài khoản với quy trình **xác thực mã OTP 6 số qua email**.
- Xem lịch sử đơn hàng, tra cứu tiến trình vận chuyển theo thời gian thực.
- Đánh giá sản phẩm đã mua kèm số sao và nhận xét chi tiết.
- Quản lý sổ địa chỉ giao hàng (Thêm, sửa, xóa, đặt làm mặc định).

---

## 🛠 Công nghệ sử dụng (Tech Stack)

| Công nghệ | Vai trò trong dự án |
|---|---|
| **React 18 & Vite** | Nền tảng xây dựng SPA & SSR tối ưu tốc độ tải trang |
| **TypeScript** | Định kiểu tĩnh an toàn, đồng bộ schema từ backend |
| **TanStack Router** | Điều hướng type-safe, quản lý URL Search Params chuyên sâu |
| **TanStack Query (React Query)** | Quản lý server state, tự động cache, refetch và invalidate queries |
| **Tailwind CSS & Radix UI** | Thiết kế giao diện hiện đại, responsive hoàn hảo trên Mobile & Desktop |
| **SignalR Client** | Nhận thông báo đơn hàng và đánh giá thời gian thực qua WebSocket |
| **Zustand** | Quản lý state giỏ hàng (Cart) và phiên đăng nhập (Auth session) |

---

## 🔑 Tài khoản Demo

Bạn có thể sử dụng các tài khoản demo dưới đây để trải nghiệm ngay hệ thống:

| Vai trò | Email đăng nhập | Mật khẩu |
|---|---|---|
| **Khách hàng (Customer)** | `luan@gymkitten.com` | `Luan@123` |
| **Quản trị viên (Admin)** | `davidlaid@gymkitten.com` | `DavidLaid@123` |

---

## 🚀 Khởi chạy dự án Local

### Yêu cầu tiên quyết:
- **Node.js** >= 18.x
- **npm** hoặc **pnpm / yarn**

### Các bước cài đặt:

1. **Clone repository:**
   ```bash
   git clone https://github.com/THNMinh/gym-style-hub.git
   cd gym-style-hub
   ```

2. **Cài đặt dependencies:**
   ```bash
   npm install
   ```

3. **Cấu hình môi trường (`.env`):**
   Tạo file `.env` ở thư mục gốc:
   ```env
   # Kết nối Backend Render (Mặc định)
   VITE_API_URL=https://gymkitten-api.onrender.com

   # Hoặc kết nối Backend Local
   # VITE_API_URL=http://localhost:5000
   ```

4. **Khởi chạy Development Server:**
   ```bash
   npm run dev
   ```
   Mở trình duyệt tại địa chỉ: `http://localhost:8081`

5. **Build Production:**
   ```bash
   npm run build
   ```

---

## ☁️ Triển khai (Deployment)

- Ứng dụng được triển khai trực tiếp trên **Vercel** với cơ chế tự động CI/CD: Mọi commit được push lên nhánh chính sẽ tự động được build, optimize và deploy tới mạng lưới toàn cầu (Edge CDN).
- Live URL: [https://gym-style-hub.vercel.app/](https://gym-style-hub.vercel.app/)

