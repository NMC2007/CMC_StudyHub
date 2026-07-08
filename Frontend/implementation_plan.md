# StudyHub Frontend — Kế Hoạch Phát Triển Hoàn Chỉnh (Đã Thống Nhất)

## Tổng Quan

**Mục tiêu:** Xây dựng Frontend StudyHub từ base hiện tại (Vite + React 19 + Axios kiểm thử) đến sản phẩm hoàn chỉnh phục vụ 3 role: Student, Lecturer, Admin.

**Nguyên tắc sắp xếp:** Mỗi giai đoạn chỉ bắt đầu sau khi giai đoạn trước hoàn thành vì có sự phụ thuộc trực tiếp (build on top of). Kế hoạch này là tài liệu sống hướng dẫn cho toàn bộ quá trình phát triển.

---

## ✅ Các Quyết Định Kỹ Thuật Đã Thống Nhất

1. **Styling Engine:** Sử dụng **TailwindCSS v4 (CSS-first)**. Cấu hình toàn bộ màu sắc, font chữ và theme trong file `src/index.css` qua chỉ thị `@theme` (không dùng `tailwind.config.js`).
2. **Notification System:** Sử dụng **`sonner`** (hiện đại, nhẹ, mượt mà hơn `react-hot-toast`).
3. **Cấu trúc Axios & API:** Di chuyển file cấu hình sang chuẩn **`src/api/axiosInstance.js`**. Xóa bỏ các folder/file không cần thiết hoặc trùng lặp (`src/lib/`, `src/services/`, `src/contexts/`).
4. **Cơ chế Đọc Tài Liệu (PDF / DOCX):**
   - Sử dụng **`window.open(fileUrl, '_blank')`** để kiểm thử việc mở và đọc tài liệu ngay từ các giai đoạn đầu trước khi đến Phase 5.
   - _Lý do & Cơ chế:_ Với file PDF/ảnh, trình duyệt hiện đại sẽ tự động hiển thị bộ đọc PDF tích hợp trên tab mới cực kỳ mượt mà (zoom, in, tải về). Với file DOCX/PPTX/ZIP, trình duyệt sẽ tự động tải file xuống (Download). Điều này giúp kiểm thử nhanh URL trả về từ Backend, tiết kiệm 1-2MB dung lượng bundle frontend vì không phải nhét thư viện PDF nặng nề vào app từ đầu, đồng thời tạo trải nghiệm đa tác vụ quen thuộc cho sinh viên/giảng viên.
5. **Chia sẻ Logic & Dynamic Theming cho Student & Lecturer:**
   - Dùng chung logic, custom hooks, và các trang giao diện (như `/documents`, `/search`, `/favorites`, `/groups`, `/profile`).
   - Phân biệt bằng **màu sắc động (Dynamic Color Theming)**: Giao diện Sinh viên sử dụng tone màu **Xanh biển (`#2563EB`)**, Giao diện Giảng viên sử dụng tone màu **Xanh lá (`#16A34A`)** dựa theo `role` trong Zustand Store.
   - Các logic đặc thù (ví dụ: Giảng viên upload không bị giới hạn Khóa/Khoa/Ngành) được xử lý conditionally theo `role`.
6. **Triển khai sớm 4 Atomic UI Components (`Button`, `Input`, `Select`, `Badge`) ở Phase 2/3:**
   - _Lý do:_ Theo lộ trình gốc, Phase 4 mới xây dựng "Shared Component Library". Tuy nhiên, việc đẩy sớm 4 component này lên trước khi làm Phase 2 & 3 giúp các trang Authentication (Login, Register) và Layout (AppLayout, Sidebar) được xây dựng chuẩn Atomic Design ngay từ đầu. Tránh việc hardcode lặp lại Tailwind classes, dễ dàng tích hợp React Hook Form + Zod validation, đảm bảo tính nhất quán cao cho toàn bộ UI.
