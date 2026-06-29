/**
 * ============================================
 * JWT FILTER - Middleware lọc & xác thực Token
 * ============================================
 * Middleware này chặn các HTTP Request đi vào các API bảo mật.
 * Nhiệm vụ:
 * - Trích xuất Token từ Header `Authorization: Bearer <token>`
 * - Gọi jwtProvider để xác minh tính hợp lệ
 * - Nếu hợp lệ: đính kèm thông tin user vào `req.user` và cho qua (`next()`)
 * - Nếu sai/hết hạn/thiếu token: chặn lại và trả HTTP 401 Unauthorized
 */

import { verifyAccessToken } from "./jwtProvider.js";
import { toAPIResponse } from "#models/dto/response/APIResponse.js";

export const jwtFilter = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        // 1. Kiểm tra header Authorization có tồn tại và đúng định dạng Bearer không
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res
                .status(401)
                .json(toAPIResponse(401, "Truy cập bị từ chối. Vui lòng cung cấp Access Token hợp lệ.", null, "No Token Provided"));
        }

        // 2. Tách lấy chuỗi token sau từ "Bearer "
        const token = authHeader.split(" ")[1];

        if (!token) {
            return res
                .status(401)
                .json(toAPIResponse(401, "Token không hợp lệ hoặc bị rỗng.", null, "Invalid Token Format"));
        }

        // 3. Giải mã token thông qua jwtProvider
        const decodedPayload = verifyAccessToken(token);

        // 4. Gán thông tin giải mã được vào request (chứa id, role, cohort_id, faculty_id, major_id,...)
        req.user = decodedPayload;

        // 5. Cho phép request đi tiếp tới Controller hoặc Middleware tiếp theo
        next();
    } catch (error) {
        // Xử lý lỗi từ jwt.verify (hết hạn, sai chữ ký, v.v.)
        const errorMessage = error.name === "TokenExpiredError" 
            ? "Access Token đã hết hạn. Vui lòng làm mới token." 
            : "Access Token không hợp lệ.";

        return res
            .status(401)
            .json(toAPIResponse(401, errorMessage, null, error.message));
    }
};
