# TÀI LIỆU HƯỚNG DẪN KIỂM THỬ API STUDYHUB BACKEND

Tài liệu này tổng hợp toàn bộ các API đang được cung cấp bởi tầng Backend của hệ thống StudyHub. Tài liệu được dùng làm cẩm nang cho việc xây dựng Frontend.

**Base URL:** `http://localhost:8081/api/v1`

---

## 1. MODULE AUTHENTICATION (XÁC THỰC)

### 1.1. Đăng ký tài khoản

- **Endpoint:** `POST /auth/register`
- **Quyền (Access):** Public
- **Body (`application/json`):**
  ```json
  {
    "full_name": "Nguyễn Văn A",
    "username": "nva2004",
    "email": "nva@studyhub.edu.vn",
    "phone": "0912345678",
    "dob": "2004-05-20",
    "password": "Password@123",
    "role": "STUDENT",
    "cohort_code": "K1", // Bắt buộc nếu là STUDENT
    "faculty_code": "CNTT", // Bắt buộc nếu là STUDENT/LECTURER
    "major_code": "BIT" // Bắt buộc nếu là STUDENT
  }
  ```
  _(Ghi chú: Nếu `role` là `LECTURER`, chỉ cần cung cấp `faculty_code`)_

### 1.2. Đăng nhập

- **Endpoint:** `POST /auth/login`
- **Quyền:** Public
- **Body (`application/json`):**
  ```json
  {
    "identifier": "nva@studyhub.edu.vn", // Có thể truyền Email HOẶC Username
    "password": "Password@123"
  }
  ```
- **Response quan trọng:** Trả về đối tượng `user` cùng `accessToken` (để gọi API) và `refreshToken` (để làm mới token).

### 1.3. Làm mới Access Token

- **Endpoint:** `POST /auth/refresh`
- **Quyền:** Public
- **Body (`application/json`):**
  ```json
  {
    "refreshToken": "YOUR_REFRESH_TOKEN_HERE"
  }
  ```

### 1.4. Đăng xuất

- **Endpoint:** `POST /auth/logout`
- **Quyền:** Public
- **Body (`application/json`):**
  ```json
  {
    "refreshToken": "YOUR_REFRESH_TOKEN_HERE"
  }
  ```

---

## 2. MODULE USER PROFILE (HỒ SƠ NGƯỜI DÙNG)

_(Lưu ý: Bắt đầu từ đây, mọi API yêu cầu đính kèm Header: `Authorization: Bearer {accessToken}`)_

### 2.1. Lấy thông tin cá nhân

- **Endpoint:** `GET /users/profile`
- **Quyền:** Mọi User đăng nhập

### 2.2. Lấy danh sách toàn bộ người dùng (Phân trang & Lọc)

- **Endpoint:** `GET /users`
- **Quyền:** Chỉ Admin (`ADMIN`)
- **Query Parameters (Tuỳ chọn):**
  - `page`: Trang hiện tại (Mặc định: 1).
  - `limit`: Số lượng mỗi trang (Mặc định: 20, tối đa 100).
  - `role`: Lọc theo quyền `ALL` / `STUDENT` / `LECTURER` / `ADMIN` (Mặc định: `ALL`).
  - `q`: Từ khóa tìm kiếm theo Tên, Email, Username, SĐT.
- **Mô tả:** Trả về danh sách tài khoản trong hệ thống kèm đối tượng `pagination` (phục vụ Admin Panel).
- **Response mẫu:**
  ```json
  {
    "statusCode": 200,
    "message": "Lấy danh sách người dùng thành công.",
    "data": {
      "users": [
        {
          "id": 1,
          "full_name": "Nguyễn Văn A",
          "role": "STUDENT",
          "email": "nva@studyhub.edu.vn"
        }
      ],
      "pagination": {
        "total": 150,
        "page": 1,
        "limit": 20,
        "totalPages": 8
      }
    },
    "errors": null
  }
  ```

### 2.3. Cập nhật thông tin cá nhân

- **Endpoint:** `PUT /users/profile`
- **Body (`application/json`):**
  ```json
  {
    "full_name": "Tên mới",
    "phone": "0988776655",
    "dob": "2004-12-28"
  }
  ```

### 2.4. Cập nhật Avatar

- **Endpoint:** `PUT /users/avatar`
- **Quyền:** Mọi User đăng nhập
- **Body (`multipart/form-data`):**
  - `avatar`: Chọn file ảnh (jpg, jpeg, png, webp). Tối đa 5MB.

---

## 3. MODULE TÀI LIỆU (DOCUMENTS)

### 3.1. Upload tài liệu mới

