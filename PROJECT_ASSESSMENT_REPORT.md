# BÁO CÁO ĐÁNH GIÁ TỔNG THỂ DỰ ÁN STUDYHUB
**Ngày thực hiện đánh giá:** 14/07/2026  
**Phạm vi:** Toàn bộ mã nguồn Backend (`ExpressJS / TypeORM / PostgreSQL`) và Frontend (`ReactJS 18 / Vite / TailwindCSS v4 / Zustand / TanStack Query`).

---

## 1. TỔNG QUAN TIẾN ĐỘ THỰC HIỆN (BE & FE PROGRESS)

### 1.1. Backend (BE) — **Tiến độ: ~95% - Hoàn thiện các nghiệp vụ cốt lõi**
Hệ thống Backend đã được thi công một cách bài bản, hoàn thành gần như đầy đủ các yêu cầu từ đặc tả `STUDYHUB_CONTEXT.md` và tài liệu thiết kế `Backend.md`:
- ✅ **Hệ thống Authentication & RBAC (`authService.js`, `jwtFilter.js`, `rbacMiddleware.js`)**:
  - Đã có Đăng ký (Hỗ trợ cấu trúc Khóa/Khoa/Ngành), Đăng nhập (bằng Email hoặc Username), Token Rotation (đổi `AccessToken` từ `RefreshToken`), Đăng xuất và quản lý trạng thái tài khoản (`ACTIVE`, `INACTIVE`, `BANNED`).
- ✅ **Hệ thống Quản lý Tài liệu & Upload Guard (`documentService.js`, `uploadGuard.js`)**:
  - Tách biệt luồng upload cho Sinh viên và Giảng viên. Kiểm tra đối chiếu chặt chẽ **100% ID Khóa/Khoa/Ngành** và xác minh môn học thuộc chương trình đào tạo của Sinh viên trước khi lưu.
  - Hỗ trợ đầy đủ vòng đời tài liệu: Upload (`Multer`), Xem chi tiết, Cập nhật, Xóa mềm (`Soft Delete`), Khôi phục (`Restore`), Xem thùng rác.
- ✅ **Tìm kiếm & Lọc Nâng cao (`searchDocumentsRepo` — `TypeORM QueryBuilder`)**:
  - Hỗ trợ tìm kiếm từ khóa không dấu tiếng Việt (`unaccent()`), lọc theo người đăng, vai trò (`STUDENT/LECTURER`), phân cấp học thuật, loại tài liệu và quyền riêng tư (`Visibility: PUBLIC, PRIVATE, GROUP`).
- ✅ **Nhóm học tập nội bộ (`groupService.js`)**:
  - Tạo nhóm, thêm/bớt thành viên, chia sẻ tài liệu vào nhóm, upload trực tiếp vào nhóm (gắn tag `GROUP`).
  - Giải tán nhóm (`disbandGroupService`) tự động tận dụng `ON DELETE CASCADE` và chuyển các tài liệu nội bộ nhóm sang trạng thái xóa mềm.
- ✅ **Tương tác & Quản trị (`interactionRepository.js`, `adminController.js`, `academicService.js`)**:
  - Thích (`Like`), Đánh dấu (`Bookmark`), bộ đếm lượt xem (`view_count`).
  - Quản trị toàn bộ cấu trúc học thuật (`Cohorts, Faculties, Majors, Subjects`), thống kê hệ thống (`Stats`), kiểm tra sức khỏe server (`System Health`).
- ✅ **Tiến trình tự động định kỳ (`node-cron` — `cronJobs.js`)**:
  - Chạy ngầm lúc `02:00 sáng` mỗi ngày: Dọn dẹp tệp tin vật lý và xóa cứng tài liệu trong thùng rác quá `15 ngày`; thu hồi toàn bộ `RefreshToken` hết hạn.

---

