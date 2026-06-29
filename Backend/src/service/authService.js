/**
 * ============================================
 * AUTH SERVICE - Tầng nghiệp vụ Authentication
 * ============================================
 * Chứa toàn bộ logic xử lý cho:
 *   - register: Đăng ký tài khoản mới
 *   - login: Đăng nhập (hỗ trợ email hoặc username)
 *   - refreshToken: Cấp lại Access Token từ Refresh Token
 *   - logout: Đăng xuất (xóa Refresh Token khỏi DB)
 *
 * Phòng thủ 2 lớp:
 *   - Lớp 1 (Service): Chủ động check trùng email/username/phone trước khi lưu
 *   - Lớp 2 (Global Error Handler): Bắt lỗi DB duplicate key 23505 nếu concurrency xảy ra
 */

import bcrypt from "bcrypt";
import {
    findUserByEmail,
    findUserByUsername,
    findUserByPhone,
    findUserById,
    createUser,
    saveRefreshToken,
    findRefreshToken,
    deleteRefreshToken,
    deleteRefreshTokensByUserId,
    findCohortByCode,
    findFacultyByCode,
    findMajorByCode,
} from "#repository/authRepository.js";
import {
    generateAccessToken,
    generateRefreshToken as generateRefresh,
    verifyRefreshToken,
    getExpirationDate,
} from "#config/security/jwtProvider.js";
import { validateRegisterRequest } from "#models/dto/request/RegisterRequestDTO.js";
import { validateLoginRequest } from "#models/dto/request/LoginRequestDTO.js";
import { toUserResponse } from "#models/dto/response/UserResponseDTO.js";

// === Số vòng hash bcrypt (salt rounds) ===
const SALT_ROUNDS = parseInt(process.env.BCRYPT_SALT_ROUNDS, 10) || 10;

// ==========================================
// 1. ĐĂNG KÝ TÀI KHOẢN MỚI
// ==========================================
/**
 * Xử lý nghiệp vụ đăng ký.
 * Luồng: Validate DTO → Check trùng → Hash password → Lưu DB → Trả UserResponse
 * @param {Object} body - Request body từ client
 * @returns {Promise<{ statusCode: number, message: string, data: Object|null, errors: string[]|null }>}
 */
export const register = async (body) => {
    // Bước 1: Validate dữ liệu đầu vào
    const validation = validateRegisterRequest(body);
    if (!validation.isValid) {
        return {
            statusCode: 400,
            message: "Dữ liệu đăng ký không hợp lệ.",
            data: null,
            errors: validation.errors,
        };
    }

    // Bước 2: Check trùng email (Lớp phòng thủ 1 — Service)
    const existingEmail = await findUserByEmail(body.email);
    if (existingEmail) {
        return {
            statusCode: 409,
            message: "Email này đã được sử dụng.",
            data: null,
            errors: ["Email đã tồn tại trong hệ thống."],
        };
    }

    // Bước 3: Check trùng username
    const existingUsername = await findUserByUsername(body.username);
    if (existingUsername) {
        return {
            statusCode: 409,
            message: "Username này đã được sử dụng.",
            data: null,
            errors: ["Username đã tồn tại trong hệ thống."],
        };
    }

    // Bước 4: Check trùng phone (nếu có)
    if (body.phone) {
        const existingPhone = await findUserByPhone(body.phone);
        if (existingPhone) {
            return {
                statusCode: 409,
                message: "Số điện thoại này đã được sử dụng.",
                data: null,
                errors: ["Số điện thoại đã tồn tại trong hệ thống."],
            };
        }
    }

    // Bước 5: Tra cứu Business Code sang Entity ID (Khóa, Khoa, Ngành)
    let cohortEntity = null;
    let facultyEntity = null;
    let majorEntity = null;

    if (body.cohort_code) {
        cohortEntity = await findCohortByCode(body.cohort_code);
        if (!cohortEntity) {
            return {
                statusCode: 400,
                message: `Mã Khóa học '${body.cohort_code}' không tồn tại trong hệ thống.`,
                data: null,
                errors: ["Invalid Cohort Code"],
            };
        }
    }

    if (body.faculty_code) {
        facultyEntity = await findFacultyByCode(body.faculty_code);
        if (!facultyEntity) {
            return {
                statusCode: 400,
                message: `Mã Khoa '${body.faculty_code}' không tồn tại trong hệ thống.`,
                data: null,
                errors: ["Invalid Faculty Code"],
            };
        }
    }

    if (body.major_code) {
        majorEntity = await findMajorByCode(body.major_code);
        if (!majorEntity) {
            return {
                statusCode: 400,
                message: `Mã Ngành '${body.major_code}' không tồn tại trong hệ thống.`,
                data: null,
                errors: ["Invalid Major Code"],
            };
        }
    }

    // Bước 6: Hash mật khẩu bằng bcrypt
    const hashedPassword = await bcrypt.hash(body.password, SALT_ROUNDS);

    // Bước 7: Chuẩn bị dữ liệu user và lưu vào DB
    const userData = {
        full_name: body.full_name,
        username: body.username,
        email: body.email,
        phone: body.phone || null,
        dob: body.dob,
        password_hash: hashedPassword,
        role: String(body.role).trim().toUpperCase(),
        cohort: cohortEntity ? { id: cohortEntity.id, code: cohortEntity.code } : null,
        faculty: facultyEntity ? { id: facultyEntity.id, code: facultyEntity.code } : null,
        major: majorEntity ? { id: majorEntity.id, code: majorEntity.code } : null,
    };

    const savedUser = await createUser(userData);

    // Bước 7: Map entity → UserResponseDTO (loại bỏ password_hash)
    return {
        statusCode: 201,
        message: "Đăng ký tài khoản thành công!",
        data: toUserResponse(savedUser),
        errors: null,
    };
};