7. **Tự động điền sẵn (Pre-fill) thông tin đăng nhập sau khi Đăng ký thành công:**
   - _Lý do:_ Tối ưu hóa trải nghiệm người dùng (UX) và giảm thao tác thừa. Khi sinh viên/giảng viên đăng ký tài khoản thành công (`POST /auth/register`), hệ thống tự động chuyển hướng về trang `/login` kèm theo state mang theo `username` hoặc `email` vừa đăng ký, điền sẵn vào ô input để người dùng chỉ cần nhập mật khẩu là có thể đăng nhập ngay.
8. **Xây dựng Trang Dashboard khung (Placeholder Dashboards) trong Phase 3:**
   - _Lý do:_ Để kiểm thử triệt để luồng phân quyền Router Guard (`ProtectedRoute`, `RbacRoute`, `RoleBasedDashboard`) và cơ chế đổi màu chủ đạo (Dynamic Color Theming: Xanh biển cho Student, Xanh lá cho Lecturer, Đỏ cho Admin) ngay sau khi hoàn thành Phase 3 mà không cần chờ đến Phase 5 & 6.

---

## 📋 Roadmap 7 Giai Đoạn Phát Triển

```
Phase 1: Foundation & Infrastructure  ←── Không phụ thuộc gì
Phase 2: Auth Pages                   ←── Phụ thuộc Phase 1 (axiosInstance, store)
Phase 3: Layout & Design System       ←── Phụ thuộc Phase 1 (theme, router guards)
Phase 4: Shared Component Library     ←── Phụ thuộc Phase 3 (layout wrapper sẵn)
Phase 5: Student & Lecturer Features  ←── Phụ thuộc Phase 2+3+4 (auth, layout, components)
Phase 6: Admin Panel                  ←── Phụ thuộc Phase 4+5 (components tái sử dụng)
Phase 7: Polish & Optimization        ←── Phụ thuộc tất cả phase trước hoàn thành
```

---

## Phase 1 — Foundation & Infrastructure

> **Lý do làm đầu tiên:** Đây là tầng nền. Mọi component, page, hook đều phụ thuộc vào axios interceptors, auth store và design tokens.

### 1.1 Cài đặt & Dọn dẹp thư viện/thư mục

```bash
npm install zustand @tanstack/react-query react-hook-form zod @hookform/resolvers
```

- Xóa folder rỗng không sử dụng: `src/contexts/`, `src/services/`, `src/lib/` (sau khi chuyển axios).

### 1.2 Design System — `src/index.css`

- Xóa toàn bộ CSS mặc định Vite.
- Import Google Font Inter.
- Cấu hình `@theme` TailwindCSS v4:
  - `--color-brand-student: #2563EB;`, `--color-brand-student-light: #DBEAFE;`, `--color-brand-student-dark: #1E40AF;`
  - `--color-brand-lecturer: #16A34A;`, `--color-brand-lecturer-light: #DCFCE7;`, `--color-brand-lecturer-dark: #15803D;`
  - `--color-brand-admin: #DC2626;`, `--color-brand-admin-light: #FEE2E2;`, `--color-brand-admin-dark: #B91C1C;`
  - `--color-surface: #F0F7FF;`, `--color-card: #FFFFFF;`
- Reset CSS cơ bản.

### 1.3 Nâng cấp Axios Instance — `src/api/axiosInstance.js`

- Di chuyển từ `src/lib/axios.js` → `src/api/axiosInstance.js`.
- **Request interceptor:** Tự động gắn `Authorization: Bearer <accessToken>` từ Zustand.
- **Response interceptor:** Bắt lỗi `401 Unauthenticated` → tự động gọi `/auth/refresh` với `refreshToken` trong localStorage → lưu token mới (Token Rotation) → retry request gốc. Nếu thất bại → `clearCredentials()` + redirect `/login`.

### 1.4 Zustand Auth Store — `src/stores/useAuthStore.js`

