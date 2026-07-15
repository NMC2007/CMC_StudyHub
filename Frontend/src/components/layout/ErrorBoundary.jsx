/**
 * ErrorBoundary.jsx
 * Component Class bẫy lỗi toàn cục (Global Error Boundary) theo chuẩn React.
 *
 * Tính năng:
 *  - Bắt các runtime exceptions từ cây component con (`getDerivedStateFromError` & `componentDidCatch`).
 *  - Ngăn ngừa hiện tượng crash trắng màn hình (White Screen of Death).
 *  - Hiển thị UI Card báo lỗi trực quan theo Design System (chứa icon cảnh báo, thông điệp thân thiện).
 *  - Hiển thị chi tiết stack trace khi ở môi trường DEV (`import.meta.env.DEV`).
 *  - Cung cấp nút "Thử lại ngay (Reload)" và "Quay về Trang chủ".
 */
import React from 'react';
import { AlertTriangle, RefreshCw, Home, ShieldAlert } from 'lucide-react';
import Button from '#/components/ui/Button';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error) {
    // Cập nhật state để lần render tiếp theo hiển thị UI fallback
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });

    // Chỉ log chi tiết ra console khi ở môi trường phát triển (DEV)
    if (import.meta.env.DEV) {
      console.error('🛑 [Global ErrorBoundary] Caught an exception:', error, errorInfo);
    }
  }

  handleReload = () => {
    // Làm mới trang để khôi phục trạng thái ban đầu của ứng dụng
    window.location.reload();
  };

  handleGoHome = () => {
    // Reset lỗi trong state và chuyển hướng về trang chủ
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      const isDev = import.meta.env.DEV;
      const errorMessage =
        this.state.error?.message ||
        this.state.error?.toString() ||
        'Đã xảy ra lỗi không xác định trong quá trình xử lý giao diện.';

      return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-slate-200 flex items-center justify-center p-4 md:p-6 font-sans">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 md:p-8 border border-slate-200/80 shadow-xl text-center relative overflow-hidden animate-in fade-in zoom-in-95 duration-300">
            {/* Top accent line */}
            <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-red-500 via-amber-500 to-red-600" />

            {/* Warning Icon Badge */}
            <div className="w-20 h-20 rounded-2xl bg-red-50 text-red-600 border border-red-100 flex items-center justify-center mx-auto mb-6 shadow-sm">
              <AlertTriangle className="w-10 h-10 animate-bounce" />
            </div>

            {/* Title & Subtitle */}
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-800 tracking-tight mb-2">
              Rất tiếc, đã xảy ra sự cố!
            </h1>
            <p className="text-sm md:text-base text-slate-500 mb-6 max-w-md mx-auto leading-relaxed">
              Hệ thống StudyHub gặp lỗi không mong muốn khi hiển thị nội dung này. Bạn có thể làm mới trang hoặc quay lại trang chủ để tiếp tục.
            </p>

            {/* Error Details Box (luôn hiện tóm tắt ngắn gọn hoặc chi tiết khi DEV) */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 mb-6 text-left overflow-hidden">
              <div className="flex items-center gap-2 text-xs font-bold text-red-600 uppercase tracking-wider mb-1.5">
                <ShieldAlert className="w-4 h-4 shrink-0" />
                <span>Chi tiết thông báo lỗi:</span>
              </div>
              <p className="text-xs md:text-sm font-mono text-slate-700 font-medium break-words bg-white p-2.5 rounded-xl border border-slate-200/60">
                {errorMessage}
              </p>

              {/* Stack trace chỉ hiện trên DEV */}
              {isDev && this.state.errorInfo?.componentStack && (
                <details className="mt-3 text-[11px] font-mono text-slate-500 cursor-pointer">
                  <summary className="font-bold text-slate-600 hover:text-slate-800">
                    Xem Component Stack Trace (chỉ DEV)
                  </summary>
                  <pre className="mt-2 p-2 bg-slate-100 rounded-lg overflow-x-auto max-h-48 text-[10px] leading-relaxed text-slate-600">
                    {this.state.errorInfo.componentStack.trim()}
                  </pre>
                </details>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Button
                variant="secondary"
                icon={Home}
                onClick={this.handleGoHome}
                className="w-full sm:w-auto px-6 py-2.5 font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200/80"
              >
                Quay về Trang chủ
              </Button>
              <Button
                variant="primary"
                icon={RefreshCw}
                onClick={this.handleReload}
                className="w-full sm:w-auto px-6 py-2.5 font-semibold bg-red-600 hover:bg-red-700 text-white shadow-md shadow-red-600/20"
              >
                Thử lại ngay
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
