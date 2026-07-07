# StudyHub - Tài liệu Đặc tả Frontend (FE Specification)

> Tài liệu vibe-coding đầy đủ cho phía Frontend. Mọi AI/Dev đọc file này cần tuân thủ tuyệt đối các quy ước và đặc tả dưới đây.

---

## 1. Tech Stack & Công cụ

| Vai trò           | Thư viện / Công cụ              | Ghi chú                                |
| ----------------- | ------------------------------- | -------------------------------------- |
| Core              | ReactJS 18+ / 19                | Functional Components + Hooks          |
| Build tool        | Vite                            | Nhanh hơn CRA                          |
| Routing           | React Router DOM v8             | `createBrowserRouter`, Lazy loading    |
| Styling           | TailwindCSS v4                  | Utility-first, CSS-first `@theme`      |
| State Global      | Zustand                         | Auth session, user info                |
| Server State      | TanStack Query (React Query v5) | Cache, invalidate, optimistic update   |
| HTTP Client       | Axios                           | 1 instance duy nhất tại `src/api/`     |
| Form & Validation | React Hook Form + Zod           | Schema validation phía client          |
| Icons             | Lucide React                    | Nhất quán toàn dự án                   |
| Notifications     | Sonner                          | Toast hiện đại, nhẹ, ít boilerplate    |
| PDF Viewer        | `window.open` / Defer           | Mở tab mới xem/tải PDF (tối ưu bundle) |

---

## 2. Cấu trúc Thư mục

```
src/
├── api/                        # Axios instance + tất cả API call functions
│   ├── axiosInstance.js        # Base URL, interceptors token
│   ├── authApi.js
│   ├── documentApi.js
│   ├── groupApi.js
│   ├── academicApi.js
│   └── userApi.js
├── stores/                     # Zustand stores
│   └── useAuthStore.js         # user, accessToken, isAuthenticated, role
├── hooks/                      # Custom React hooks
│   ├── useDocuments.js         # useQuery wrappers cho document APIs
│   ├── useGroups.js
│   └── useAcademic.js
├── components/                 # Shared/Reusable UI components
│   ├── ui/                     # Atomic: Button, Input, Badge, Modal, Spinner
│   ├── layout/                 # AppLayout, Sidebar, Navbar, PageWrapper
│   ├── document/               # DocumentCard, DocumentUploadForm, TrashCard
│   ├── group/                  # GroupCard, MemberList, GroupDocumentList
│   └── academic/               # CascadeSelect, AcademicTree
├── pages/                      # Route-level page components
│   ├── auth/
│   │   ├── LoginPage.jsx
│   │   └── RegisterPage.jsx
│   ├── student/
│   │   ├── StudentDashboard.jsx
│   │   ├── DocumentsPage.jsx
│   │   ├── SearchPage.jsx
│   │   ├── FavoritesPage.jsx
│   │   ├── GroupsPage.jsx
│   │   ├── GroupDetailPage.jsx
│   │   └── ProfilePage.jsx
│   ├── lecturer/
│   │   ├── LecturerDashboard.jsx
│   │   ├── DocumentsPage.jsx   # (reuse student nếu logic giống)
│   │   ├── SearchPage.jsx
│   │   ├── FavoritesPage.jsx
│   │   ├── GroupsPage.jsx
│   │   ├── GroupDetailPage.jsx
│   │   └── ProfilePage.jsx
│   └── admin/
│       ├── AdminDashboard.jsx
│       ├── UsersPage.jsx
│       ├── AcademicPage.jsx
│       └── CronPage.jsx
├── router/
│   └── index.jsx               # Định nghĩa routes, guards
├── utils/
│   ├── formatters.js           # formatDate, formatFileSize...
│   └── validators.js           # Zod schemas tái sử dụng
└── main.jsx
```

---

## 3. Design System & Tailwind Theme (TailwindCSS v4)

### 3.1. Cấu hình Màu sắc & Typography (`src/index.css`)

TailwindCSS v4 sử dụng CSS-first configuration qua chỉ thị `@theme`, không cần file `tailwind.config.js`:

```css
@import "tailwindcss";

@theme {
  /* Font family */
  --font-sans: "Inter", sans-serif;

  /* Màu sắc theo Role */
  /* STUDENT — Xanh biển */
  --color-brand-student: #306bec;
  --color-brand-student-light: #dbeafe;
  --color-brand-student-dark: #1e40af;

  /* LECTURER — Xanh lá */
  --color-brand-lecturer: #22a853;
  --color-brand-lecturer-light: #dcfce7;
  --color-brand-lecturer-dark: #15803d;

  /* ADMIN — Đỏ */
  --color-brand-admin: #e03c3c;
  --color-brand-admin-light: #fee2e2;
  --color-brand-admin-dark: #b91c1c;

  /* Neutral — Trắng xanh nhẹ (nền tổng thể) */
  --color-surface: #f0f7ff;
  --color-card: #ffffff;
}
```

### 3.2. Cơ chế Dynamic Theme theo Role

- Giao diện Student và Lecturer dùng chung logic và component (như `DocumentsPage`, `SearchPage`, `FavoritesPage`, `GroupsPage`, `ProfilePage`).
- Màu sắc chủ đạo (sidebar, nút bấm active, badge, highlight) sẽ được đổi động (Student màu xanh biển `#2563EB`, Lecturer màu xanh lá `#16A34A`) dựa theo `role` lấy từ Zustand Store (`useAuthStore`).

### 3.3. Breakpoints chuẩn Tailwind

| Breakpoint | Min-width | Mô tả        |
| ---------- | --------- | ------------ |
| (default)  | 0px       | Mobile first |
| `sm`       | 640px     | Large phone  |
| `md`       | 768px     | Tablet       |
| `lg`       | 1024px    | Desktop      |
| `xl`       | 1280px    | Wide desktop |

---

## 4. Quản lý State

### 4.1. Zustand Auth Store (`useAuthStore.js`)

```js
// State
{
  (user, accessToken, isAuthenticated);
}

// Actions
{
  (setCredentials(user, accessToken), clearCredentials());
}
```

**Lưu ý bảo mật:**

- `accessToken` chỉ lưu trong **memory (Zustand)**, KHÔNG lưu localStorage — tránh XSS.
- `refreshToken` lưu trong **localStorage** (hoặc httpOnly cookie nếu backend hỗ trợ sau).

### 4.2. TanStack Query — Server State

- Dùng cho **mọi** thao tác fetch/mutate API.
- Cấu hình `QueryClient` với `staleTime: 60_000` (1 phút).
- **Optimistic Update** bắt buộc cho: Like, Bookmark.
- Khi mutate thành công: `queryClient.invalidateQueries` đúng key để refresh.

---

## 5. Axios Instance & Token Interceptors

```js
// src/api/axiosInstance.js
const api = axios.create({ baseURL: "http://localhost:8081/api/v1" });

// Request interceptor: tự gắn Authorization header
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Response interceptor: bắt 401 → refresh → retry
api.interceptors.response.use(null, async (error) => {
  if (error.response?.status === 401 && !error.config._retry) {
    error.config._retry = true;
    try {
      const refreshToken = localStorage.getItem("refreshToken");
      const { data } = await axios.post(".../auth/refresh", { refreshToken });
      // Lưu cả accessToken và refreshToken mới (Token Rotation)
      useAuthStore.getState().setCredentials(null, data.data.accessToken);
      localStorage.setItem("refreshToken", data.data.refreshToken);
      error.config.headers.Authorization = `Bearer ${data.data.accessToken}`;
      return api(error.config); // retry request gốc
    } catch {
      useAuthStore.getState().clearCredentials();
      localStorage.removeItem("refreshToken");
      window.location.href = "/login";
    }
  }
  return Promise.reject(error);
});
```

> **Quan trọng (Refresh Token Rotation):** Backend hiện trả về cả `accessToken` và `refreshToken` mới mỗi khi refresh. FE bắt buộc phải lưu lại `refreshToken` mới — không dùng lại token cũ.

---

## 6. Routing & Route Guards