- State: `user`, `accessToken`, `isAuthenticated`, `role`.
- Actions: `setCredentials(user, accessToken)`, `clearCredentials()`, `updateUser(updatedData)`.
- Bảo mật: `accessToken` lưu trong memory (Zustand), `refreshToken` lưu trong localStorage.

### 1.5 TanStack Query Setup — `src/main.jsx`

- Tạo `QueryClient` với `staleTime: 60_000` (1 phút), `retry: 1`.
- Wrap app với `<QueryClientProvider>` và gắn `<Toaster position="top-right" />` từ `sonner`.

### 1.6 API Functions Layer — `src/api/`

Tạo các file API (hàm gọi axios thuần):

- `authApi.js`: login, register, refresh, logout.
- `userApi.js`: getProfile, updateProfile, updateAvatar.
- `documentApi.js`: search, getById, upload, update, softDelete, restore, toggleLike, toggleBookmark, getTrash, getLikes, getBookmarks.
- `groupApi.js`: getAll, getById, create, addMember, removeMember, disband, shareDocument.
- `academicApi.js`: getCohorts, getFacultiesByCohort, getMajorsByFaculty, getSubjectsByMajor, admin CRUD.
- `adminApi.js`: getUsers, cronTriggerTrash, cronTriggerToken.

### 1.7 Utilities & Schemas — `src/utils/`

- `formatters.js`: `formatDate`, `formatFileSize`, `formatRelativeTime`, `getFileIcon`, `getThemeColorByRole`.
- `validators.js`: Zod schemas cho form Login, Register, Upload Document, Create Group.

### 1.8 Custom Hooks — `src/hooks/`

- `useDocuments.js`, `useGroups.js`, `useAcademic.js`, `useAuth.js` (wrappers cho TanStack Query `useQuery` và `useMutation`, tích hợp sẵn Optimistic Updates cho Like/Bookmark).

---

## Phase 2 — Authentication Pages

> **Lý do làm sau Phase 1:** LoginPage và RegisterPage cần axiosInstance + authStore + Zod validators từ Phase 1.

### 2.1 Router Cơ bản — `src/router/index.jsx`

- Cấu hình `createBrowserRouter` với routes public: `/login`, `/register`.
- Route catch-all `*` → `NotFoundPage`.
- Loader `redirectIfAuth`: ngăn user đã đăng nhập truy cập lại trang Login/Register.

### 2.2 LoginPage — `src/pages/auth/LoginPage.jsx`

- Form: `identifier` (email/username) + `password`.
- Tích hợp React Hook Form + Zod validation.
- Submit: `POST /auth/login` → lưu token vào store & localStorage → redirect đến `/`.
- Hiển thị lỗi inline rõ ràng khi sai tài khoản/mật khẩu.

### 2.3 RegisterPage — `src/pages/auth/RegisterPage.jsx`

- **Step 1:** `full_name`, `username`, `email`, `phone`, `dob`, `password`, `role` (STUDENT hoặc LECTURER).
- **Step 2 (Học thuật - Dynamic):**
  - STUDENT: CascadeSelect Khóa → Khoa → Ngành (bắt buộc chọn cả 3).
  - LECTURER: Chỉ cần chọn Khoa.
- Submit: `POST /auth/register` → redirect `/login` + toast thông báo tạo tài khoản thành công.

### 2.4 NotFoundPage — `src/pages/NotFoundPage.jsx`

- Giao diện 404 thân thiện kèm nút quay lại trang chủ.

---

## Phase 3 — Layout & Route Guards

> **Lý do làm sau Phase 2:** Bọc bảo vệ và tạo khung điều hướng cho toàn bộ các trang nghiệp vụ phía sau.

### 3.1 Route Guards

