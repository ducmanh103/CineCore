# CineCore - Cinema Management Platform

CineCore là nền tảng đặt vé xem phim trực tuyến và quản trị hệ thống cụm rạp chiếu thế hệ mới, được thiết kế và xây dựng theo kiến trúc Monorepo hiện đại. Dự án tập trung vào tính khả dụng cao, khả năng chịu tải, cơ chế khóa ghế phân tán thời gian thực, bảo vệ dữ liệu cá nhân theo quy chuẩn pháp lý và tối ưu hóa trải nghiệm người dùng.

---

## 1. Công Nghệ Sử Dụng (Tech Stack)

### Backend
- **Nền tảng:** NestJS 11 (Node.js runtime, TypeScript)
- **Cơ sở dữ liệu & ORM:** PostgreSQL 16, Prisma ORM 6
- **Bộ nhớ đệm & Khóa phân tán:** Redis 7 (ioredis)
- **Bảo mật & Mã hóa:** Passport.js, JWT (Access Token & Refresh Token), Bcryptjs, AES-256-GCM, HMAC-SHA256
- **Tác vụ định kỳ:** NestJS Schedule (Cron Jobs quét và giải phóng vé giữ chỗ hết hạn)
- **Tài liệu API:** Swagger / OpenAPI 3.0

### Frontend
- **Nền tảng:** React 19, Vite, TypeScript
- **Giao diện & Styling:** Tailwind CSS, PostCSS (Thiết kế phong cách sáng, tập trung vào công thái học và độ tương phản)
- **Quản lý trạng thái:** Zustand, TanStack Query (React Query)
- **Điều hướng:** React Router v7
- **Bộ biểu tượng:** Lucide React

---

## 2. Kiến Trúc và Tính Năng Trọng Tâm

### 2.1. Cơ Chế Khóa Ghế Phân Tán (Zero Overbooking)
- Ứng dụng cơ chế khóa phân tán nguyên tử trên Redis (`SET key value NX EX 900`) với thời hạn giữ chỗ 15 phút ngay khi khách hàng chọn ghế.
- Ràng buộc toàn vẹn dữ liệu ở cấp độ cơ sở dữ liệu bằng Partial Unique Index trên PostgreSQL:
  ```sql
  CREATE UNIQUE INDEX "UQ_Ticket_Showtime_Seat" 
  ON "tickets" ("showtimeId", "seatId") 
  WHERE "status" IN ('PENDING', 'BOOKED');
  ```
- Tiến trình nền (Cron Job) tự động kiểm tra và thu hồi các vé ở trạng thái `PENDING` đã quá thời hạn thanh toán, hoàn trả ghế vào danh mục khả dụng tức thì.

### 2.2. Bảo Mật Dữ Liệu Cá Nhân (Tuân Thủ Nghị Định 13/2023/NĐ-CP)
- Thông tin định danh cá nhân của khách hàng (`fullName`, `email`) được mã hóa đối xứng bằng thuật toán `AES-256-GCM` (`ENC:v1:...`) trước khi lưu trữ vào cơ sở dữ liệu.
- Xây dựng chỉ mục ẩn (Blind Index) thông qua hàm băm bảo mật `HMAC-SHA256` (`emailHash`), cho phép truy vấn tài khoản chính xác với độ phức tạp $O(1)$ mà không cần giải mã dữ liệu của toàn bộ bảng.

### 2.3. Hệ Thống Xác Thực & Phân Quyền (RBAC & 2FA Telegram)
- **Phân quyền vai trò (Role-Based Access Control):** Hỗ trợ 3 nhóm vai trò độc lập gồm `CUSTOMER`, `STAFF` và `ADMIN`.
- **Quản trị viên (ADMIN):** Bắt buộc xác thực hai yếu tố (2FA MFA). Mã OTP bảo mật được hệ thống điều phối trực tiếp tới Telegram Bot của quản trị viên.
- **Nhân viên (STAFF):** Đăng nhập trực tiếp vào hệ thống quản trị rạp (CMS) mà không yêu cầu OTP nhằm tối ưu tốc độ tác nghiệp tại quầy vé.
- **Khách hàng (CUSTOMER):** Quy trình đăng ký và đăng nhập một bước tinh gọn, sẵn sàng đặt vé tức thì.
- **Thu hồi phiên làm việc tức thì (Security Stamp):** Kiểm soát tính hợp lệ của phiên đăng nhập qua Redis; khi tài khoản thay đổi mật khẩu hoặc bị khóa, toàn bộ token hiện hành lập tức mất hiệu lực.