```jsx
// src/router/index.jsx
const router = createBrowserRouter([
  // Public
  { path: "/login", element: <LoginPage />, loader: redirectIfAuth },
  { path: "/register", element: <RegisterPage />, loader: redirectIfAuth },

  // Protected — dùng layout chung
  {
    element: <ProtectedRoute />, // check isAuthenticated
    children: [
      // STUDENT routes
      { path: "/", element: <RoleBasedDashboard /> }, // render theo role
      { path: "/profile", element: <ProfilePage /> },
      { path: "/documents", element: <DocumentsPage /> },
      { path: "/favorites", element: <FavoritesPage /> },
      { path: "/search", element: <SearchPage /> },
      { path: "/groups", element: <GroupsPage /> },
      { path: "/groups/:id", element: <GroupDetailPage /> },

      // ADMIN routes — thêm RbacRoute wrapper
      {
        element: <RbacRoute allowedRoles={["ADMIN"]} />,
        children: [
          { path: "/admin/dashboard", element: <AdminDashboard /> },
          { path: "/admin/users", element: <UsersPage /> },
          { path: "/admin/academic", element: <AcademicPage /> },
          { path: "/admin/cron", element: <CronPage /> },
        ],
      },
    ],
  },
  { path: "*", element: <NotFoundPage /> },
]);
```

---

## 7. Shared Components (Atomic UI)

### 7.1. Button

```jsx
// Props: variant ('primary'|'secondary'|'danger'|'ghost'), size, loading, disabled
<Button variant="primary" size="md" loading={isPending}>
  Upload
</Button>
```

### 7.2. Input / Textarea

```jsx
// Tích hợp React Hook Form: {...register('title')}
// Hiển thị lỗi validation bên dưới field
```

### 7.3. Modal / ConfirmModal

```jsx
// ConfirmModal dùng cho: Giải tán nhóm, Xóa tài liệu
<ConfirmModal
  title="Giải tán nhóm?"
  message="Toàn bộ tài liệu nội bộ sẽ bị xóa."
  confirmLabel="Giải tán"
  variant="danger"
  onConfirm={handleDisband}
/>
```

### 7.4. DocumentCard

```jsx
// Hiển thị: thumbnail icon theo file_type, title, uploader, subject, like_count, view_count
// Actions: Like (Optimistic), Bookmark (Optimistic), menu (Edit/Delete) nếu là owner
```

### 7.5. CascadeSelect (Phân cấp học thuật)

```jsx
// Tự fetch từng bước: Cohort → Faculty (by cohort) → Major (by faculty) → Subject (by major)
// Khi reset tầng trên thì clear tầng dưới
// Dùng trong: RegisterPage, UploadForm, SearchPage
```

### 7.6. PageWrapper / AppLayout

```jsx
// AppLayout: Sidebar + TopNavbar + main content
// Sidebar màu theo role (student=blue, lecturer=green, admin=red)
// Responsive: Sidebar collapse thành bottom nav trên mobile
```

---

## 8. Trang Đăng nhập / Đăng ký

### 8.1. LoginPage (`/login`)

- Form: `identifier` (email hoặc username), `password`.
- Validation (Zod): identifier không rỗng, password >= 6 ký tự.
- Khi submit: `POST /auth/login` → lưu `accessToken` vào Zustand, `refreshToken` vào localStorage → redirect đến `/`.
- Hiển thị lỗi inline từ backend (sai mật khẩu, tài khoản không tồn tại).
- Giao diện: Card trắng giữa màn, logo StudyHub, nền gradient xanh nhẹ.

### 8.2. RegisterPage (`/register`)

- **Step 1 — Thông tin cơ bản:** `full_name`, `username`, `email`, `phone`, `dob`, `password`, `role`.
- **Step 2 — Thông tin học thuật (dynamic theo role):**
  - `STUDENT`: CascadeSelect Khóa → Khoa → Ngành (bắt buộc cả 3).
  - `LECTURER`: Chỉ chọn Khoa.
- Validation: Email đúng định dạng, phone 10 số, password chứa chữ hoa + số.
- Khi submit: `POST /auth/register` → redirect `/login` + toast thành công.

---

## 9. Dashboard theo Role

### 9.1. Student Dashboard (`/`)

**Màu chủ đạo:** Xanh biển (`brand.student`)

**Layout:** Grid 3 cột (desktop), 1 cột (mobile)

**Widgets:**