- `ProtectedRoute.jsx`: Kiểm tra `isAuthenticated`, nếu `false` redirect về `/login`.
- `RbacRoute.jsx`: Kiểm tra `role` có nằm trong `allowedRoles[]` không, nếu không đủ quyền redirect về `/` + toast cảnh báo.
- `RoleBasedDashboard.jsx`: Component điều hướng render đúng Dashboard theo role (Student vs Lecturer vs Admin).

### 3.2 AppLayout — `src/components/layout/AppLayout.jsx`

- Khung chung: Sidebar (trái) + TopNavbar (trên) + Content Area (chính).
- **Dynamic Theming:** Sidebar và các điểm nhấn nhận màu nền/border động theo Role (Student: Xanh biển, Lecturer: Xanh lá, Admin: Đỏ).
- Responsive: Sidebar collapse thành Bottom Navigation Bar hoặc Drawer trên màn hình Mobile/Tablet.

### 3.3 Sidebar & TopNavbar — `src/components/layout/Sidebar.jsx`, `TopNavbar.jsx`

- Sidebar: Danh sách menu điều hướng theo Role, thông tin User Avatar + Tên + Badge Role ở dưới cùng, nút Đăng xuất.
- TopNavbar: Thanh tìm kiếm nhanh (ấn Enter nhảy sang `/search?q=...`), hiển thị tiêu đề trang, dropdown profile.

### 3.4 PageWrapper — `src/components/layout/PageWrapper.jsx`

- Component bọc chuẩn hóa padding, breadcrumb và action buttons cho các trang con.

---

## Phase 4 — Shared Component Library (Atomic UI & Domain)

> **Lý do làm sau Phase 3:** Lắp ráp sẵn các component tái sử dụng (LEGO blocks) để việc xây dựng trang ở Phase 5 & 6 diễn ra nhanh chóng và nhất quán.

### 4.1 Atomic UI — `src/components/ui/`

- `Button.jsx`: Hỗ trợ các variant (`primary`, `secondary`, `danger`, `ghost`), size, trạng thái `loading` (spinner) và `disabled`. Màu sắc `primary` động theo Role.
- `Input.jsx` & `Textarea.jsx`: Tích hợp React Hook Form, tự động hiển thị lỗi validation Zod bên dưới.
- `Select.jsx`: Dropdown chuẩn hóa style.
- `Badge.jsx`: Hiển thị tag loại tài liệu (PDF, DOCX, EXAM, SLIDE...) và Role.
- `Modal.jsx` & `ConfirmModal.jsx`: Modal slide-up animation, bẫy focus, đóng khi bấm backdrop. `ConfirmModal` dùng cho các thao tác nguy hiểm (Xóa tài liệu, Giải tán nhóm).
- `Skeleton.jsx`: Shimmer loading state.
- `EmptyState.jsx` & `ErrorState.jsx`: Giao diện khi không có dữ liệu hoặc gặp lỗi fetch API.
- `Tabs.jsx` & `Pagination.jsx`: Điều hướng tab và phân trang server-side.
- `FileDropzone.jsx`: Vùng kéo thả upload file, validate định dạng (.pdf, .docx, .pptx, .zip) và dung lượng (≤ 50MB cho doc, ≤ 5MB cho avatar).

### 4.2 Domain Components — `src/components/`

- **`document/DocumentCard.jsx`:** Card hiển thị tài liệu với Icon định dạng, tên, người đăng, môn học, lượt xem, lượt thích. Tích hợp nút Like/Bookmark với **Optimistic Update**. Nút mở tài liệu (`window.open`). Menu Sửa/Xóa cho Owner. Bọc `React.memo`.
- **`document/DocumentUploadModal.jsx`:** Modal chứa form upload. Nếu là STUDENT: tự động điền Khóa/Khoa/Ngành từ store (readonly), chỉ cho chọn Môn học thuộc Ngành của mình. Nếu là LECTURER/ADMIN: cho phép chọn tự do qua CascadeSelect.
- **`document/TrashCard.jsx`:** Card trong thùng rác, hiển thị thời gian đã xóa (`deleted_at`) và cảnh báo "Xóa vĩnh viễn sau X ngày". Nút Khôi phục.
- **`group/GroupCard.jsx` & `MemberItem.jsx`:** Card hiển thị thông tin nhóm học tập và danh sách thành viên.
- **`academic/CascadeSelect.jsx`:** 4 Dropdown liên kết (Khóa → Khoa → Ngành → Môn). Tự động xóa tầng dưới khi đổi tầng trên. Hỗ trợ prop `lockedLevels` cho sinh viên.
- **`academic/AcademicTree.jsx`:** Cây phân cấp học thuật dạng collapse/expand cho Admin.