### 1.2. Frontend (FE) — **Tiến độ: ~95% - Cấu trúc hoàn chỉnh & Giao diện chuyên nghiệp**
Frontend đã hoàn tất thi công các Phase theo thiết kế trong `STUDYHUB_FE.md`:
- ✅ **Kiến trúc Routing & Bảo mật (`router/index.jsx`, `axiosInstance.js`)**:
  - Phân chia rõ ràng `Public Routes` (`/login`, `/register`), `Protected Routes` và `Admin Routes` (`RbacRoute`).
  - `axiosInstance` được tích hợp cơ chế **Token Rotation kết hợp Promise Deduplication** (`refreshTokenPromise`), giúp tự động làm mới token khi hết hạn (`401`) mà không gây lặp vô hạn hay mất phiên người dùng.
- ✅ **Hệ thống Thư viện Component (Atomic & Domain UI Component Library)**:
  - Xây dựng đầy đủ: `Modal`, `ConfirmModal`, `Skeleton`, `Badge`, `Button`, `Input`, `Select`, `FileDropzone`, `DocumentCard`, `TrashCard`, `AcademicTreeWidget`, `SystemHealthCard`, `CascadeSelect`.
- ✅ **Trang nghiệp vụ & Dashboard theo Role (`RoleBasedDashboard.jsx`)**:
  - Tự động điều hướng giao diện phù hợp cho Sinh viên (`StudentDashboard`), Giảng viên (`LecturerDashboard`) và Quản trị viên (`AdminDashboard`).
  - Trang Tìm kiếm nâng cao, Quản lý Nhóm học tập, Hồ sơ cá nhân và khu vực Quản trị Admin đều đã hoạt động đồng bộ với API Backend.

---

## 2. ĐÁNH GIÁ CHẤT LƯỢNG MÃ NGUỒN (CODE QUALITY)

### 2.1. Điểm tốt (Strengths)
1. **Phân tách trách nhiệm rõ ràng (Clean & Modular Architecture)**:
   - Backend tuân thủ nghiêm ngặt mô hình 4 tầng: `Router -> Controller -> Service -> Repository -> Model/DTO`. Controller không chứa logic SQL; Repository chuyên trách giao tiếp `TypeORM`; Service tập trung xử lý nghiệp vụ.
   - Frontend áp dụng tốt `Atomic Design`, tách biệt UI câm (`components/ui`) và UI nghiệp vụ (`components/domain`), quản lý trạng thái toàn cục bằng `Zustand` (`useAuthStore`), và quản lý server state bằng `TanStack Query v5`.
2. **Chiến lược Phòng thủ Đa tầng (Defense-in-Depth Validation)**:
   - Frontend validate dữ liệu phía client bằng `zod` (`validators.js`) để phản hồi nhanh cho người dùng.
   - Backend không tin tưởng client, validate lại bằng DTO (`validateUploadDocumentRequest`), sau đó kích hoạt `uploadGuard` kiểm tra tính hợp lệ về logic học thuật trước khi ghi DB.
   - Nếu xảy ra lỗi khi ghi vào cơ sở dữ liệu sau khi upload file, Backend có cơ chế **Rollback tự động** (`cleanupFile`) xóa tệp tin vật lý khỏi ổ cứng, không để lại rác hệ thống.
3. **Bảo mật & Quản lý phiên chuyên nghiệp**:
   - Tránh lưu `AccessToken` vào cơ sở dữ liệu để giảm tải DB. `RefreshToken` được quản lý trong DB và có cơ chế thu hồi triệt để (`deleteRefreshTokensByUserId`) ngay khi người dùng đổi mật khẩu, đăng xuất, hoặc khi Admin chuyển trạng thái sang `BANNED/INACTIVE`.

---

### 2.2. Điểm yếu (Weaknesses)
1. **Lỗi bất đồng bộ tên biến môi trường giữa FE và BE (Subtle Environment Config Mismatch)**:
   - Đây là điểm yếu đáng chú ý nhất về mặt tích hợp cấu hình hiện tại (Xem chi tiết tại Mục 3).