1. **Chào mừng** — Hiển thị tên, avatar, Khóa/Khoa/Ngành.
2. **Thống kê nhanh** — Cards: Tài liệu đã đăng | Lượt xem tổng | Tài liệu đã lưu | Nhóm tham gia.
3. **Tài liệu mới nhất của tôi** — List 5 tài liệu gần nhất (`GET /documents/search?visibility=PRIVATE&page=1&limit=5`).
4. **Tài liệu PUBLIC phổ biến** — List 6 tài liệu có `like_count` cao (`GET /documents/search?page=1&limit=6`).
5. **Nhóm của tôi** — List nhóm đang tham gia (`GET /groups`).
6. **Truy cập nhanh** — Nút: Upload tài liệu | Tìm kiếm | Xem Thùng rác.

### 9.2. Lecturer Dashboard (`/`)

**Màu chủ đạo:** Xanh lá (`brand.lecturer`)

**Layout:** Tương tự Student, điều chỉnh nội dung phù hợp Giảng viên.

**Widgets:**

1. **Chào mừng** — Tên, avatar, Khoa.
2. **Thống kê nhanh** — Cards: Tài liệu đã đăng | Tổng lượt xem | Tổng lượt thích | Nhóm quản lý.
3. **Tài liệu đã đăng** — List 6 tài liệu gần nhất kèm view/like count.
4. **Tài liệu phổ biến nhất của tôi** — Sắp xếp theo like_count.
5. **Nhóm đang quản lý** — Các nhóm mình là owner.
6. **Truy cập nhanh** — Upload | Quản lý tài liệu | Tìm kiếm.

### 9.3. Admin Dashboard (`/admin/dashboard`)

**Màu chủ đạo:** Đỏ (`brand.admin`)

**Layout:** Grid 4 cột trên desktop.

**Widgets:**

1. **Stats Overview** — 4 metric cards: Tổng Users | Tổng Tài liệu | Tổng Nhóm | Tổng Views.
2. **Quản lý nhanh** — Shortcut đến Users, Academic, Cron.
3. **Cây học thuật** — Collapse tree hiển thị Khóa → Khoa → Ngành → số môn.
4. **Danh sách Users gần đây** — Table 10 users mới đăng ký nhất.
5. **Cron Triggers** — Panel 2 nút: "Chạy dọn rác" + "Dọn token hết hạn" với input days.

---

## 10. Trang Quản lý Tài liệu (`/documents`)

### Tabs:

- **Tab 1: Tài liệu của tôi** — Grid DocumentCard. Filter theo visibility, type.
- **Tab 2: Thùng rác** — Grid TrashCard (hiển thị `deleted_at`, cảnh báo "Xóa vĩnh viễn sau 15 ngày"). Nút: Khôi phục.

### Upload Form (Modal hoặc Drawer):

```
Fields:
- file       : Drag & drop hoặc click chọn. Kiểm tra: ≤50MB, .pdf/.docx/.pptx/.zip
- title      : Bắt buộc
- description: Không bắt buộc
- document_type: Select (DOCUMENT/ASSIGNMENT/EXAM/SLIDE/REFERENCE)
- visibility : Select (PUBLIC/PRIVATE/GROUP)
- CascadeSelect: subject_id (và cohort/faculty/major với STUDENT — auto-fill từ profile)
```

**STUDENT Upload Guard (FE):**

- `cohort_id`, `faculty_id`, `major_id` được auto-fill từ Zustand store, **không cho chỉnh sửa**.
- Chỉ hiển thị môn học thuộc `major_id` của sinh viên (filter phía FE).

---

## 11. Trang Tìm kiếm (`/search`)

### Layout:

- **Desktop:** Sidebar filter bên trái (300px) + grid kết quả bên phải.
- **Mobile:** Bộ lọc thu gọn vào bottom sheet / accordion.

### Sidebar Filter:

1. **Từ khóa:** Input `q` (debounce 400ms).
2. **Người đăng:** Input `uploader` (tên/username).
3. **Vai trò:** Radio: Tất cả | Giảng viên | Sinh viên.
4. **Loại tài liệu:** Checkbox group.
5. **CascadeSelect học thuật:** Cohort → Faculty → Major → Subject.
6. Nút: Tìm kiếm | Reset bộ lọc.

### Kết quả:

