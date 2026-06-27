<div align="center">

# 📚 StudyHub

**Nền tảng Quản lý và Chia sẻ Tài nguyên Học tập Đại học**

![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Express.js](https://img.shields.io/badge/Express.js-404D59?style=for-the-badge)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-black?style=for-the-badge&logo=JSON%20web%20tokens)

</div>

---

## 🌟 Giới thiệu Dự án

**StudyHub** là một nền tảng thư viện tri thức số tập trung được xây dựng nhằm giải quyết bài toán phân tán tài liệu học tập trong các trường đại học. Hệ thống kết nối Sinh viên và Giảng viên, cung cấp không gian chia sẻ tài liệu, slide bài giảng, đề thi và bài tập được phân loại chặt chẽ theo cấu trúc: `Khóa học ➔ Khoa ➔ Ngành học ➔ Môn học`.

## ✨ Tính năng Nổi bật

- **🔐 Phân quyền Chặt chẽ (RBAC):** Quản lý quyền truy cập linh hoạt giữa Admin, Giảng viên và Sinh viên.
- **📂 Quản lý Tài liệu Thông minh:** Upload tài liệu (PDF, DOCX, PPTX, ZIP) với dung lượng lên đến 50MB. Có cơ chế Thùng rác (Xóa mềm) và tự động dọn dẹp sau 15 ngày.
- **🔍 Tìm kiếm Nâng cao:** Bộ lọc đa tầng kết hợp từ khóa, loại tài liệu, vai trò người đăng và cấu trúc học thuật.
- **👥 Nhóm Học tập Nội bộ:** Không gian chia sẻ tài liệu an toàn, khép kín dành riêng cho các lớp học cụ thể.
- **👀 Trải nghiệm Trực quan:** Xem tài liệu trực tuyến (PDF Viewer), tương tác Like và Bookmark mượt mà.

## 🛠️ Công nghệ Sử dụng

### Frontend

- **Thư viện lõi:** ReactJS (v18+)
- **Giao diện:** Tailwind CSS
- **State Management & Fetching:** Zustand, TanStack Query (React Query)
- **HTTP Client:** Axios (Interceptors xử lý Refresh Token)

### Backend

- **Môi trường & Framework:** Node.js, ExpressJS
- **Cơ sở dữ liệu:** PostgreSQL
- **Bảo mật:** JWT Authentication (Access/Refresh Token), bcrypt
- **Xử lý tệp (File Handling):** Multer
- **Tác vụ ngầm (Cron Jobs):** node-cron

## 🚀 Hướng dẫn Cài đặt & Chạy Local

### Yêu cầu hệ thống

- [Node.js](https://nodejs.org/) (v16 trở lên)
- [PostgreSQL](https://www.postgresql.org/)

### Các bước cài đặt

**1. Clone kho lưu trữ:**

```bash
git clone https://github.com/NMC2007/StudyHub.git
cd StudyHub
```

**2. Thiết lập cơ sở dữ liệu:**

- Tạo một database mới trong PostgreSQL.
- Thực thi script SQL được cung cấp trong thư mục `database/` hoặc chạy cơ chế migration của dự án để khởi tạo các bảng.

**3. Cài đặt Backend:**

```bash
cd backend
npm install
```

- Tạo file `.env` trong thư mục `backend` và điền các biến môi trường cấu hình DB, JWT Secret, Port...
- Khởi chạy server: `npm run dev`

**4. Cài đặt Frontend:**

```bash
cd ../frontend
npm install
```

- Tạo file `.env` trong thư mục `frontend` và trỏ `VITE_API_BASE_URL` về URL của backend.
- Khởi chạy ứng dụng: `npm run dev`

## 📁 Cấu trúc Thư mục Tham khảo

```text
StudyHub/
├── backend/               # Mã nguồn ExpressJS
│   ├── controllers/       # Xử lý logic các endpoint
│   ├── middlewares/       # Auth, RBAC, Multer upload
│   ├── routes/            # Định tuyến API
│   ├── jobs/              # Các tác vụ node-cron
│   └── public/            # Thư mục lưu trữ file và avatar
├── frontend/              # Mã nguồn ReactJS
│   ├── src/
│   │   ├── api/           # Cấu hình Axios
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Các trang giao diện (Dashboard, Search...)
│   │   └── store/         # Zustand stores
└── database/              # Chứa các file Script SQL/ER Diagram
```

## 👨‍💻 Tác giả

- **Nguyễn Mạnh Cường** - _Fullstack Developer_
- GitHub: [@NMC2007](https://github.com/NMC2007)

---

_Nếu bạn thấy dự án này hữu ích, hãy để lại một ⭐️ để ủng hộ nhé!_
