/**
 * validators.js
 * Zod schemas tái sử dụng cho React Hook Form validation.
 *
 * Quy ước:
 *  - Mỗi schema export riêng lẻ để tree-shakeable.
 *  - Schema chỉ validate phía client — backend luôn validate lại phía server.
 *  - Thông báo lỗi viết bằng tiếng Việt cho UX tốt hơn.
 */
import { z } from 'zod';

// ─── AUTH ─────────────────────────────────────────────────────────────────────

export const loginSchema = z.object({
  identifier: z
    .string()
    .min(1, 'Vui lòng nhập email hoặc tên đăng nhập'),
  password: z
    .string()
    .min(6, 'Mật khẩu phải có ít nhất 6 ký tự'),
});

/**
 * Schema cho Step 1 của RegisterPage.
 * Validation password: phải có ít nhất 1 chữ hoa và 1 số.
 */
export const registerStep1Schema = z.object({
  full_name: z
    .string()
    .min(2, 'Họ và tên phải có ít nhất 2 ký tự')
    .max(100, 'Họ và tên không được vượt quá 100 ký tự'),
  username: z
    .string()
    .min(3, 'Tên đăng nhập phải có ít nhất 3 ký tự')
    .max(50, 'Tên đăng nhập không được vượt quá 50 ký tự')
    .regex(/^[a-zA-Z0-9_]+$/, 'Tên đăng nhập chỉ được chứa chữ cái, số và dấu gạch dưới'),
  email: z
    .string()
    .min(1, 'Vui lòng nhập email')
    .email('Email không đúng định dạng'),
  phone: z
    .string()
    .regex(/^(0|\+84)[0-9]{9}$/, 'Số điện thoại không hợp lệ (10 số, bắt đầu bằng 0)'),
  dob: z
    .string()
    .min(1, 'Vui lòng chọn ngày sinh')
    .refine((val) => {
      const date = new Date(val);
      const now = new Date();
      const age = now.getFullYear() - date.getFullYear();
      return age >= 15 && age <= 100;
    }, 'Ngày sinh không hợp lệ (tuổi phải từ 15 đến 100)'),
  password: z
    .string()
    .min(8, 'Mật khẩu phải có ít nhất 8 ký tự')
    .regex(/[A-Z]/, 'Mật khẩu phải chứa ít nhất 1 chữ hoa')
    .regex(/[0-9]/, 'Mật khẩu phải chứa ít nhất 1 chữ số'),
  role: z.enum(['STUDENT', 'LECTURER'], {
    required_error: 'Vui lòng chọn vai trò',
  }),
});

/**
 * Schema cho Step 2 khi role = STUDENT.
 * Bắt buộc chọn đủ cả 3 tầng: Khóa, Khoa, Ngành.
 */
export const registerStep2StudentSchema = z.object({
  cohort_id: z.number({ required_error: 'Vui lòng chọn Khóa học' }).min(1, 'Vui lòng chọn Khóa học'),
  faculty_id: z.number({ required_error: 'Vui lòng chọn Khoa' }).min(1, 'Vui lòng chọn Khoa'),
  major_id: z.number({ required_error: 'Vui lòng chọn Ngành' }).min(1, 'Vui lòng chọn Ngành'),
});

/**
 * Schema cho Step 2 khi role = LECTURER.
 * Chỉ cần chọn Khoa.
 */
export const registerStep2LecturerSchema = z.object({
  faculty_id: z.number({ required_error: 'Vui lòng chọn Khoa' }).min(1, 'Vui lòng chọn Khoa'),
});

// ─── DOCUMENT ─────────────────────────────────────────────────────────────────

export const uploadDocumentSchema = z.object({
  title: z
    .string()
    .min(3, 'Tiêu đề phải có ít nhất 3 ký tự')
    .max(255, 'Tiêu đề không được vượt quá 255 ký tự'),
  description: z
    .string()
    .max(1000, 'Mô tả không được vượt quá 1000 ký tự')
    .optional(),
  document_type: z.enum(
    ['DOCUMENT', 'ASSIGNMENT', 'EXAM', 'SLIDE', 'REFERENCE'],
    { required_error: 'Vui lòng chọn loại tài liệu' }
  ),
  visibility: z.enum(
    ['PUBLIC', 'PRIVATE', 'GROUP'],
    { required_error: 'Vui lòng chọn phạm vi hiển thị' }
  ),
  subject_id: z
    .number({ required_error: 'Vui lòng chọn Môn học' })
    .min(1, 'Vui lòng chọn Môn học'),
});

export const updateDocumentSchema = uploadDocumentSchema
  .omit({ subject_id: true }) // Không cho đổi môn học sau khi upload
  .partial();                  // Tất cả trường đều optional khi update

// ─── GROUP ────────────────────────────────────────────────────────────────────

export const createGroupSchema = z.object({
  name: z
    .string()
    .min(3, 'Tên nhóm phải có ít nhất 3 ký tự')
    .max(100, 'Tên nhóm không được vượt quá 100 ký tự'),
  description: z
    .string()
    .max(500, 'Mô tả không được vượt quá 500 ký tự')
    .optional(),
});

// ─── PROFILE ──────────────────────────────────────────────────────────────────

export const updateProfileSchema = z.object({
  full_name: z
    .string()
    .min(2, 'Họ và tên phải có ít nhất 2 ký tự')
    .max(100, 'Họ và tên không được vượt quá 100 ký tự')
    .optional(),
  phone: z
    .string()
    .regex(/^(0|\+84)[0-9]{9}$/, 'Số điện thoại không hợp lệ')
    .optional()
    .or(z.literal('')),
  dob: z
    .string()
    .optional(),
});