// ==========================================
// 2. ĐĂNG NHẬP
// ==========================================
/**
 * Xử lý nghiệp vụ đăng nhập.
 * Luồng: Validate DTO → Tìm user (email/username) → So sánh password → Xóa token cũ → Tạo token mới → Trả response
 * @param {Object} body - Request body { identifier, password }
 * @returns {Promise<{ statusCode: number, message: string, data: Object|null, errors: string[]|null }>}
 */
export const login = async (body) => {
    // Bước 1: Validate dữ liệu đầu vào
    const validation = validateLoginRequest(body);
    if (!validation.isValid) {
        return {
            statusCode: 400,
            message: "Dữ liệu đăng nhập không hợp lệ.",
            data: null,
            errors: validation.errors,
        };
    }

    // Bước 2: Tìm user — tự nhận diện email hay username
    const identifier = body.identifier;
    const isEmail = identifier.includes("@");

    let user;
    if (isEmail) {
        user = await findUserByEmail(identifier);
    } else {
        user = await findUserByUsername(identifier);
    }

    if (!user) {
        return {
            statusCode: 401,
            message: "Tài khoản hoặc mật khẩu không chính xác.",
            data: null,
            errors: ["Không tìm thấy tài khoản với thông tin đã cung cấp."],
        };
    }

    // Bước 3: So sánh mật khẩu bằng bcrypt
    const isPasswordMatch = await bcrypt.compare(body.password, user.password_hash);
    if (!isPasswordMatch) {
        return {
            statusCode: 401,
            message: "Tài khoản hoặc mật khẩu không chính xác.",
            data: null,
            errors: ["Mật khẩu không đúng."],
        };
    }

    // Bước 4: Xóa refresh token cũ (Tránh tích lũy token rác trong DB)
    await deleteRefreshTokensByUserId(user.id);

    // Bước 5: Tạo Access Token (payload chứa thông tin cần thiết cho jwtFilter + rbac)
    const accessTokenPayload = {
        id: user.id,
        role: user.role,
        cohort_id: user.cohort_id || null,
        faculty_id: user.faculty_id || null,
        major_id: user.major_id || null,
    };
    const accessToken = generateAccessToken(accessTokenPayload);

    // Bước 6: Tạo Refresh Token (payload tối giản)
    const refreshTokenPayload = { id: user.id };
    const refreshToken = generateRefresh(refreshTokenPayload);

    // Bước 7: Lưu Refresh Token vào Database
    const expiresAt = getExpirationDate(7); // 7 ngày
    await saveRefreshToken(user.id, refreshToken, expiresAt);

    // Bước 8: Trả về UserResponseDTO + tokens
    return {
        statusCode: 200,
        message: "Đăng nhập thành công!",
        data: {
            user: toUserResponse(user),
            accessToken,
            refreshToken,
        },
        errors: null,
    };
};

