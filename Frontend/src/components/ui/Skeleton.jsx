/**
 * Skeleton.jsx
 * Component hiệu ứng Shimmer loading (khung chờ tải dữ liệu) nguyên tử.
 *
 * Tính năng:
 *  - Hỗ trợ các variant: `rect` (mặc định cho card/box), `circle` (avatar), `text` (dòng chữ), `card` (trọn bộ khung card tài liệu).
 *  - Sử dụng animation pulse mượt mà chuẩn TailwindCSS.
 */
import React from 'react';

const Skeleton = ({
  variant = 'rect',
  className = '',
  width,
  height,
  style = {},
  ...restProps
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'circle':
        return 'rounded-full aspect-square w-10 h-10';
      case 'text':
        return 'rounded-md h-4 w-3/4';
      case 'card':
        return 'rounded-2xl h-56 w-full';
      case 'rect':
      default:
        return 'rounded-xl w-full h-20';
    }
  };

  return (
    <div
      className={`animate-pulse bg-slate-200/80 ${getVariantStyles()} ${className}`.trim()}
      style={{
        ...(width ? { width } : {}),
        ...(height ? { height } : {}),
        ...style,
      }}
      aria-hidden="true"
      {...restProps}
    />
  );
};

export default React.memo(Skeleton);