- **Endpoint:** `POST /documents/upload`
- **Quyền:** Mọi User. **(Upload Guard:** Sinh viên chỉ được upload đúng Khóa/Khoa/Ngành của mình).
- **Body (`multipart/form-data`):**
  - `file`: File tài liệu (pdf, docx, pptx, zip). Tối đa 50MB.
  - `title`: "Tiêu đề tài liệu"
  - `description`: "Mô tả ngắn"
  - `subject_id`: 1
  - `cohort_id`: 1 (Tuỳ chọn với Giảng viên, bắt buộc với Sinh viên)
  - `faculty_id`: 1
  - `major_id`: 1
  - `document_type`: "DOCUMENT" / "ASSIGNMENT" / "EXAM" / "SLIDE" / "REFERENCE"
  - `visibility`: "PUBLIC" / "GROUP" / "PRIVATE"

### 3.2. Tìm kiếm & Lọc (Advanced Search)

- **Endpoint:** `GET /documents/search`
- **Quyền:** Mọi User.
- **Query Parameters (Tuỳ chọn):**
  - `q`: Từ khóa tìm kiếm (VD: `java`).
  - `uploader`: Tên/username người đăng.
  - `role`: `LECTURER` hoặc `STUDENT`.
  - `cohort_id`, `faculty_id`, `major_id`, `subject_id`: Lọc theo ID học thuật.
  - `type`: Loại tài liệu.
  - `page`, `limit`: Phân trang.

### 3.3. Xem chi tiết tài liệu (Tự động tăng view_count)

- **Endpoint:** `GET /documents/:id`
- **Quyền:** Mọi User (Áp dụng Security Guard Visibility).

### 3.4. Cập nhật tài liệu

- **Endpoint:** `PUT /documents/:id`
- **Quyền:** Chủ sở hữu (Owner) hoặc ADMIN.
- **Body (`application/json`):**
  ```json
  {
    "title": "Tiêu đề cập nhật",
    "description": "Mô tả cập nhật",
    "visibility": "PRIVATE",
    "document_type": "EXAM"
  }
  ```

### 3.5. Xóa mềm (Soft Delete)

- **Endpoint:** `DELETE /documents/:id`
- **Quyền:** Owner hoặc ADMIN. (Chuyển tài liệu vào thùng rác).

### 3.6. Xem thùng rác & Khôi phục

- **Endpoint:** `GET /documents/trash` (Xem danh sách tài liệu đã xóa mềm).
- **Endpoint:** `POST /documents/:id/restore` (Khôi phục tài liệu, yêu cầu Owner/Admin).

### 3.7. Like & Bookmark

- **Toggle Like:** `POST /documents/:id/like`
- **Toggle Bookmark:** `POST /documents/:id/bookmark`
- **Lấy danh sách đã Like:** `GET /documents/likes`
- **Lấy danh sách đã Bookmark:** `GET /documents/bookmarks`

---

## 4. MODULE NHÓM HỌC TẬP (STUDY GROUPS)

### 4.1. Tạo Nhóm & Lấy danh sách nhóm

- **Tạo nhóm mới:** `POST /groups`
  ```json
  { "name": "Nhóm Java", "description": "Chia sẻ môn Java" }
  ```
- **Lấy danh sách nhóm:** `GET /groups`
  _(Lưu ý: Nếu user là `STUDENT` hoặc `LECTURER`, trả về các nhóm mà user sở hữu/tham gia. Nếu là `ADMIN`, tự động trả về toàn bộ danh sách nhóm trong hệ thống để quản lý)._
- **Lấy chi tiết nhóm:** `GET /groups/:id`

### 4.2. Quản lý Thành viên

- **Thêm thành viên (Batch):** `POST /groups/:id/members`
  ```json
  { "user_ids": [2, 3, 4] }
  ```
- **Gỡ thành viên:** `DELETE /groups/:id/members/:userId`

### 4.3. Quản lý Tài liệu Nhóm

- **Chia sẻ tài liệu có sẵn vào nhóm:** `POST /groups/:id/documents`
  ```json
  { "document_id": 1 }
  ```
- **Upload trực tiếp vào nhóm:** `POST /groups/:id/documents/upload`
  _(Dùng multipart/form-data tương tự API `POST /documents/upload`, tự động được gán tag `GROUP` và link vào nhóm)._
- **Lấy danh sách tài liệu nhóm:** `GET /groups/:id/documents`
- **Gỡ tài liệu khỏi nhóm:** `DELETE /groups/:id/documents/:documentId`

### 4.4. Giải tán Nhóm

- **Endpoint:** `DELETE /groups/:id`
- **Lưu ý:** Tự động xóa mềm toàn bộ tài liệu có tag `GROUP` tải lên riêng cho nhóm này.

---

## 5. MODULE ACADEMIC (CẤU TRÚC HỌC THUẬT)

_(Dùng cho trang Quản trị viên, GET là Public, POST/PUT/DELETE yêu cầu quyền ADMIN)._

### 5.1. Cohorts (Khóa học)

- **GET** `/academic/cohorts`
- **POST** `/academic/cohorts` (`{ "code": "K1", "name": "Khóa 1", "start_year": 2023, "end_year": 2027 }`)
- **PUT** `/academic/cohorts/:id` (`{ "code": "K1", "name": "Khóa 1 (Cập nhật)", "start_year": 2023, "end_year": 2027 }`)
- **DELETE** `/academic/cohorts/:id`

