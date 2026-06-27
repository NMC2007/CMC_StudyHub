# STUDYHUB - ĐẶC TẢ DỰ ÁN (PROJECT SPECIFICATION)

## 1. Tổng quan dự án

### Tên dự án
**StudyHub** - Nền tảng Quản lý và Chia sẻ Tài nguyên Học tập (Academic Resource Sharing Platform).

### Vấn đề cần giải quyết
Hiện nay, tài liệu học tập, slide bài giảng, đề thi và bài tập trong trường đại học thường bị phân tán rải rác trên Facebook, Zalo, Google Drive cá nhân. Điều này dẫn đến việc khó tìm kiếm, dễ thất lạc tài liệu qua các năm và thiếu một kho lưu trữ tri thức chính thống, được phân loại rõ ràng theo từng ngành, môn học.

### Mục tiêu giải pháp
StudyHub tạo ra một thư viện tri thức số tập trung, kết nối Sinh viên và Giảng viên. Hệ thống tự động phân loại tài liệu theo cấu trúc chuẩn của trường đại học, tích hợp công cụ tìm kiếm mạnh mẽ, không gian nhóm học tập nội bộ và các cơ chế tương tác (xem trực tuyến, thích, lưu) để thúc đẩy văn hóa chia sẻ tri thức.

---

## 2. Công nghệ sử dụng (Tech Stack)

### Frontend (FE)
- **Core Library:** ReactJS (v18+)
- **Routing:** React Router DOM
- **Styling:** TailwindCSS
- **Data Fetching & State:** TanStack Query (React Query) kết hợp Zustand.
- **HTTP Client:** Axios (cấu hình Interceptors xử lý tự động Access/Refresh Token).

### Backend (BE)
- **Runtime & Framework:** Node.js, ExpressJS
- **Authentication:** JWT (JSON Web Tokens - AccessToken ngắn hạn, RefreshToken dài hạn lưu DB).
- **File Handling:** Multer (Middleware xử lý upload Multipart/form-data).
- **Task Scheduler:** `node-cron` (chạy ngầm tự động dọn dẹp hệ thống).

### Database & Storage
- **Database:** PostgreSQL.
- **Local Storage:**
  - File tài liệu (PDF, DOCX, PPTX, ZIP): Giới hạn **50MB/file**.
  - Ảnh đại diện (JPEG, PNG, WEBP): Giới hạn **5MB/file**.

### Nâng cao (Tương lai)
- AI API (OpenAI / Gemini) để tóm tắt tài liệu và tự động tạo Mindmap.

---

## 3. Cấu trúc Học thuật (Academic Hierarchy)

Hệ thống quản lý dữ liệu tuân thủ tuyệt đối cây phân cấp sau (do mỗi khóa có thể có giáo trình môn học khác nhau):

```text
Khóa học (Cohort)
 └── Khoa (Faculty)
      └── Ngành học (Major)
           └── Môn học (Subject)
                └── Tài liệu (Document)
```

---

## 4. Đối tượng sử dụng & Phân quyền (RBAC)

Hệ thống có 3 Role chính: **ADMIN** (Chỉ 1 tài khoản), **LECTURER** (Giảng viên) và **STUDENT** (Sinh viên).

| Chức năng cốt lõi | Admin | Giảng viên | Sinh viên |
| :--- | :---: | :---: | :---: |
| Xem trực tuyến/Tải/Thích/Lưu tài liệu | ✅ | ✅ | ✅ |
| Tìm kiếm nâng cao & Lọc tài liệu | ✅ | ✅ | ✅ |
| Quản lý Hồ sơ cá nhân & Đổi Avatar | ✅ | ✅ | ✅ |
| Sửa / Xóa mềm / Khôi phục tài liệu *của mình* | ✅ | ✅ | ✅ |
| Tạo nhóm học tập & Quản lý thành viên | ✅ | ✅ | ✅ |
| Giải tán nhóm học tập *do mình tạo* | ✅ | ✅ | ✅ |
| Upload tài liệu vào **mọi** Khoa/Ngành/Khóa | ✅ | ✅ | ❌ |
| Upload tài liệu vào đúng Khóa/Khoa/Ngành *của mình* | ✅ | ✅ | ✅ |
| Xóa cứng tài liệu hoặc Giải tán nhóm *của người khác* | ✅ | ❌ | ❌ |
| Quản lý User & Cấu trúc Khóa/Khoa/Ngành/Môn | ✅ | ❌ | ❌ |

---

## 5. Chi tiết các Nghiệp vụ Cốt lõi (Core Features)

### 5.1. Authentication & Profile
- Đăng nhập/Đăng ký qua form. Sinh viên bắt buộc chọn Khóa, Khoa, Ngành. Giảng viên chỉ cần chọn Khoa.
- Xác thực bằng JWT. Khi Access Token hết hạn (Lỗi 401), FE tự động gọi API đổi Refresh Token để lấy token mới mà không văng ra màn hình Login.
- User có quyền xem/sửa thông tin và tải lên Avatar (tối đa 5MB, xử lý qua Multer).

