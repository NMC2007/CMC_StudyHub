/**
 * FileDropzone.jsx
 * Component vùng kéo thả upload tài liệu & chọn file nguyên tử.
 *
 * Tính năng:
 *  - Hỗ trợ Kéo thả file (Drag & Drop) hoặc click chọn file qua hộp thoại hệ thống.
 *  - Validate client-side tức thì:
 *     1. Kiểm tra định dạng đuôi file (Mặc định: .pdf, .docx, .pptx, .zip).
 *     2. Kiểm tra dung lượng tối đa (Mặc định: ≤ 50MB).
 *  - Hiển thị preview icon trực quan theo loại file, tên file và dung lượng đã format (KB/MB).
 *  - Nút xóa nhanh file đã chọn (`X`).
 */
import React, { useState, useRef } from 'react';
import {
  UploadCloud,
  FileText,
  FileSpreadsheet,
  FileArchive,
  File as FileIcon,
  X,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { formatFileSize } from '#/utils/formatters';

const DEFAULT_ACCEPTED_EXTENSIONS = ['.pdf', '.docx', '.pptx', '.zip'];
const DEFAULT_MAX_SIZE_MB = 50;

const FileDropzone = ({
  label = 'Chọn file tài liệu',
  helperText = 'Hỗ trợ định dạng .PDF, .DOCX, .PPTX, .ZIP (Tối đa 50MB)',
  accept = DEFAULT_ACCEPTED_EXTENSIONS,
  maxSizeMB = DEFAULT_MAX_SIZE_MB,
  onFileSelect,
  selectedFile = null,
  error: externalError,
  disabled = false,
  className = '',
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [internalError, setInternalError] = useState('');
  const fileInputRef = useRef(null);

  const errorMessage = externalError || internalError;

  // Lấy icon theo phần mở rộng của file
  const getFileIcon = (fileName = '') => {
    const ext = fileName.slice(fileName.lastIndexOf('.')).toLowerCase();
    switch (ext) {
      case '.pdf':
      case '.docx':
      case '.doc':
        return <FileText className="w-8 h-8 text-blue-600 shrink-0" />;
      case '.pptx':
      case '.ppt':
      case '.xlsx':
        return <FileSpreadsheet className="w-8 h-8 text-emerald-600 shrink-0" />;
      case '.zip':
      case '.rar':
        return <FileArchive className="w-8 h-8 text-amber-600 shrink-0" />;
      default:
        return <FileIcon className="w-8 h-8 text-slate-500 shrink-0" />;
    }
  };

  // Validate File (Định dạng & Dung lượng)
  const validateFile = (file) => {
    setInternalError('');

    if (!file) return false;

    // 1. Kiểm tra định dạng đuôi file
    const fileName = file.name.toLowerCase();
    const isAcceptedExt = accept.some((ext) => fileName.endsWith(ext.toLowerCase()));
    if (!isAcceptedExt) {
      const err = `Định dạng file không hợp lệ. Chỉ chấp nhận: ${accept.join(', ')}`;
      setInternalError(err);
      if (onFileSelect) onFileSelect(null);
      return false;
    }

    // 2. Kiểm tra dung lượng
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      const err = `Dung lượng file vượt quá giới hạn cho phép (${maxSizeMB}MB).`;
      setInternalError(err);
      if (onFileSelect) onFileSelect(null);
      return false;
    }

    return true;
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0] || null;
    if (file && validateFile(file)) {
      if (onFileSelect) onFileSelect(file);
    } else if (!file) {
      setInternalError('');
      if (onFileSelect) onFileSelect(null);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled && !isDragging) setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (isDragging) setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (disabled) return;

    const file = e.dataTransfer.files?.[0] || null;
    if (file && validateFile(file)) {
      if (onFileSelect) onFileSelect(file);
    }
  };

  const handleRemoveFile = (e) => {
    e.stopPropagation();
    setInternalError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    if (onFileSelect) onFileSelect(null);
  };

  return (
    <div className={`w-full flex flex-col gap-1.5 ${className}`.trim()}>
      {/* Label */}
      {label && (
        <span className="text-xs font-semibold text-slate-700 select-none">
          {label}
        </span>
      )}

      {/* Box Drag & Drop */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !disabled && fileInputRef.current?.click()}
        className={`relative w-full p-6 rounded-2xl border-2 border-dashed transition-all duration-200 cursor-pointer flex flex-col items-center justify-center text-center select-none ${
          disabled
            ? 'bg-slate-100 border-slate-200 cursor-not-allowed opacity-60'
            : isDragging
              ? 'bg-brand-student-light/60 border-brand-student scale-[0.99]'
              : errorMessage
                ? 'bg-red-50/40 border-red-400 hover:bg-red-50/70'
                : selectedFile
                  ? 'bg-emerald-50/40 border-emerald-400 hover:bg-emerald-50/70'
                  : 'bg-slate-50/60 border-slate-300 hover:border-slate-400 hover:bg-slate-50'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept.join(',')}
          onChange={handleFileChange}
          disabled={disabled}
          className="hidden"
        />

        {selectedFile ? (
          /* Trạng thái đã chọn file */
          <div className="flex items-center justify-between w-full p-3 bg-white rounded-xl shadow-sm border border-slate-100 gap-3">
            <div className="flex items-center gap-3 min-w-0 flex-1 text-left">
              {getFileIcon(selectedFile.name)}
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-slate-800 truncate">
                  {selectedFile.name}
                </p>
                <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-0.5">
                  <span>{formatFileSize(selectedFile.size)}</span>
                  <span>•</span>
                  <span className="text-emerald-600 font-medium flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 inline" /> Đã kiểm tra hợp lệ
                  </span>
                </div>
              </div>
            </div>

            {/* Remove file button */}
            {!disabled && (
              <button
                type="button"
                onClick={handleRemoveFile}
                className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer shrink-0"
                aria-label="Xóa file đã chọn"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        ) : (
          /* Trạng thái chờ chọn file */
          <div className="flex flex-col items-center justify-center py-2">
            <div className="w-12 h-12 rounded-2xl bg-white shadow-sm border border-slate-100 flex items-center justify-center text-brand-student mb-3">
              <UploadCloud className="w-6 h-6 animate-bounce duration-1000" />
            </div>
            <p className="text-sm font-semibold text-slate-800">
              Kéo thả file vào đây, hoặc <span className="text-brand-student underline">nhấn để chọn</span>
            </p>
            <p className="text-xs text-slate-500 mt-1 max-w-xs">{helperText}</p>
          </div>
        )}
      </div>

      {/* Thông báo lỗi */}
      {errorMessage ? (
        <p className="text-xs text-red-500 font-medium flex items-center gap-1 mt-0.5 animate-fadeIn">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>{errorMessage}</span>
        </p>
      ) : null}
    </div>
  );
};

export default React.memo(FileDropzone);