---

## Phase 5 — Student & Lecturer Features

> **Lý do làm sau Phase 4:** Lắp ghép các trang tính năng cốt lõi bằng cách sử dụng các components từ Phase 4, kết nối với API từ Phase 1. Dùng chung trang cho Student & Lecturer, khác biệt bởi màu sắc động và phân quyền logic.

### 5.1 Dashboards — `src/pages/student/StudentDashboard.jsx` & `src/pages/lecturer/LecturerDashboard.jsx`

- **Student Dashboard (Xanh biển):** Chào mừng sinh viên, 4 card thống kê nhanh (Tài liệu đã đăng, Lượt xem, Đã lưu, Nhóm), danh sách 5 tài liệu mới nhất của tôi, 6 tài liệu Public phổ biến, danh sách nhóm đang tham gia.
- **Lecturer Dashboard (Xanh lá):** Chào mừng giảng viên, 4 card thống kê (Tài liệu đăng, Tổng lượt xem, Tổng lượt thích, Nhóm quản lý), tài liệu phổ biến nhất của giảng viên, nhóm đang quản lý.

### 5.2 Quản lý Tài Liệu (`/documents`) — `src/pages/shared/DocumentsPage.jsx`

- 2 Tabs: **Tài liệu của tôi** (Grid `DocumentCard` + bộ lọc visibility/type) và **Thùng rác** (Grid `TrashCard` + Khôi phục).
- Nút "Upload Tài Liệu" mở `DocumentUploadModal`.
- Tích hợp Skeleton loading và Empty state.

### 5.3 Tìm Kiếm Nâng Cao (`/search`) — `src/pages/shared/SearchPage.jsx`

- Layout 2 cột: Sidebar bộ lọc bên trái (Từ khóa debounce 400ms, Người đăng, Vai trò, Loại tài liệu, CascadeSelect học thuật) + Grid kết quả bên phải.
- URL Sync: Đồng bộ bộ lọc lên URL query string để có thể copy/share link tìm kiếm.
- Mobile: Bộ lọc thu gọn vào Accordion/Bottom Sheet.

### 5.4 Yêu Thích (`/favorites`) — `src/pages/shared/FavoritesPage.jsx`

- 2 Tabs: **Đã lưu (Bookmarks)** và **Đã thích (Likes)**.
- Khi bấm bỏ like/bookmark trên trang này, item sẽ được xóa khỏi danh sách ngay lập tức nhờ Optimistic Update.

### 5.5 Nhóm Học Tập (`/groups` & `/groups/:id`) — `src/pages/shared/GroupsPage.jsx`, `GroupDetailPage.jsx`

- Danh sách các nhóm học tập đang tham gia + Nút "Tạo nhóm mới" (Modal nhập tên & mô tả).
- Trang chi tiết nhóm:
  - Tab **Tài liệu nhóm** (`visibility = GROUP`): Upload trực tiếp vào nhóm hoặc chia sẻ tài liệu đã có.
  - Tab **Thành viên**: Danh sách thành viên. Owner có thêm nút "Thêm thành viên", nút Xóa thành viên, và nút nguy hiểm **"Giải tán nhóm"** (mở `ConfirmModal`).

### 5.6 Hồ Sơ Cá Nhân (`/profile`) — `src/pages/shared/ProfilePage.jsx`

