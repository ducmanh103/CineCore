# 🎬 CineCore - Nền Tảng Đặt Vé Xem Phim Trực Tuyến Thế Hệ Mới

Hệ thống đặt vé xem phim trực tuyến hiện đại với kiến trúc **Monorepo**:
- **Backend:** NestJS 11 + TypeScript + Prisma ORM + PostgreSQL 16 + Redis 7
- **Frontend:** React 19 + Vite + TypeScript + Tailwind CSS (Giao diện sáng sủa Luminous Light Theme & Clean Admin Portal)

---

## 🚀 Các Tính Năng Trọng Tâm

1. **Khóa Ghế Phân Tán (Zero Overbooking):**
   - Sử dụng lệnh nguyên tử Redis `SET NX EX 900` khóa ghế 15 phút ngay lập tức khi bấm chọn.
   - Kết hợp PostgreSQL Transaction và Partial Unique Index `UQ_Ticket_Showtime_Seat` (`WHERE status IN ('PENDING', 'BOOKED')`).
   - Cron Job tự động quét giải phóng vé `PENDING` quá hạn 15 phút.
2. **Mã Hóa Dữ Liệu Cá Nhân PDPD (Nghị định 13/2023/NĐ-CP):**
   - Mã hóa `fullName` và `email` bằng `AES-256-GCM` (`ENC:v1:...`).
   - Sử dụng `HMAC-SHA256` Blind Index (`emailHash`) hỗ trợ tìm kiếm $O(1)$ mà không cần giải mã cả bảng.
3. **Bảo Mật Tài Khoản Nâng Cao:**
   - Chống Brute-force: Sai 5 lần/30 phút -> khóa tài khoản 15 phút trên Redis và gửi thông báo Telegram.
   - Bắt buộc xác thực 2 lớp (MFA OTP) qua Email và Telegram cho tài khoản `ADMIN` và `STAFF`.
   - Cơ chế `securityStamp` trên Redis thu hồi phiên đăng nhập tức thì khi đổi mật khẩu/khóa user.
4. **Cổng Thanh Toán VNPay Sandbox:**
   - Tạo URL thanh toán với chữ ký `HMAC-SHA512`, xử lý Callback Return URL & IPN an toàn bằng `crypto.timingSafeEqual`.
5. **Trợ Lý Ảo AI Concierge:**
   - Tích hợp Gemini Flash kèm bộ phân tích Tiếng Việt Offline thông minh hỗ trợ tìm kiếm phim, suất chiếu và kiểm tra vé.

---

## 🛠 Hướng Dẫn Khởi Chạy Trên Môi Trường Local

### Bước 1: Khởi động Hạ tầng Cơ sở Dữ liệu & Cache (PostgreSQL 16 & Redis 7)
```bash
# Khởi chạy Docker containers
npm run docker:up
```

*Ghi chú: Nếu máy đã cài sẵn PostgreSQL và Redis độc lập (không qua Docker), bạn chỉ cần đảm bảo PostgreSQL chạy cổng 5432 và Redis chạy cổng 6379.*

### Bước 2: Thiết lập Biến Môi Trường
Sao chép tệp cấu hình mẫu:
```bash
cp .env.example .env
```

### Bước 3: Cài đặt Thư viện Phụ thuộc (Dependencies)
```bash
npm install
```

### Bước 4: Chạy Migration và Gieo Mầm Dữ Liệu Mẫu (Seed)
```bash
# Tạo Prisma Client
npm run prisma:generate

# Tạo bảng và cấu trúc cơ sở dữ liệu
npm run prisma:migrate

# Nạp dữ liệu mẫu (19 phim, 5 rạp, 25 phòng, ghế, suất chiếu và 3 tài khoản)
npm run prisma:seed
```

#### Tài khoản mẫu mặc định sau khi Seed:
| Vai trò | Tên đăng nhập | Mật khẩu | Ghi chú |
| :--- | :--- | :--- | :--- |
| **Quản trị viên (ADMIN)** | `admin` | `Admin@123456` | Có yêu cầu xác thực 2 lớp MFA OTP |
| **Nhân viên rạp (STAFF)** | `staff1` | `Staff@123456` | Có yêu cầu xác thực 2 lớp MFA OTP |
| **Khách hàng (CUSTOMER)** | `customer1` | `Customer@123456` | Đăng nhập trực tiếp vào hệ thống |

---

### Bước 5: Khởi Chạy Đồng Thời Backend & Frontend
```bash
npm run dev
```

- **Frontend Customer & Admin Storefront:** `http://localhost:5173`
- **Backend API:** `http://localhost:3000/api`
- **Swagger API Documentation:** `http://localhost:3000/api/docs`