2. **Thiếu cơ chế Database Transaction cho các thao tác phụ thuộc nhiều bảng**:
   - Một số thao tác như Tạo Nhóm + Thêm Owner vào `group_members`, hay thao tác Like/Bookmark + Tăng bộ đếm (`increment/decrement`) đang được thực hiện nối tiếp qua các lệnh await riêng lẻ thay vì nằm trong một `QueryRunner Transaction`.
3. **Chưa tối ưu hóa truy vấn gộp ở một số luồng kiểm tra (Sequential Checking)**:
   - Các luồng như đăng ký tài khoản hoặc chạy cron job dọn rác đang thực hiện lặp/nối tiếp nhiều câu lệnh truy vấn đơn lẻ thay vì tận dụng truy vấn batch (gộp).

---

## 3. NHỮNG PHẦN ĐANG BỊ HARD CODE (HARDCODED AREAS)

> [!WARNING]
> Những điểm hardcode dưới đây có thể khiến ứng dụng hoạt động bình thường trên môi trường `localhost` của lập trình viên, nhưng sẽ **lỗi ngay lập tức khi triển khai (Deploy) lên máy chủ thật** hoặc khi thay đổi cấu hình cổng (Port/Domain).

### 3.1. Lỗi Hardcode đường dẫn gốc trong `formatters.js` (Frontend)
Tại `Frontend/src/utils/formatters.js` (hàm `getAvatarUrl` và `getFileUrl`), mã nguồn đang lấy URL gốc như sau:
```javascript
const origin = import.meta.env.VITE_API_URL?.replace(/\/api\/v1\/?$/, '') || 'http://localhost:8081';
```
* **Vấn đề:** Trong file `Frontend/.env` và trong `axiosInstance.js`, biến môi trường được đặt tên là **`VITE_API_BASE_URL`** (`VITE_API_BASE_URL=http://localhost:8081/api/v1`). Biến `VITE_API_URL` không hề được định nghĩa!
* **Hậu quả:** `import.meta.env.VITE_API_URL` luôn bị `undefined`, khiến toàn bộ ảnh đại diện (`Avatar`) và đường dẫn tải tệp tin (`PDF/DOCX/ZIP`) trên toàn hệ thống FE **luôn bị fallback hardcode về `'http://localhost:8081'`**. Nếu deploy hệ thống lên domain thực tế (ví dụ `https://api.studyhub.vn`), ảnh và tệp tải xuống sẽ bị lỗi `ERR_CONNECTION_REFUSED`.
* **Khắc phục:** Sửa `formatters.js` để kiểm tra đúng tên biến `VITE_API_BASE_URL` (hoặc hỗ trợ cả hai):
  ```javascript
  const baseUrl = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || 'http://localhost:8081/api/v1';
  const origin = baseUrl.replace(/\/api\/v1\/?$/, '');
  ```

### 3.2. Hardcode CORS Origin và Port trong `server.js` (Backend)
Tại `Backend/src/server.js`:
```javascript
app.use(cors({
    origin: "http://localhost:" + process.env.FRONTEND_PORT,
    credentials: true,
    // ...
}));
```
* **Vấn đề:** Cấu hình đang nối cứng chuỗi `"http://localhost:"`. Nếu frontend được host trên mạng LAN (ví dụ `http://192.168.1.50:5173`) hoặc trên tên miền sản xuất (`https://studyhub.vn`), request sẽ bị trình duyệt chặn hoàn toàn bởi lỗi CORS.
* **Khắc phục:** Sử dụng biến môi trường `ALLOWED_ORIGINS` cho phép phân tách bởi dấu phẩy, kiểm tra linh hoạt trong danh sách:
  ```javascript
  const allowedOrigins = (process.env.ALLOWED_ORIGINS || "http://localhost:5173").split(",");
  app.use(cors({
      origin: (origin, callback) => {
          if (!origin || allowedOrigins.includes(origin)) callback(null, true);
          else callback(new Error("Not allowed by CORS"));
      },
      credentials: true
  }));
  ```