- Click Avatar để chọn ảnh mới (upload qua Multer, giới hạn 5MB).
- Form chỉnh sửa thông tin cá nhân (Tên, Số điện thoại, Ngày sinh).
- Hiển thị readonly thông tin học thuật (Khóa/Khoa/Ngành).

---

## Phase 6 — Admin Panel

> **Lý do làm sau Phase 5:** Quản trị viên sử dụng lại nhiều thành phần UI và API từ các giai đoạn trước để quản lý hệ thống.

### 6.1 Admin Dashboard (`/admin/dashboard`) — Màu chủ đạo: Đỏ (`#DC2626`)

- 4 Card tổng quan: Tổng Users, Tổng Tài liệu, Tổng Nhóm, Tổng Lượt xem.
- Hiển thị cây học thuật (`AcademicTree`).
- Bảng danh sách 10 người dùng mới đăng ký gần nhất.
- Panel kích hoạt nhanh Cron-jobs.

### 6.2 Quản lý Người Dùng (`/admin/users`)

- Bảng danh sách toàn bộ Users với phân trang server-side.
- Tìm kiếm theo tên/email, bộ lọc theo Role.

### 6.3 Quản lý Cấu Trúc Học Thuật (`/admin/academic`)

- 4 Tabs: **Khóa học (Cohorts)** | **Khoa (Faculties)** | **Ngành (Majors)** | **Môn học (Subjects)**.
- Mỗi tab có form inline thêm mới + bảng quản lý với nút Sửa / Xóa (có ConfirmModal).
- Các tab Ngành và Môn học có bộ lọc phụ thuộc theo tầng trên.

### 6.4 Bảo Trì Hệ Thống & Cron-jobs (`/admin/cron`)

- **Card 1 (Dọn Thùng rác):** Input số ngày (mặc định 15 ngày), nút "Chạy ngay" (`POST /admin/cron/trigger/trash-cleanup`). Hiển thị kết quả số file đã dọn dẹp.
- **Card 2 (Dọn Token hết hạn):** Nút "Chạy ngay" (`POST /admin/cron/trigger/token-cleanup`). Hiển thị số lượng refresh token đã được dọn.

---

## Phase 7 — Polish & Optimization

> **Lý do làm cuối:** Tối ưu hóa hiệu năng, kiểm thử giao diện và chuẩn bị build production khi toàn bộ nghiệp vụ đã hoạt động trơn tru.

### 7.1 Performance Audit

- Kiểm tra `React.lazy` + `Suspense` trên tất cả các route.
- Kiểm tra `React.memo` trên các component render trong danh sách dài (`DocumentCard`, `GroupCard`, `MemberItem`).
- Kiểm tra cấu hình TanStack Query `keepPreviousData: true` cho phân trang để tránh nhấp nháy giao diện (flicker).

### 7.2 Responsive & Accessibility (A11y) QA

- Kiểm thử kỹ lưỡng layout trên Mobile (< 768px): Sidebar tự động chuyển thành Bottom Navigation Bar, Modal hiển thị full-screen, table có horizontal scroll.
- Kiểm tra `aria-label` cho các nút icon, đảm bảo điều hướng bằng bàn phím (Tab, Enter, Escape) hoạt động tốt trên các Modal.

### 7.3 Error Boundary & Build Production

- Thêm `ErrorBoundary.jsx` bọc ngoài Router để bắt các lỗi crash React bất ngờ, hiển thị trang thông báo lỗi thân thiện.
- Kiểm tra file `.env.production` và chạy thử build: `npm run build` & `npm run preview`.
- Đảm bảo không còn `console.log` trong môi trường Production.

---

## 🚀 Bước Tiếp Theo

Sau khi bản kế hoạch này được thống nhất, chúng ta sẽ bắt đầu thực hiện ngay **Phase 1: Foundation & Infrastructure** ở phiên làm việc tiếp theo!
