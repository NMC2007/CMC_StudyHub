/**
 * ============================================
 * GLOBAL ERROR HANDLER - Bắt lỗi tập trung
 * ============================================
 * Middleware Express 4 tham số (err, req, res, next).
 * Đặt ở cuối chuỗi middleware trong server.js.
 *
 * Nhiệm vụ:
 *   - Bắt tất cả lỗi không được xử lý ở Controller/Service
 *   - Parse lỗi theo loại (DB duplicate, Multer, JSON syntax, v.v.)
 *   - Trả về response chuẩn APIResponse
 *   - Ngăn server bị crash
 *
 * Tái sử dụng: Mọi tính năng phát triển sau này đều được bảo vệ
 * bởi middleware này mà không cần viết thêm try-catch boilerplate.
 */

import { toAPIResponse } from "#models/dto/response/APIResponse.js";

/**
 * Global Error Handler Middleware.
 * @param {Error} err - Đối tượng lỗi được ném ra (throw) hoặc đẩy qua next(error)
 * @param {Object} req - Express Request
 * @param {Object} res - Express Response
 * @param {Function} next - Express Next (bắt buộc khai báo đủ 4 tham số để Express nhận diện đây là error handler)
 */
export const errorHandler = (err, req, res, next) => {
    // === Log lỗi ra console để debug (chỉ ở môi trường dev) ===
    console.error("🔴 [Global Error Handler]:", err);

    // ==========================================
    // 1. LỖI DUPLICATE KEY — PostgreSQL mã 23505
    // ==========================================
    // Xảy ra khi 2 request đồng thời (concurrency) cùng tạo user
    // với email/username/phone giống nhau, vượt qua check ở Service.
    if (err.code === "23505" || err.driverError?.code === "23505") {
        const detail = err.detail || err.driverError?.detail || "";
        let friendlyMessage = "Dữ liệu bị trùng lặp.";

        // Parse thông tin chi tiết từ PostgreSQL để trả message thân thiện
        if (detail.includes("email")) {
            friendlyMessage = "Email này đã được sử dụng.";
        } else if (detail.includes("username")) {
            friendlyMessage = "Username này đã được sử dụng.";
        } else if (detail.includes("phone")) {
            friendlyMessage = "Số điện thoại này đã được sử dụng.";
        }

        return res
            .status(409)
            .json(toAPIResponse(409, friendlyMessage, null, "Duplicate Key Violation"));
    }

    // ==========================================
    // 2. LỖI FOREIGN KEY — PostgreSQL mã 23503
    // ==========================================
    // Xảy ra khi tham chiếu tới record không tồn tại
    // (VD: cohort_id, faculty_id, major_id không có trong DB)
    if (err.code === "23503" || err.driverError?.code === "23503") {
        return res
            .status(400)
            .json(toAPIResponse(400, "Dữ liệu tham chiếu không tồn tại (Khóa, Khoa, hoặc Ngành không hợp lệ).", null, "Foreign Key Violation"));
    }

    // ==========================================
    // 3. LỖI MULTER — File upload
    // ==========================================
    if (err.name === "MulterError") {
        let message = "Lỗi tải file.";
        if (err.code === "LIMIT_FILE_SIZE") {
            message = "Dung lượng file vượt quá giới hạn cho phép.";
        } else if (err.code === "LIMIT_UNEXPECTED_FILE") {
            message = "Trường file không đúng tên hoặc số lượng file vượt quá giới hạn.";
        }
        return res
            .status(400)
            .json(toAPIResponse(400, message, null, err.message));
    }

    // Lỗi file filter tùy chỉnh từ uploadMiddleware (cb(new Error(...)))
    if (err.message && (err.message.includes("Định dạng file") || err.message.includes("Định dạng ảnh"))) {
        return res
            .status(400)
            .json(toAPIResponse(400, err.message, null, "Invalid File Type"));
    }

    // ==========================================
    // 4. LỖI JSON SYNTAX — Body request không hợp lệ
    // ==========================================
    if (err.type === "entity.parse.failed") {
        return res
            .status(400)
            .json(toAPIResponse(400, "Body request không đúng định dạng JSON.", null, "JSON Parse Error"));
    }

    // ==========================================
    // 5. LỖI KHÔNG XÁC ĐỊNH — Fallback cuối cùng
    // ==========================================
    const statusCode = err.statusCode || 500;
    const message = err.message || "Lỗi hệ thống. Vui lòng thử lại sau.";

    return res
        .status(statusCode)
        .json(toAPIResponse(statusCode, message, null, "Internal Server Error"));
};