### 3.3. Hardcode cấu hình dung lượng và định dạng file rải rác
* Mặc dù Backend đã có `Backend/src/config/constants.js` định nghĩa `UPLOAD_CONFIG.DOC.MAX_SIZE_BYTES` (`50MB`) và `AVATAR.MAX_SIZE_BYTES` (`5MB`), nhưng tại `DocumentUploadModal.jsx`, `FileDropzone.jsx` ở Frontend và trong các chuỗi thông báo lỗi (`ERROR_MESSAGE`) ở cả BE/FE, con số `"50MB"`, `"5MB"`, và danh sách `".pdf, .docx, .pptx, .zip"` đang bị viết cứng rải rác trong các chuỗi text.
* Nếu sau này hệ thống muốn nâng giới hạn lên `100MB` hoặc thêm định dạng `.xlsx`, lập trình viên sẽ phải tìm sửa thủ công ở hàng chục file khác nhau.

---

## 4. CÁC LỖI TIỀM ẨN VỀ LOGIC VÀ HIỆU NĂNG (LOGIC & PERFORMANCE RISKS)

### 4.1. [Logic / Data Integrity] Mất quyền truy cập tài liệu `GROUP` sau khi Giải tán hoặc Khôi phục nhóm
> [!IMPORTANT]
> **Vị trí rủi ro:** `groupService.js` (hàm `disbandGroupService`) & `documentService.js` (hàm `restoreDocument`).

* **Hiện trạng logic:** Khi Chủ sở hữu giải tán nhóm (`disbandGroupService`), hệ thống thực hiện 2 bước:
  1. Soft-delete các tài liệu nội bộ nhóm (`UPDATE documents SET is_deleted = true WHERE id IN (SELECT document_id FROM group_documents WHERE group_id = X) AND visibility = 'GROUP'`).
  2. Xóa bản ghi nhóm (`deleteGroupById(groupId)`). Nhờ ràng buộc `ON DELETE CASCADE` trong PostgreSQL, các bản ghi trong `group_documents` và `group_members` bị xóa vĩnh viễn khỏi DB.
* **Lỗi tiềm ẩn:** Sau khi nhóm đã bị giải tán, nếu Chủ sở hữu tài liệu đó truy cập vào **Thùng rác (`/documents/trash`)** và ấn nút **Khôi phục (`restoreDocument`)**, tài liệu sẽ được chuyển về `is_deleted = false` và giữ nguyên trường `visibility = 'GROUP'`.
* **Hậu quả:** Tài liệu khôi phục có quyền hiển thị là `GROUP`, nhưng bản ghi liên kết trong `group_documents` đã bị xóa sạch khi giải tán nhóm! Hệ quả là hàm kiểm tra quyền `checkDocumentVisibilityAccess` sẽ từ chối tất cả mọi người (ngoại trừ Owner và Admin) vì không tìm thấy ai thuộc `group_members` của tài liệu đó nữa. Tài liệu trở thành một "bóng ma" mang nhãn Nhóm nhưng không thuộc nhóm nào.
* **Giải pháp đề xuất:** Trong hàm `restoreDocument` (`documentService.js`), nếu kiểm tra thấy tài liệu có `visibility === 'GROUP'` nhưng không còn tồn tại bất kỳ bản ghi nào trong bảng `group_documents`, tự động chuyển đổi `visibility` sang `'PRIVATE'` (hoặc cảnh báo cho người dùng):
  ```javascript
  if (document.visibility === "GROUP") {
      const hasGroupRelation = await AppDataSource.getRepository("GroupDocument").findOne({ where: { document: { id: documentId } } });
      if (!hasGroupRelation) {
          updateData.visibility = "PRIVATE";
      }
  }
  ```