### 2.4. Cổng Thanh Toán Trực Tuyến
- Tích hợp cổng thanh toán VNPay Sandbox với chữ ký bảo mật `HMAC-SHA512`.
- Kiểm tra tính hợp lệ của Return URL và IPN Callback bằng kỹ thuật so sánh chuỗi thời gian không đổi (`crypto.timingSafeEqual`) nhằm triệt tiêu nguy cơ tấn công Timing Attack.
- Cung cấp sẵn cơ chế Mock Payment Gateway phục vụ việc kiểm thử luồng đặt vé nhanh chóng trên môi trường phát triển cục bộ.

### 2.5. Trợ Lý Ảo CineCore AI Concierge
- Tích hợp trợ lý ảo thông minh hỗ trợ tra cứu lịch chiếu, gợi ý phim theo nhu cầu và kiểm tra thông tin vé đã đặt.
- Hoạt động linh hoạt với Google Gemini API hoặc cơ chế phân tích ngôn ngữ nội bộ dự phòng (Offline Rule-based Fallback).

---

## 3. Cấu Trúc Thư Mục Dự Án

```
CineCore/
|-- backend/                     # Mã nguồn Backend (NestJS)
|   |-- prisma/                  # Lược đồ cơ sở dữ liệu & Kịch bản nạp dữ liệu mẫu
|   |-- src/
|   |   |-- common/              # Guards, Filters, Interceptors, Tiện ích mã hóa PII
|   |   |-- modules/             # Auth, Movies, Theaters, Showtimes, Bookings, Payments, etc.
|   |   `-- main.ts              # Điểm khởi chạy của ứng dụng Backend
|   `-- package.json
|-- frontend/                    # Mã nguồn Frontend (React + Vite)
|   |-- public/                  # Tài nguyên tĩnh (Hình ảnh poster, banner phim)
|   |-- src/
|   |   |-- api/                 # Cấu hình Axios Client
|   |   |-- components/          # Layout, Carousel, Sơ đồ ghế, Modal, Widget Chatbot
|   |   |-- pages/               # Trang công khai, Quy trình đặt vé, Trang quản trị Admin
|   |   |-- store/               # Quản lý trạng thái ứng dụng (Zustand)
|   |   `-- main.tsx             # Điểm khởi chạy của ứng dụng Frontend
|   `-- package.json
|-- docker-compose.local.yml     # Cấu hình Docker cho PostgreSQL 16 & Redis 7
|-- .env.example                 # Mẫu cấu hình các biến môi trường
|-- .gitignore                   # Quy tắc loại trừ mã nguồn, secrets và thư mục tạm
`-- package.json                 # Cấu hình Monorepo Workspace
```

---

## 4. Hướng Dẫn Cài Đặt và Khởi Chạy

### 4.1. Yêu Cầu Hệ Thống
- Node.js: Phiên bản >= 20.x (Khuyến nghị phiên bản LTS)
- npm: Phiên bản >= 10.x
- Docker & Docker Compose (Tùy chọn, dùng để khởi chạy nhanh PostgreSQL và Redis)

### 4.2. Bước 1: Cài Đặt Dependencies
Chạy lệnh sau tại thư mục gốc của dự án để cài đặt gói phụ thuộc cho toàn bộ monorepo:
```bash
npm install
```

### 4.3. Bước 2: Thiết Lập Biến Môi Trường
Sao chép tệp mẫu sang tệp cấu hình môi trường:
```bash
cp .env.example .env
```
Cập nhật các thông số cần thiết (thông tin cơ sở dữ liệu, Redis, Token Telegram Bot nếu có nhu cầu nhận thông báo thực tế).

### 4.4. Bước 3: Khởi Động Dịch Vụ Cơ Sở Dữ Liệu & Cache
Nếu sử dụng Docker Compose:
```bash
npm run docker:up
```
*Lưu ý: Nếu máy tính đã cài đặt sẵn PostgreSQL (cổng 5432) và Redis (cổng 6379), hệ thống sẽ kết nối trực tiếp vào các cổng dịch vụ nội bộ này.*

### 4.5. Bước 4: Khởi Tạo Cơ Sở Dữ Liệu (Migration & Seed)
```bash
# Tạo mã nguồn Prisma Client
npm run prisma:generate

