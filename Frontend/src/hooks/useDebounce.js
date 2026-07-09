/**
 * useDebounce.js
 * Custom hook trì hoãn việc cập nhật giá trị (Debounce) cho đến khi người dùng ngừng thao tác trong một khoảng thời gian (`delay`).
 *
 * Tác dụng:
 *  - Giảm tải cho Server: Không gọi API/Query trên từng ký tự gõ vào ô tìm kiếm.
 *  - Tránh xung đột dữ liệu (Race condition) khi mạng lag: Đảm bảo request cuối cùng khớp với từ khóa cuối cùng của người dùng.
 *
 * @param {any} value - Giá trị cần debounce (ví dụ: chuỗi từ khóa tìm kiếm).
 * @param {number} delay - Thời gian chờ (milliseconds), mặc định 200ms (hoặc 300ms theo tốc độ gõ).
 * @returns {any} debounceValue - Giá trị đã được trì hoãn.
 */
import { useState, useEffect } from 'react';

export function useDebounce(value, delay = 200) {
  const [debounceValue, setDebounceValue] = useState(value);

  useEffect(() => {
    const timeout = setTimeout(() => setDebounceValue(value), delay);

    return () => {
      clearTimeout(timeout);
    };
  }, [value, delay]);

  return debounceValue;
}

export default useDebounce;