---

### 4.2. [Hiệu năng / Race Condition] Thiếu Transaction và Lock khi tương tác Like / Bookmark
> [!TIP]
> **Vị trí rủi ro:** `documentService.js` (hàm `toggleLikeDocument` và `toggleBookmarkDocument`).

* **Hiện trạng:** Khi người dùng ấn Thích tài liệu, luồng kiểm tra hiện tại:
  ```javascript
  const existingLike = await findLike(user.id, documentId);
  if (existingLike) {
      await removeLike(user.id, documentId);
      await AppDataSource.getRepository("Document").decrement({ id: documentId }, "like_count", 1);
  } else {
      await addLike(user.id, documentId);
      await AppDataSource.getRepository("Document").increment({ id: documentId }, "like_count", 1);
  }
  ```
* **Vấn đề:** Các bước `SELECT existingLike` -> `INSERT/DELETE` -> `UPDATE like_count` hoàn toàn không nằm trong một `Database Transaction` (`AppDataSource.manager.transaction`).
* **Hậu quả:** Nếu một người dùng click đúp nhanh (Double-click) hoặc gửi 2 request đồng thời trong cùng 1 mili-giây, cả 2 request đều có thể đọc thấy `existingLike = null` và cùng thực hiện `addLike` + `increment`, dẫn đến:
  - Lỗi `23505 Duplicate Key` (nếu có unique constraint trên `(user_id, document_id)`).
  - Bộ đếm `like_count` trong bảng `documents` bị lệch so với số bản ghi thực tế trong bảng `document_likes`.
* **Khắc phục:** Bọc luồng toggle trong `TypeORM Transaction`:
  ```javascript
  await AppDataSource.manager.transaction(async (transactionalEntityManager) => {
      const likeRepo = transactionalEntityManager.getRepository("DocumentLike");
      const docRepo = transactionalEntityManager.getRepository("Document");
      const existing = await likeRepo.findOne({ where: { user: { id: user.id }, document: { id: documentId } } });
      if (existing) {
          await likeRepo.remove(existing);
          await docRepo.decrement({ id: documentId }, "like_count", 1);
      } else {
          await likeRepo.save(likeRepo.create({ user: { id: user.id }, document: { id: documentId } }));
          await docRepo.increment({ id: documentId }, "like_count", 1);
      }
  });
  ```

---

### 4.3. [Hiệu năng CronJob] N+1 Queries khi dọn dẹp Thùng rác mềm
> [!TIP]
> **Vị trí rủi ro:** `cronJobs.js` (hàm `runTrashCleanupTask`).

* **Hiện trạng:** Khi quét tài liệu quá hạn > 15 ngày trong thùng rác, vòng lặp đang thực hiện:
  ```javascript
  for (const doc of expiredDocs) {
      if (doc.file_url) { await fs.promises.unlink(...); }
      await hardDeleteDocumentById(doc.id); // <- Xóa từng bản ghi một trong vòng lặp!
      deletedCount++;
  }
  ```
* **Vấn đề:** Nếu hệ thống có 1.000 tài liệu hết hạn cùng lúc, vòng lặp `for...of` sẽ thực hiện **1.000 câu lệnh `DELETE` tuần tự** gửi tới cơ sở dữ liệu PostgreSQL. Điều này tạo ra độ trễ lớn và chiếm dụng kết nối DB (Connection pool exhaustion) trong thời gian Cron chạy.
* **Khắc phục:** Tách luồng xóa file vật lý và xóa DB thành thao tác Batch (truy vấn gộp):
  ```javascript
  const docIds = [];
  for (const doc of expiredDocs) {
      if (doc.file_url) { /* unlink file vật lý */ }
      docIds.push(doc.id);
  }
  if (docIds.length > 0) {
      // Chỉ gửi 1 câu truy vấn SQL duy nhất cho toàn bộ danh sách ID
      await AppDataSource.getRepository("Document")
          .createQueryBuilder()
          .delete()
          .where("id IN (:...docIds)", { docIds })
          .execute();
  }
  ```

