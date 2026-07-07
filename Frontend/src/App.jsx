/**
 * App.jsx — Placeholder cho Phase 1.
 *
 * Phase 2 sẽ thay thế file này bằng RouterProvider với createBrowserRouter.
 * Hiện tại dùng để xác nhận:
 *  ✅ Design system (Tailwind v4 @theme) render đúng
 *  ✅ Google Font Inter load thành công
 *  ✅ Sonner Toaster hoạt động
 *  ✅ Dev server không có lỗi compile
 */
import React from "react";
import { toast } from "sonner";
import { getThemeColorByRole, formatFileSize } from "#/utils/formatters";

function App() {
  const studentTheme = getThemeColorByRole("STUDENT");
  const lecturerTheme = getThemeColorByRole("LECTURER");
  const adminTheme = getThemeColorByRole("ADMIN");

  return (
    <div className="min-h-screen bg-surface p-8 font-sans">
      {/* Header */}
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-text-primary mb-2">
          📚 StudyHub Frontend
        </h1>
        <p className="text-text-secondary mb-8">
          Phase 1: Foundation & Infrastructure — Kiểm tra Design System
        </p>

        {/* Color Palette Check */}
        <div className="bg-card rounded-xl p-6 shadow mb-4">
          <h2 className="font-semibold text-text-primary mb-4">
            🎨 Color Tokens
          </h2>
          <div className="flex gap-3 flex-wrap">
            <div
              className="px-4 py-2 rounded-lg text-white text-sm font-medium"
              style={{ backgroundColor: studentTheme.primary }}
            >
              Student — {studentTheme.primary}
            </div>
            <div
              className="px-4 py-2 rounded-lg text-white text-sm font-medium"
              style={{ backgroundColor: lecturerTheme.primary }}
            >
              Lecturer — {lecturerTheme.primary}
            </div>
            <div
              className="px-4 py-2 rounded-lg text-white text-sm font-medium"
              style={{ backgroundColor: adminTheme.primary }}
            >
              Admin — {adminTheme.primary}
            </div>
          </div>
        </div>

        {/* Utils Check */}
        <div className="bg-card rounded-xl p-6 shadow mb-4">
          <h2 className="font-semibold text-text-primary mb-4">🔧 Utilities</h2>
          <p className="text-text-secondary text-sm">
            formatFileSize(52428800) →{" "}
            <strong>{formatFileSize(52428800)}</strong>
          </p>
          <p className="text-text-secondary text-sm mt-1">
            formatFileSize(1024) → <strong>{formatFileSize(1024)}</strong>
          </p>
        </div>

        {/* Toast Check */}
        <div className="bg-card rounded-xl p-6 shadow mb-4">
          <h2 className="font-semibold text-text-primary mb-4">
            🔔 Toast (Sonner)
          </h2>
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => toast.success("Phase 1 hoàn thành! 🎉")}
              className="px-4 py-2 rounded-lg text-white text-sm font-medium cursor-pointer"
              style={{ backgroundColor: studentTheme.primary }}
            >
              Toast Success
            </button>
            <button
              onClick={() => toast.error("Lỗi kết nối API!")}
              className="px-4 py-2 rounded-lg text-white text-sm font-medium cursor-pointer"
              style={{ backgroundColor: adminTheme.primary }}
            >
              Toast Error
            </button>
          </div>
        </div>

        <p className="text-text-muted text-xs text-center mt-8">
          Phase 2: Auth Pages sẽ thay thế trang này → Router + Login/Register
        </p>
      </div>
    </div>
  );
}

export default App;
