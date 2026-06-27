# Define content for STUDYHUB_BE.md

be_content = """# StudyHub - Tài liệu Thiết kế nghiệp vụ Backend & Database (BE Specification)

## 1. Tổng quan & Công nghệ sử dụng

Tài liệu này đặc tả kiến trúc Database, hệ thống API RESTful, các lớp Middleware bảo mật và cơ chế tiến trình chạy ngầm cho Backend hệ thống **StudyHub**.

### Tech Stack Backend:

- **Runtime Environment:** Node.js
- **Framework:** ExpressJS
- **Database:** PostgreSQL (Hệ quản trị cơ sở dữ liệu quan hệ)
- **Authentication:** JSON Web Token (JWT) - Sử dụng cặp AccessToken (ngắn hạn) và Refresh Token (dài hạn).
- **File Handling Middleware:** Multer (Quản lý và giới hạn tệp tải lên hệ thống).
- **Task Scheduler:** Node-cron (Xử lý tác vụ tự động quét dọn database và file hệ thống định kỳ).

---

## 2. Kiến trúc Database Schema (PostgreSQL)

Hệ thống sử dụng các khóa chính là số nguyên tự tăng (`SERIAL`). Các mối quan hệ được ràng buộc chặt chẽ bằng Khóa ngoại (Foreign Key).

### 2.1. Các Enum định nghĩa sẵn (Database Enums)

- `USER_ROLE`: `('ADMIN', 'LECTURER', 'STUDENT')`
- `DOC_VISIBILITY`: `('PUBLIC', 'GROUP', 'PRIVATE')`

### 2.2. Danh sách các bảng chi tiết

#### users (Người dùng)

- `id` (SERIAL, PRIMARY KEY)
- `full_name` (VARCHAR(100), NOT NULL)
- `username` (VARCHAR(50), UNIQUE, NOT NULL)
- `email` (VARCHAR(100), UNIQUE, NOT NULL)
- `phone` (VARCHAR(20), UNIQUE, NULL)
- `dob` (DATE, NULL)
- `password_hash` (VARCHAR(255), NOT NULL)
- `role` (USER_ROLE, NOT NULL)
- `avatar` (VARCHAR(255), NULL) -- Lưu trữ đường dẫn tệp cục bộ (VD: /public/avatars/abc.png)
- `cohort_id` (INT, FOREIGN KEY -> cohorts.id, NULL) -- Chỉ bắt buộc với Student
- `faculty_id` (INT, FOREIGN KEY -> faculties.id, NULL)
- `major_id` (INT, FOREIGN KEY -> majors.id, NULL)
- `created_at` (TIMESTAMP, DEFAULT CURRENT_TIMESTAMP)
- `updated_at` (TIMESTAMP, DEFAULT CURRENT_TIMESTAMP)

#### refresh_tokens (Quản lý phiên đăng nhập)

- `id` (SERIAL, PRIMARY KEY)
- `user_id` (INT, FOREIGN KEY -> users.id, ON DELETE CASCADE, NOT NULL)
- `token` (VARCHAR(500), UNIQUE, NOT NULL)
- `expires_at` (TIMESTAMP, NOT NULL)
- `created_at` (TIMESTAMP, DEFAULT CURRENT_TIMESTAMP)

#### cohorts (Khóa học)

- `id` (SERIAL, PRIMARY KEY)
- `code` (VARCHAR(20), UNIQUE, NOT NULL) -- VD: K18, K19
- `name` (VARCHAR(100), NOT NULL) -- VD: Khóa khóa 2018
- `start_year` (INT, NOT NULL)
- `end_year` (INT, NOT NULL)

#### faculties (Khoa)

- `id` (SERIAL, PRIMARY KEY)
- `name` (VARCHAR(100), NOT NULL)
- `description` (TEXT, NULL)

#### majors (Ngành học)

- `id` (SERIAL, PRIMARY KEY)
- `faculty_id` (INT, FOREIGN KEY -> faculties.id, ON DELETE CASCADE, NOT NULL)
- `name` (VARCHAR(100), NOT NULL)
- `description` (TEXT, NULL)

#### subjects (Môn học)

- `id` (SERIAL, PRIMARY KEY)
- `cohort_id` (INT, FOREIGN KEY -> cohorts.id, ON DELETE CASCADE, NOT NULL)
- `major_id` (INT, FOREIGN KEY -> majors.id, ON DELETE CASCADE, NOT NULL)
- `code` (VARCHAR(30), NOT NULL) -- VD: IT3011
- `name` (VARCHAR(150), NOT NULL) -- VD: Lập trình Java
- `description` (TEXT, NULL)

#### documents (Quản lý tài liệu học tập)

- `id` (SERIAL, PRIMARY KEY)
- `title` (VARCHAR(200), NOT NULL)
- `description` (TEXT, NULL)
- `cohort_id` (INT, FOREIGN KEY -> cohorts.id, NULL)
- `faculty_id` (INT, FOREIGN KEY -> faculties.id, NULL)
- `major_id` (INT, FOREIGN KEY -> majors.id, NULL)
- `subject_id` (INT, FOREIGN KEY -> subjects.id, NOT NULL)
- `owner_id` (INT, FOREIGN KEY -> users.id, NOT NULL)
- `document_type` (VARCHAR(30)) -- DOCUMENT, ASSIGNMENT, EXAM, SLIDE, REFERENCE
- `visibility` (DOC_VISIBILITY, DEFAULT 'PUBLIC')
- `file_url` (VARCHAR(255), NOT NULL) -- Đường dẫn tệp cục bộ (VD: /public/docs/file.pdf)
- `file_size` (INT) -- Tính bằng byte
- `file_type` (VARCHAR(50)) -- pdf, docx, pptx, zip
- `download_count` (INT, DEFAULT 0)
- `is_deleted` (BOOLEAN, DEFAULT FALSE) -- Cờ xóa mềm
- `deleted_at` (TIMESTAMP, NULL) -- Thời gian bắt đầu chuyển vào thùng rác
- `created_at` (TIMESTAMP, DEFAULT CURRENT_TIMESTAMP)
- `updated_at` (TIMESTAMP, DEFAULT CURRENT_TIMESTAMP)

#### groups & group_members (Nhóm học tập nội bộ)

- **Bảng `groups`:**
  - `id` (SERIAL, PRIMARY KEY)
  - `name` (VARCHAR(150), NOT NULL)
  - `description` (TEXT, NULL)
  - `owner_id` (INT, FOREIGN KEY -> users.id, NOT NULL)
  - `created_at` (TIMESTAMP, DEFAULT CURRENT_TIMESTAMP)
- **Bảng `group_members`:**
  - `group_id` (INT, FOREIGN KEY -> groups.id, ON DELETE CASCADE)
  - `user_id` (INT, FOREIGN KEY -> users.id, ON DELETE CASCADE)
  - `joined_at` (TIMESTAMP, DEFAULT CURRENT_TIMESTAMP)
  - _PRIMARY KEY (group_id, user_id)_

#### Tương tác tài liệu (Likes, Bookmarks, Views)

- **Bảng `document_likes`:** `id` (SERIAL, PK), `user_id` (FK), `document_id` (FK), `created_at`.
- **Bảng `bookmarks`:** `id` (SERIAL, PK), `user_id` (FK), `document_id` (FK), `created_at`.
- **Bảng `document_views`:** `id` (SERIAL, PK), `user_id` (FK), `document_id` (FK), `viewed_at`.

---

## 3. Hệ thống Lớp Middleware & Bảo mật

### 3.1. Authentication Middleware (`authMiddleware.js`)

- Trích xuất JWT từ Header `Authorization: Bearer <token>`.
- Giải mã token, kiểm tra tính hợp lệ và thời hạn. Đính kèm thông tin `req.user = { id, role, cohort_id, faculty_id, major_id }` vào luồng request.

### 3.2. Role-Based Access Control Middleware (`rbacMiddleware.js`)

- Nhận danh sách các role được phép truy cập làm tham số.
- So sánh `req.user.role` với cấu hình route. Trả về `403 Forbidden` nếu không đủ thẩm quyền.

### 3.3. File Upload Middleware với Multer (`uploadMiddleware.js`)

Tách biệt thành hai cấu hình Middleware chuyên biệt:

1. **Document Upload Middleware:**
   - Thư mục lưu trữ: `/public/uploads/documents/`
   - Kiểm tra định dạng (File Filter): Chỉ chấp nhận `.pdf`, `.docx`, `.pptx`, `.zip`.
   - Giới hạn dung lượng (`limits.fileSize`): **Tối đa 50MB** (~52,428,800 bytes).
2. **Avatar Upload Middleware:**
   - Thư mục lưu trữ: `/public/uploads/avatars/`
   - Kiểm tra định dạng: Chỉ chấp nhận `.jpg`, `.jpeg`, `.png`, `.webp`.
   - Giới hạn dung lượng: **Tối đa 5MB** (~5,242,880 bytes).

---

## 4. Đặc tả API Endpoints

### 4.1. Hệ thống Auth & Profile

- `POST /api/auth/register`: Đăng ký tài khoản mới. Nghiệp vụ bắt buộc mã hóa mật khẩu bằng `bcrypt`.
- `POST /api/auth/login`: Xác thực thông tin, trả về bộ đôi AccessToken và Refresh Token.
- `POST /api/auth/refresh`: Nhận Refresh Token từ body/cookie, kiểm tra trong DB bảng `refresh_tokens`. Nếu hợp lệ và chưa hết hạn, cấp lại AccessToken mới.
- `POST /api/auth/logout`: Xóa bản ghi Refresh Token tương ứng trong database.
- `PUT /api/users/profile`: Cập nhật thông tin cơ bản.
- `PUT /api/users/avatar`: Nhận file ảnh từ Avatar Multer Middleware, xóa file ảnh cũ vật lý (nếu có), cập nhật đường dẫn `avatar` mới vào bảng `users`.

### 4.2. Hệ thống Tìm kiếm & Bộ lọc nâng cao

- `GET /api/documents/search`: Nhận các query parameters bao gồm:
  - `q`: Từ khóa tìm kiếm (Quét `title` và `description` bằng câu lệnh SQL `ILIKE %q%`).
  - `uploader`: Tìm kiếm theo tên hoặc username người đăng (Thực hiện câu lệnh `JOIN users ON owner_id = users.id`).
  - `role`: Lọc theo vai trò của chủ sở hữu tài liệu (`users.role = 'LECTURER'` hoặc `'STUDENT'`).
  - `cohort_id`, `faculty_id`, `major_id`, `subject_id`: Lọc chính xác theo ID phân cấp học thuật.
  - `type`: Lọc theo `document_type`.

### 4.3. Quản lý Tài liệu & Kiểm tra Quyền nghiệp vụ

- `POST /api/documents/upload`: Tiếp nhận file từ Document Multer Middleware.
  - **Logic Validate Quyền (Crucial):** Nếu `req.user.role === 'STUDENT'`, Backend bắt buộc phải đối chiếu các ID `cohort_id`, `faculty_id`, `major_id` của tài liệu gửi lên xem có trùng khớp 100% với thông tin của chính sinh viên đó trong `req.user` hay không. Sai lệch sẽ lập tức trả về lỗi `403 Forbidden`. Giảng viên và Admin được bỏ qua bước check trùng khớp này.
- `PUT /api/documents/:id`: Chỉnh sửa Tiêu đề, Mô tả, Quyền riêng tư (Chỉ Owner hoặc Admin).
- `DELETE /api/documents/:id`: **Xóa mềm tài liệu**. Cập nhật trường `is_deleted = true` và `deleted_at = CURRENT_TIMESTAMP`. (Chỉ Owner hoặc Admin).
- `POST /api/documents/:id/restore`: **Khôi phục tài liệu**. Cập nhật trường `is_deleted = false` và `deleted_at = NULL`.

### 4.4. Nhóm học tập (Internal Class Groups)

- `POST /api/groups`: Tạo nhóm học tập (Gán `owner_id = req.user.id`). Người tạo tự động trở thành thành viên đầu tiên trong bảng `group_members`.
- `POST /api/groups/:id/members`: Thêm thành viên vào nhóm (Chỉ Owner).
- `DELETE /api/groups/:id/members/:userId`: Xóa thành viên ra khỏi nhóm (Chỉ Owner).
- `DELETE /api/groups/:id`: **Giải tán nhóm**. Tiến hành xóa cứng bản ghi nhóm trong bảng `groups` (Cấu hình `ON DELETE CASCADE` sẽ tự động dọn dẹp các bản ghi liên quan trong bảng `group_members` và `group_documents`). Chỉ Owner mới có quyền này.

---

## 5. Tiến trình tự động chạy ngầm (Node-Cron Automation)

Sử dụng `node-cron` cấu hình một tác vụ quét định kỳ vào lúc **00:00 mỗi đêm** (`0 0 * * *`):

1. **Dọn dẹp Thùng rác (Hard Delete Documents):**
   - Thực hiện câu lệnh SQL tìm các tài liệu có `is_deleted = true` và khoảng cách thời gian giữa `deleted_at` so với hiện tại vượt quá **15 ngày**.
   - Chạy vòng lặp lấy trường `file_url`, thực hiện xóa file vật lý trên ổ cứng server thông qua module thư viện hệ thống tệp `fs.unlink()`.
   - Sau khi xóa tệp vật lý thành công, thực hiện lệnh `DELETE FROM documents WHERE id = <id>` để xóa vĩnh viễn record khỏi database.
2. **Dọn dẹp Refresh Token:**
   - Thực hiện lệnh `DELETE FROM refresh_tokens WHERE expires_at < NOW()` nhằm tối ưu bộ nhớ DB, loại bỏ các phiên đăng nhập đã hết hạn.
     """

# Write contents to files

with open("STUDYHUB_FE.md", "w", encoding="utf-8") as fe_file:
fe_file.write(fe_content)

with open("STUDYHUB_BE.md", "w", encoding="utf-8") as be_file:
be_file.write(be_content)

print("Files generated successfully!")