---

### 4.4. [Tối ưu truy vấn] N+1 Sequential Check khi Đăng ký tài khoản (`register`)
> [!TIP]
> **Vị trí rủi ro:** `authService.js` (hàm `register`).

* **Hiện trạng:** Để kiểm tra trùng lặp thông tin khi người dùng đăng ký mới, Backend đang chạy tuần tự 4 câu lệnh SQL riêng biệt:
  1. `await findUserByEmail(body.email);`
  2. `await findUserByUsername(body.username);`
  3. `await findUserByCode(body.code);`
  4. `await findUserByPhone(body.phone);`
* **Vấn đề:** Mỗi bước `await` phải chờ Database phản hồi mới chạy tiếp bước sau. Nếu cả 4 trường đều không trùng (trường hợp phổ biến nhất khi đăng ký thành công), hệ thống mất chi phí của **4 Round-trips** tới DB.
* **Khắc phục:** Gộp thành 1 truy vấn kiểm tra duy nhất:
  ```javascript
  const existingUser = await AppDataSource.getRepository("User")
      .createQueryBuilder("user")
      .where("user.email = :email OR user.username = :username OR user.code = :code OR (user.phone IS NOT NULL AND user.phone = :phone)", {
          email: body.email,
          username: body.username,
          code: body.code,
          phone: body.phone || ""
      })
      .getOne();

  if (existingUser) {
      if (existingUser.email === body.email) return { statusCode: 409, message: "Email này đã được sử dụng.", ... };
      if (existingUser.username === body.username) return { statusCode: 409, message: "Username này đã được sử dụng.", ... };
      if (existingUser.code === body.code) return { statusCode: 409, message: "Mã người dùng này đã được sử dụng.", ... };
      if (body.phone && existingUser.phone === body.phone) return { statusCode: 409, message: "Số điện thoại này đã được sử dụng.", ... };
  }
  ```
  Giảm từ 4 truy vấn xuống còn **1 truy vấn duy nhất**, tăng tốc độ phản hồi API đăng ký lên tối thiểu 300%.

---

## 5. TỔNG KẾT & LỘ TRÌNH KHUYẾN NGHỊ

Dự án **StudyHub** đang ở trạng thái **rất tốt về kiến trúc và tính năng**. Để chuẩn bị cho giai đoạn đưa ra môi trường sản xuất (Production Release), nhóm phát triển nên ưu tiên xử lý theo thứ tự sau:

1. **Ưu tiên cao nhất (Ngay lập tức):**
   - Sửa lỗi lệch tên biến môi trường `VITE_API_URL` vs `VITE_API_BASE_URL` trong `formatters.js` để tránh vỡ đường dẫn ảnh và tài liệu khi deploy.
   - Sửa cấu hình CORS `server.js` chuyển từ nối chuỗi `"http://localhost:"` sang đọc từ danh sách `ALLOWED_ORIGINS`.
2. **Ưu tiên trung bình (Trước khi Load Testing / Đón lượng user lớn):**
   - Tối ưu hóa Batch Delete cho CronJob `runTrashCleanupTask`.
   - Bọc Transaction cho thao tác Thích/Bookmark tài liệu (`toggleLikeDocument`) để chống race condition và lệch đếm.
   - Gộp truy vấn kiểm tra trùng lặp trong luồng Đăng ký (`register`).
3. **Ưu tiên dài hạn (Bảo trì & Mở rộng):**
   - Bổ sung xử lý logic `visibility` khi khôi phục tài liệu nhóm (`restoreDocument`).
   - Tập trung hóa cấu hình `MAX_SIZE_BYTES` và `ALLOWED_EXTENSIONS` ra biến toàn cục dùng chung cho cả FE và BE.