### 5.2. Faculties (Khoa)

- **GET** `/academic/faculties`
- **POST** `/academic/faculties` (`{ "code": "CNTT", "name": "Khoa CNTT" }`)
- **PUT** `/academic/faculties/:id` (`{ "code": "CNTT", "name": "Khoa CNTT (Cập nhật)" }`)
- **DELETE** `/academic/faculties/:id`

### 5.3. Majors (Ngành học)

- **GET** `/academic/majors?faculty_code=CNTT`
- **POST** `/academic/majors` (`{ "code": "BIT", "name": "Ngành IT", "faculty_code": "CNTT" }`)
- **PUT** `/academic/majors/:id` (`{ "code": "BIT", "name": "Ngành IT (Cập nhật)", "faculty_code": "CNTT" }`)
- **DELETE** `/academic/majors/:id`

### 5.4. Subjects (Môn học)

- **GET** `/academic/subjects?major_code=BIT` (hoặc `?faculty_code=CNTT` để lọc môn học theo Khoa khi chưa chọn Ngành)
- **POST** `/academic/subjects` (`{ "code": "IT101", "name": "Java", "major_codes": ["BIT", "BAI"] }`)
- **PUT** `/academic/subjects/:id` (`{ "code": "IT101", "name": "Java (Cập nhật)", "major_codes": ["BIT", "BAI"] }`)
- **DELETE** `/academic/subjects/:id`

---

## 6. MODULE ADMIN (QUẢN TRỊ VIÊN & CRON TRIGGERS)

_(Toàn bộ endpoint yêu cầu Header `Authorization: Bearer <token_admin>` và quyền `ADMIN`)_

### 6.1. Thống kê hệ thống (System Stats)

- **Endpoint:** `GET /admin/stats`
- **Mô tả:** Trả về các chỉ số tổng quan phục vụ trang Admin Dashboard (`total_users`, `total_documents`, `total_groups`, `total_views`).
- **Response mẫu:**
  ```json
  {
    "statusCode": 200,
    "message": "Lấy thống kê hệ thống thành công.",
    "data": {
      "total_users": 150,
      "total_documents": 450,
      "total_groups": 25,
      "total_views": 12890
    },
    "errors": null
  }
  ```

### 6.2. Giám sát sức khỏe hệ thống (System Health Check)

- **Endpoint:** `GET /admin/system/health`
- **Mô tả:** Kiểm tra tình trạng kết nối Database (`AppDataSource.isInitialized`), thông số bộ nhớ RAM (`total_mb`, `free_mb`, `heap_used_mb`), chỉ số tải CPU trung bình (`load_1m`, `load_5m`, `load_15m`), và thời gian hoạt động (`uptime_seconds`).
- **Response mẫu:**
  ```json
  {
    "statusCode": 200,
    "message": "Kiểm tra sức khỏe hệ thống thành công.",
    "data": {
      "status": "UP",
      "database": "Connected",
      "memory": {
        "total_mb": 16384,
        "free_mb": 8192,
        "heap_used_mb": 128
      },
      "cpu_load": {
        "load_1m": 0.15,
        "load_5m": 0.1,
        "load_15m": 0.05
      },
      "uptime_seconds": 3600
    },
    "errors": null
  }
  ```

### 6.3. Cập nhật trạng thái tài khoản người dùng (User Status Update)

- **Endpoint:** `PATCH /admin/users/:id/status`
- **Mô tả:** Khóa hoặc kích hoạt tài khoản người dùng bởi Admin. Nếu trạng thái là `BANNED` hoặc `INACTIVE`, toàn bộ Refresh Token active của user trong DB sẽ tự động bị xóa, buộc user đăng xuất khỏi mọi thiết bị.
- **Body (`application/json`):**
  ```json
  {
    "status": "BANNED" // Các giá trị hợp lệ: ACTIVE | INACTIVE | BANNED
  }
  ```
- **Lưu ý ràng buộc khi Đăng nhập (`POST /auth/login`):**
  - Nếu tài khoản có status `BANNED`: Trả về `403 Forbidden` với message `"Tài khoản đã bị khóa"`.
  - Nếu tài khoản có status `INACTIVE`: Trả về `403 Forbidden` với message `"Tài khoản đang tạm ngừng hoạt động"`.

### 6.4. Cron Jobs Triggers (Bảo trì tự động)

- **Dọn dẹp tài liệu trong thùng rác quá hạn (Mặc định >15 ngày):**
  - **Endpoint:** `POST /admin/cron/trigger/trash-cleanup`
  - **Body (`application/json`):** `{ "days": 15 }` (Hoặc 0 để dọn rác ngay lập tức).
- **Dọn dẹp Refresh Token hết hạn:**
  - **Endpoint:** `POST /admin/cron/trigger/token-cleanup`
