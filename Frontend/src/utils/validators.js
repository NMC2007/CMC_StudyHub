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
 * Validation password: phải có tối thiểu 6 ký tự, ít nhất 1 chữ hoa, 1 số và 1 ký tự đặc biệt (đồng bộ với BE).
 * Validation code: Regex riêng biệt theo role (STUDENT / LECTURER) — superRefine.
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
  code: z
    .string()
    .min(1, 'Mã định danh không được để trống'),
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
    .min(6, 'Mật khẩu phải có tối thiểu 6 ký tự')
    .regex(/[A-Z]/, 'Mật khẩu phải có ít nhất 1 chữ cái in hoa')
    .regex(/[0-9]/, 'Mật khẩu phải có ít nhất 1 chữ số')
    .regex(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~]/, 'Mật khẩu phải có ít nhất 1 ký tự đặc biệt (VD: !@#$%^&*)'),
  confirm_password: z
    .string()
    .min(1, 'Vui lòng xác nhận lại mật khẩu'),
  role: z.enum(['STUDENT', 'LECTURER'], {
    required_error: 'Vui lòng chọn vai trò',
  }),
}).refine((data) => data.password === data.confirm_password, {
  message: 'Mật khẩu xác nhận không khớp',
  path: ['confirm_password'],
}).superRefine((data, ctx) => {
  const code = data.code?.trim() ?? '';
  const role = data.role;

  if (role === 'STUDENT') {
    // 3 chữ cái in hoa (mã ngành) + 5-7 chữ số (khóa + STT), tổng 8-10 ký tự
    if (!/^[A-Z]{3}[0-9]{5,7}$/.test(code)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['code'],
        message: 'Mã Sinh viên phải gồm đúng 3 chữ cái in hoa (mã ngành) và 5-7 chữ số phía sau (VD: BIT250052)',
      });
    }
  } else if (role === 'LECTURER') {
    // Bắt đầu bằng chữ cái in hoa, phần còn lại là chữ/số/._-, tổng 3-15 ký tự
    if (!/^[A-Z][A-Za-z0-9._-]{2,14}$/.test(code)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['code'],
        message: 'Mã Giảng viên phải bắt đầu bằng chữ in hoa, chỉ chứa chữ cái, số và ký tự ._-, độ dài 3-15 ký tự (VD: NKSon, IT_GV01)',
      });
    }
  }
});

/**
 * Schema cho Step 2 khi role = STUDENT.
 * Dùng mã code (string) theo đặc tả API Backend (api_testing_guide.md Mục 1.1).
 * Bắt buộc chọn đủ cả 3 tầng: Khóa, Khoa, Ngành.
 */
export const registerStep2StudentSchema = z.object({
  cohort_code: z.string({ required_error: 'Vui lòng chọn Khóa học' }).min(1, 'Vui lòng chọn Khóa học'),
  faculty_code: z.string({ required_error: 'Vui lòng chọn Khoa' }).min(1, 'Vui lòng chọn Khoa'),
  major_code: z.string({ required_error: 'Vui lòng chọn Ngành' }).min(1, 'Vui lòng chọn Ngành'),
});

/**
 * Schema cho Step 2 khi role = LECTURER.
 * Chỉ cần chọn Khoa (mã code).
 */
export const registerStep2LecturerSchema = z.object({
  faculty_code: z.string({ required_error: 'Vui lòng chọn Khoa' }).min(1, 'Vui lòng chọn Khoa'),
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
  subject_id: z.coerce
    .number({ required_error: 'Vui lòng chọn Môn học', invalid_type_error: 'Vui lòng chọn Môn học' })
    .min(1, 'Vui lòng chọn Môn học'),
  cohort_id: z.coerce.number({ required_error: 'Vui lòng chọn Khóa học' }).min(1, 'Vui lòng chọn Khóa học'),
  faculty_id: z.coerce.number({ required_error: 'Vui lòng chọn Khoa' }).min(1, 'Vui lòng chọn Khoa'),
  major_id: z.coerce.number({ required_error: 'Vui lòng chọn Ngành' }).min(1, 'Vui lòng chọn Ngành'),
  cohort_code: z.any().optional(),
  faculty_code: z.any().optional(),
  major_code: z.any().optional(),
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