- Grid DocumentCard với pagination.
- Hiển thị tổng số kết quả, skeleton loading khi fetch.
- Empty state khi không có kết quả.

---

## 12. Trang Yêu thích (`/favorites`)

### Tabs:

- **Đã lưu (Bookmarks):** `GET /documents/bookmarks` — Grid DocumentCard.
- **Đã thích (Likes):** `GET /documents/likes` — Grid DocumentCard.

Khi bỏ bookmark/like từ trang này: Optimistic update xóa item khỏi list ngay.

---

## 13. Trang Nhóm học tập (`/groups`)

### Danh sách nhóm:

- `GET /groups` — Grid GroupCard (name, mô tả, số thành viên, role trong nhóm).
- Nút: Tạo nhóm mới (Modal form: name, description).

### Chi tiết nhóm (`/groups/:id`):

**Tabs:**

1. **Tài liệu nhóm** — Grid DocumentCard (chỉ tài liệu `visibility=GROUP`).
   - Nút: Upload vào nhóm | Chia sẻ tài liệu có sẵn.
2. **Thành viên** — List avatar + tên. Owner thấy nút "Xóa" bên cạnh mỗi thành viên.

**Owner only:**

- Nút "Thêm thành viên" (Modal: nhập user_ids).
- Nút nguy hiểm "Giải tán nhóm" → ConfirmModal → `DELETE /groups/:id`.

---

## 14. Trang Hồ sơ (`/profile`)

### Sections:

1. **Avatar** — Click để upload ảnh mới. Validate: ≤5MB, .jpg/.png/.webp. `PUT /users/avatar`.
2. **Thông tin cá nhân** — Form inline edit: `full_name`, `phone`, `dob`. `PUT /users/profile`.
3. **Thông tin học thuật** — Readonly: Khóa / Khoa / Ngành (không cho sửa).
4. **Bảo mật** — Placeholder cho tính năng đổi mật khẩu (tương lai).

---

## 15. Admin — Quản lý Người dùng (`/admin/users`)

- `GET /users` — Table đầy đủ: Avatar, Tên, Email, Role, Khóa/Khoa/Ngành, Ngày tạo.
- Filter: theo Role, search theo tên/email.
- Pagination server-side.
- (Tính năng tương lai: Khóa/Mở tài khoản).

---

## 16. Admin — Quản lý Học thuật (`/admin/academic`)

### Layout: 4 tab Accordion hoặc Tab panel

**Tab Khóa học (Cohorts):**

- Table: code, name, start_year, end_year. Nút Thêm/Sửa/Xóa.
- `POST/PUT /academic/cohorts`, `DELETE /academic/cohorts/:id`.

**Tab Khoa (Faculties):**

- `POST/PUT /academic/faculties`, `DELETE /academic/faculties/:id`.

**Tab Ngành (Majors):**

- Filter theo faculty_code trước. `POST/PUT /academic/majors`.

**Tab Môn học (Subjects):**

- Filter theo major_code trước. Môn học có thể thuộc nhiều ngành (`major_codes: []`).

Mỗi tab có inline form thêm mới + table quản lý. Confirm trước khi xóa.

---

## 17. Admin — Bảo trì Cron (`/admin/cron`)

- **Card 1: Dọn Thùng rác**
  - Input: số ngày (mặc định 15). Nút "Chạy ngay".
  - `POST /admin/cron/trigger/trash-cleanup` với body `{ days }`.
  - Hiển thị kết quả (số file đã xóa) sau khi chạy.
- **Card 2: Dọn Refresh Token**
  - Nút "Chạy ngay". `POST /admin/cron/trigger/token-cleanup`.
  - Hiển thị số token đã dọn.

---

## 18. Tích hợp API — Quy ước

### 18.1. Tất cả API functions đặt trong `src/api/`

```js
// documentApi.js
export const searchDocuments = (params) =>
  api.get("/documents/search", { params });
export const getDocumentById = (id) => api.get(`/documents/${id}`);
export const uploadDocument = (formData) =>
  api.post("/documents/upload", formData);
export const updateDocument = (id, body) => api.put(`/documents/${id}`, body);
export const softDeleteDocument = (id) => api.delete(`/documents/${id}`);
export const restoreDocument = (id) => api.post(`/documents/${id}/restore`);
export const toggleLike = (id) => api.post(`/documents/${id}/like`);
export const toggleBookmark = (id) => api.post(`/documents/${id}/bookmark`);
export const getTrash = (params) => api.get("/documents/trash", { params });
export const getLikes = (params) => api.get("/documents/likes", { params });
export const getBookmarks = (params) =>
  api.get("/documents/bookmarks", { params });
```