# Đồng bộ lược đồ bảng vào cơ sở dữ liệu
npm run prisma:migrate

# Nạp dữ liệu mẫu (19 bộ phim, 5 cụm rạp, 25 phòng chiếu, sơ đồ ghế và tài khoản)
npm run prisma:seed
```

### 4.6. Bước 5: Khởi Chạy Ứng Dụng
Khởi động đồng thời cả Backend và Frontend qua một câu lệnh:
```bash
npm run dev
```

Địa chỉ truy cập các dịch vụ:
- **Giao diện người dùng & Quản trị viên:** `http://localhost:5173`
- **Backend RESTful API:** `http://localhost:3000/api`
- **Tài liệu Swagger API Documentation:** `http://localhost:3000/api/docs`

---

## 5. Danh Sách Tài Khoản Thử Nghiệm

Sau khi hoàn tất quá trình nạp dữ liệu mẫu (`seed`), hệ thống sẵn sàng các tài khoản sau:

| Vai Trò | Tên Đăng Nhập | Mật Khẩu | Cơ Chế Xác Thực | Phạm Vi Quyền Hạn |
| :--- | :--- | :--- | :--- | :--- |
| **Quản trị viên (ADMIN)** | `admin` | `Admin@123` hoặc `Admin@123456` | 2FA MFA qua Telegram Bot (Môi trường local hỗ trợ mã kiểm thử: `123456`) | Toàn quyền quản trị hệ thống, báo cáo doanh thu, quản lý phim, rạp và phân quyền tài khoản |
| **Nhân viên (STAFF)** | `staff1` | `Staff@123456` | Đăng nhập trực tiếp, không yêu cầu OTP | Quản lý suất chiếu, vận hành phòng chiếu và hỗ trợ soát vé |
| **Khách hàng (CUSTOMER)** | `customer1` | `Customer@123456` | Đăng nhập trực tiếp | Tra cứu phim, đặt vé, chọn ghế trực quan và theo dõi lịch sử vé đã mua |

---

## 6. Bảng Tham Chiếu Biến Môi Trường (.env)

| Biến | Giá Trị Mặc Định / Ví Dụ | Mục Đích |
| :--- | :--- | :--- |
| `PORT` | `3000` | Cổng dịch vụ của Backend API |
| `DATABASE_URL` | `postgresql://postgres:postgres123@localhost:5432/cinecore?schema=public` | Chuỗi kết nối đến cơ sở dữ liệu PostgreSQL |
| `REDIS_HOST` | `localhost` | Địa chỉ máy chủ Redis |
| `REDIS_PORT` | `6379` | Cổng kết nối Redis |
| `JWT_SECRET` | `cinecore_super_secret_jwt_access_token_key_...` | Khóa bí mật dùng để ký và xác thực Access Token |
| `PII_ENCRYPTION_KEY` | Chuỗi Hex 32 bytes (64 ký tự) | Khóa mã hóa đối xứng AES-256-GCM thông tin người dùng |
| `PII_BLIND_INDEX_SALT` | Chuỗi salt bí mật | Giá trị salt phục vụ tính toán Blind Index HMAC-SHA256 |
| `TELEGRAM_BOT_TOKEN` | Khởi tạo qua @BotFather | Token Telegram Bot điều phối mã OTP 2FA và cảnh báo bảo mật |
| `TELEGRAM_CHAT_ID` | Chuỗi ID người dùng / nhóm | Chat ID tiếp nhận thông báo xác thực |
| `VNPAY_TMN_CODE` | Cấp bởi VNPay | Mã định danh website tích hợp cổng thanh toán VNPay Sandbox |
| `VNPAY_HASH_SECRET` | Cấp bởi VNPay | Khóa bí mật tạo chữ ký checksum HMAC-SHA512 |
| `GEMINI_API_KEY` | Cấp bởi Google AI Studio | Khóa API phục vụ tính năng trợ lý ảo CineCore AI Concierge |

---

## 7. Giấy Phép (License)

Dự án được xây dựng và chia sẻ theo giấy phép mã nguồn mở MIT License.