### 5.2. Quản lý Tài liệu & Upload Guard
- **Upload:** Khi Sinh viên upload, BE phải kiểm tra `cohort_id`, `faculty_id`, `major_id` của tài liệu gửi lên có khớp 100% với thông tin trong DB của Sinh viên đó không. Giảng viên không bị giới hạn.
- **Thùng rác & Xóa mềm (Soft Delete):** Khi người dùng xóa tài liệu, cập nhật `is_deleted = true` và `deleted_at = NOW()`. Tài liệu vào Thùng rác để có thể khôi phục.

### 5.3. Tìm kiếm & Lọc (Advanced Search)
Giao diện tìm kiếm cung cấp bộ lọc kết hợp (Multi-filter):
- **Keyword:** Quét tiêu đề và mô tả.
- **Người đăng:** Tìm theo `full_name` hoặc `username`.
- **Vai trò đăng:** Lọc tài liệu do Giảng viên (LECTURER) hay Sinh viên (STUDENT) upload.
- **Cấu trúc:** Lọc đa tầng từ Khóa -> Khoa -> Ngành -> Môn.
- **Loại tài liệu (Type):** `DOCUMENT`, `ASSIGNMENT`, `EXAM`, `SLIDE`, `REFERENCE`.

### 5.4. Nhóm học tập (Study Groups)
- Nhóm dùng để chia sẻ tài liệu nội bộ lớp học, **không có tính năng Chat**.
- Thành viên nhóm mới có quyền xem tài liệu được share vào nhóm (`visibility = 'GROUP'`).
- Người tạo nhóm (Owner) có nút "Giải tán nhóm". Khi kích hoạt, BE sẽ xóa bản ghi nhóm (các dữ liệu thành viên sẽ tự động bị dọn dẹp nhờ `ON DELETE CASCADE`).

### 5.5. Tiến trình tự động (Cron-jobs)
Sử dụng `node-cron` chạy lúc `00:00` mỗi đêm:
1. **Dọn dẹp Thùng rác:** Quét các tài liệu có `is_deleted = true` và `deleted_at` > 15 ngày. Gọi lệnh xóa file vật lý (`fs.unlink`), sau đó Xóa cứng (Hard delete) bản ghi khỏi DB.
2. **Dọn dẹp Auth:** Quét và xóa các bản ghi `refresh_tokens` có `expires_at` nhỏ hơn hiện tại.

---

## 6. Thiết kế Database (PostgreSQL Schema Concept)

Các khóa chính sử dụng kiểu số nguyên tự tăng (`SERIAL`). Ràng buộc khóa ngoại (`FOREIGN KEY`) được thiết lập đầy đủ.

* **`users`**: `id`, `username`, `email`, `password_hash`, `role` (ENUM), `avatar`, `cohort_id`, `faculty_id`, `major_id`.
* **`refresh_tokens`**: `id`, `user_id`, `token`, `expires_at`.
* **Cấu trúc học thuật**: Bảng `cohorts`, `faculties`, `majors`, `subjects` liên kết với nhau theo cấu trúc phân cấp ở Mục 3.
* **`documents`**: `id`, `title`, `description`, FKs (`cohort_id`, `faculty_id`, `major_id`, `subject_id`, `owner_id`), `document_type`, `visibility` (ENUM: PUBLIC, GROUP, PRIVATE), `file_url`, `file_size`, `is_deleted`, `deleted_at`.
* **Nhóm học tập**: `groups` (`id`, `name`, `owner_id`) và `group_members` (`group_id`, `user_id`).
* **Tương tác**: `document_likes`, `bookmarks`, `document_views` (lưu trữ user tương tác với document nào).

---

## 7. Yêu cầu cho AI Coding (Vibe Coding Rules)

Khi AI tiếp nhận file này để hỗ trợ lập trình, yêu cầu tuân thủ:

1. **Backend (ExpressJS):**
   - Viết các middlewares tách biệt: `authMiddleware` (kiểm tra JWT), `rbacMiddleware` (kiểm tra Role), `uploadMiddleware` (cấu hình Multer riêng biệt cho Avatar và Document).
   - Truy vấn SQL trực tiếp qua `pg` (node-postgres) hoặc sử dụng ORM/Query Builder (như Sequelize, Knex) thống nhất.
   - Luôn xử lý lỗi try-catch trong Controller, tránh crash server.
2. **Frontend (ReactJS):**
   - Tạo `axiosInstance` để cấu hình Interceptors.
   - Chia Component nhỏ lẻ theo nguyên tắc Atomic Design. Các Form cần có validation rõ ràng trước khi submit.
   - Ứng dụng Zustand để lưu thông tin User Session (`isAuthenticated`, `user`), sử dụng TanStack Query cho mọi thao tác fetch/mutate tài liệu để đảm bảo cache mượt mà. Đảm bảo sử dụng Optimistic Update cho chức năng Like/Bookmark.