### 18.2. Custom hooks dùng TanStack Query

```js
// hooks/useDocuments.js
export const useSearchDocuments = (params) =>
  useQuery({
    queryKey: ["documents", "search", params],
    queryFn: () => searchDocuments(params),
  });

export const useToggleLike = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => toggleLike(id),
    // Optimistic update: flip is_liked ngay, rollback nếu lỗi
    onMutate: async (id) => {
      /* ... */
    },
    onError: (err, id, context) => {
      /* rollback */
    },
    onSettled: () => qc.invalidateQueries({ queryKey: ["documents"] }),
  });
};
```

### 18.3. Response shape từ Backend

```json
{
  "statusCode": 200,
  "message": "...",
  "data": { ... },
  "errors": null
}
```

FE luôn truy cập `response.data.data` để lấy dữ liệu thực tế.

---

## 19. Performance & Best Practices

| Kỹ thuật                  | Áp dụng tại                         |
| ------------------------- | ----------------------------------- |
| `React.lazy` + `Suspense` | Tất cả page-level components        |
| `React.memo`              | DocumentCard, GroupCard, MemberItem |
| `useCallback`             | Handlers trong danh sách dài        |
| `useMemo`                 | Filter/sort phức tạp phía client    |
| Debounce (400ms)          | Search input, filter input          |
| Skeleton loading          | DocumentCard, table rows            |
| Image lazy loading        | Avatar, document thumbnails         |
| Optimistic updates        | Like, Bookmark                      |
| `keepPreviousData: true`  | Pagination (tránh flicker)          |
| Code splitting            | Router-level lazy import            |

---

## 20. Error Handling & UX States

| State               | UI                                              |
| ------------------- | ----------------------------------------------- |
| Loading             | Skeleton hoặc Spinner                           |
| Empty               | Illustration + message + CTA                    |
| Error               | Alert đỏ + nút Thử lại                          |
| Success mutation    | Toast green (`sonner` toast.success)            |
| Error mutation      | Toast red (`sonner` toast.error) với message    |
| 403 Forbidden       | Redirect về `/` + toast cảnh báo                |
| 401 Unauthenticated | Auto-refresh → nếu thất bại → redirect `/login` |
| 404 Not Found       | Trang 404 có link quay lại                      |

---

## 21. Quy ước Code

1. **Tên file:** PascalCase cho component (`DocumentCard.jsx`), camelCase cho utils/hooks (`useDocuments.js`).
2. **Component đơn trách nhiệm:** Mỗi component chỉ làm 1 việc. Nếu JSX > 150 dòng → tách nhỏ.
3. **Không prop drilling > 2 cấp:** Dùng Zustand hoặc React Context.
4. **Conventional Commits:** `feat:`, `fix:`, `refactor:`, `style:`, `chore:`.
5. **Tailwind class order:** Layout → Spacing → Color → Typography → Effects (dùng `prettier-plugin-tailwindcss`).
6. **Không hardcode URL:** Mọi endpoint khai báo trong `src/api/`.
7. **Accessibility:** Luôn có `aria-label` cho icon button, `alt` cho img.
8. **Form reset sau submit thành công:** `reset()` từ React Hook Form.
9. **Không `console.log` trong production:** Dùng biến `import.meta.env.DEV` để guard.

---

## 22. Checklist trước khi vibe-code một trang mới

- [ ] Xác định role nào được truy cập trang này?
- [ ] API endpoints cần gọi là gì? (Xem mục 18)
- [ ] State global nào cần từ Zustand?
- [ ] Cần TanStack Query key nào? Invalidate gì sau mutation?
- [ ] Responsive: Mobile → Tablet → Desktop layout ra sao?
- [ ] Skeleton/Empty/Error state đã có chưa?
- [ ] Có cần Optimistic Update không?
- [ ] Component nào có thể tái sử dụng từ `src/components/`?
