/**
 * ============================================
 * RBAC MIDDLEWARE - Kiểm soát quyền truy cập
 * ============================================
 * Middleware này chạy sau `jwtFilter`, nhận vào danh sách các Role được phép truy cập.
 * Nhiệm vụ:
 * - Kiểm tra xem `req.user.role` có thuộc danh sách Role cho phép hay không
 * - Nếu có: cho qua (`next()`)
 * - Nếu không: trả về HTTP 403 Forbidden
 */

import { toAPIResponse } from "#models/dto/response/APIResponse.js";

/**
 * Factory function tạo RBAC Middleware.
 * Sử dụng: router.delete("/users/:id", jwtFilter, rbac("ADMIN"), deleteUser)
 * @param  {...string} allowedRoles - Danh sách các quyền được phép (vd: "ADMIN", "LECTURER")
 * @returns {Function} Express Middleware
 */
export const rbac = (...allowedRoles) => {
    return (req, res, next) => {
        try {
            // 1. Kiểm tra xem user đã được xác thực qua jwtFilter chưa
            if (!req.user || !req.user.role) {
                return res
                    .status(401)
                    .json(toAPIResponse(401, "Người dùng chưa được xác thực hoặc thông tin quyền bị thiếu.", null, "Unauthenticated User"));
            }

            // 2. Kiểm tra quyền của user có nằm trong danh sách cho phép không
            if (!allowedRoles.includes(req.user.role)) {
                return res
                    .status(403)
                    .json(
                        toAPIResponse(
                            403,
                            `Bạn không đủ quyền (Yêu cầu quyền: ${allowedRoles.join(" hoặc ")}).`,
                            null,
                            "Permission Denied - Insufficient Role"
                        )
                    );
            }

            // 3. Nếu đủ quyền, cho đi tiếp
            next();
        } catch (error) {
            return res
                .status(500)
                .json(toAPIResponse(500, "Lỗi kiểm tra quyền truy cập.", null, error.message));
        }
    };
};
