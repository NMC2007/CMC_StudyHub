/**
 * PageLoader.jsx
 * Component hiển thị màn hình tải trang toàn màn hình (Full-screen Loading Spinner).
 *
 * Sử dụng làm `fallback` cho `<Suspense>` khi tải động (Lazy Loading) các trang lớn
 * như LoginPage, RegisterPage, hoặc lần tải ban đầu của Router.
 */
import React from 'react';

export default function PageLoader({ message = 'Đang tải trang...' }) {
  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-4">
      <div className="flex flex-col items-center gap-3 text-center animate-in fade-in duration-200">
        <div className="w-9 h-9 border-4 border-brand-student border-t-transparent rounded-full animate-spin shadow-xs" />
        <p className="text-sm text-text-secondary font-medium tracking-tight">
          {message}
        </p>
      </div>
    </div>
  );
}
