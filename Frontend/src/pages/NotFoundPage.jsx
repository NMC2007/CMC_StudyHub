/**
 * NotFoundPage.jsx
 * Trang 404 — Hiển thị khi người dùng truy cập URL không tồn tại.
 *
 * Giao diện thân thiện với minh họa, thông báo lỗi và nút quay lại trang chủ.
 * Tuân thủ STUDYHUB_FE.md mục 20: Error Handling & UX States.
 */
import { useNavigate } from "react-router";
import { Home, ArrowLeft } from "lucide-react";
import Button from "#/components/ui/Button";

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-6">
      <div className="text-center max-w-md">
        {/* Illustration */}
        <div className="mb-8 select-none">
          <div className="text-[120px] font-bold leading-none bg-gradient-to-br from-brand-student via-brand-student-dark to-brand-student bg-clip-text text-transparent">
            404
          </div>
          <div className="w-24 h-1 mx-auto mt-2 rounded-full bg-gradient-to-r from-brand-student to-brand-student-dark" />
        </div>

        {/* Message */}
        <h1 className="text-2xl font-bold text-text-primary mb-2">
          Trang không tồn tại
        </h1>
        <p className="text-text-secondary mb-8 leading-relaxed">
          Trang bạn đang tìm kiếm có thể đã bị xóa, đổi tên hoặc tạm thời không
          khả dụng. Hãy quay lại trang chủ để tiếp tục.
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button
            icon={ArrowLeft}
            variant="secondary"
            onClick={() => navigate(-1)}
            aria-label="Quay lại trang trước"
          >
            Quay lại
          </Button>
          <Button
            icon={Home}
            onClick={() => navigate("/")}
            aria-label="Về trang chủ"
          >
            Về trang chủ
          </Button>
        </div>
      </div>
    </div>
  );
}