// ==========================================
// 3. LÀM MỚI ACCESS TOKEN
// ==========================================
/**
 * Xử lý nghiệp vụ cấp lại Access Token.
 * Luồng: Kiểm tra token trong DB → Kiểm tra hạn → Verify chữ ký → Tạo AccessToken mới
 * @param {string} token - Refresh Token gửi lên từ client
 * @returns {Promise<{ statusCode: number, message: string, data: Object|null, errors: string[]|null }>}
 */
export const refreshAccessToken = async (token) => {
    // Bước 1: Kiểm tra đầu vào
    if (!token || String(token).trim() === "") {
        return {
            statusCode: 400,
            message: "Refresh Token không được để trống.",
            data: null,
            errors: ["Vui lòng cung cấp Refresh Token."],
        };
    }

    // Bước 2: Tìm token trong DB
    const storedToken = await findRefreshToken(token);
    if (!storedToken) {
        return {
            statusCode: 401,
            message: "Refresh Token không tồn tại hoặc đã bị thu hồi.",
            data: null,
            errors: ["Token không hợp lệ. Vui lòng đăng nhập lại."],
        };
    }

    // Bước 3: Kiểm tra token chưa hết hạn trong DB
    if (new Date(storedToken.expires_at) < new Date()) {
        // Token đã hết hạn — xóa khỏi DB để dọn rác
        await deleteRefreshToken(token);
        return {
            statusCode: 401,
            message: "Refresh Token đã hết hạn.",
            data: null,
            errors: ["Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại."],
        };
    }

    // Bước 4: Verify chữ ký Refresh Token bằng jwtProvider
    let decoded;
    try {
        decoded = verifyRefreshToken(token);
    } catch (error) {
        await deleteRefreshToken(token);
        return {
            statusCode: 401,
            message: "Refresh Token không hợp lệ.",
            data: null,
            errors: ["Chữ ký token không chính xác. Vui lòng đăng nhập lại."],
        };
    }

    // Bước 5: Lấy thông tin user mới nhất từ DB (đảm bảo role/thông tin chưa bị thay đổi)
    const user = await findUserById(decoded.id);
    if (!user) {
        await deleteRefreshToken(token);
        return {
            statusCode: 401,
            message: "Người dùng không tồn tại.",
            data: null,
            errors: ["Tài khoản đã bị xóa hoặc vô hiệu hóa."],
        };
    }

    // Bước 6: Tạo Access Token mới với thông tin user hiện tại
    const accessTokenPayload = {
        id: user.id,
        role: user.role,
        cohort_id: user.cohort_id || null,
        faculty_id: user.faculty_id || null,
        major_id: user.major_id || null,
    };
    const newAccessToken = generateAccessToken(accessTokenPayload);

    return {
        statusCode: 200,
        message: "Làm mới Access Token thành công!",
        data: { accessToken: newAccessToken },
        errors: null,
    };
};

// ==========================================
// 4. ĐĂNG XUẤT
// ==========================================
/**
 * Xử lý nghiệp vụ đăng xuất.
 * Luồng: Xóa Refresh Token khỏi DB → Client tự xóa AccessToken ở phía mình.
 * @param {string} token - Refresh Token gửi lên từ client
 * @returns {Promise<{ statusCode: number, message: string, data: Object|null, errors: string[]|null }>}
 */
export const logout = async (token) => {
    // Bước 1: Kiểm tra đầu vào
    if (!token || String(token).trim() === "") {
        return {
            statusCode: 400,
            message: "Refresh Token không được để trống.",
            data: null,
            errors: ["Vui lòng cung cấp Refresh Token để đăng xuất."],
        };
    }

    // Bước 2: Xóa token khỏi DB (nếu tồn tại)
    const result = await deleteRefreshToken(token);

    // Nếu không có token nào bị xóa (token đã hết hạn hoặc không tồn tại), vẫn coi là thành công
    // Vì mục đích cuối cùng là user đã không còn phiên đăng nhập hợp lệ
    return {
        statusCode: 200,
        message: "Đăng xuất thành công!",
        data: null,
        errors: null,
    };
};
