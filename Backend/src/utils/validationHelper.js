/**
 * ============================================
 * VALIDATION HELPER - Hàm kiểm tra dữ liệu tái sử dụng
 * ============================================
 * Tập hợp các hàm validate thuần túy (pure functions).
 * Mỗi hàm trả về object { isValid: boolean, message: string }.
 * Được sử dụng bởi các DTO (RegisterRequestDTO, LoginRequestDTO, v.v.)
 * và có thể tái sử dụng cho UpdateProfileDTO, ChangePasswordDTO trong tương lai.
 */

/**
 * Kiểm tra giá trị không rỗng / null / undefined.
 * @param {*} value - Giá trị cần kiểm tra
 * @param {string} fieldName - Tên trường (dùng cho thông báo lỗi)
 * @returns {{ isValid: boolean, message: string }}
 */
export const validateRequired = (value, fieldName) => {
    if (value === null || value === undefined || String(value).trim() === "") {
        return { isValid: false, message: `${fieldName} không được để trống.` };
    }
    return { isValid: true, message: "" };
};

/**
 * Kiểm tra format email hợp lệ.
 * Regex: cho phép chữ cái, số, dấu chấm, gạch dưới, gạch ngang trước @.
 * @param {string} email
 * @returns {{ isValid: boolean, message: string }}
 */
export const validateEmail = (email) => {
    if (!email || String(email).trim() === "") {
        return { isValid: false, message: "Email không được để trống." };
    }
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(String(email).trim())) {
        return { isValid: false, message: "Email không đúng định dạng (VD: user@example.com)." };
    }
    return { isValid: true, message: "" };
};

/**
 * Kiểm tra username hợp lệ:
 * - Không dấu tiếng Việt
 * - Không chữ in hoa
 * - Không khoảng trắng
 * - Chỉ cho phép: a-z, 0-9, dấu gạch dưới (_), dấu chấm (.)
 * - Độ dài từ 3 đến 50 ký tự
 * @param {string} username
 * @returns {{ isValid: boolean, message: string }}
 */
export const validateUsername = (username) => {
    if (!username || String(username).trim() === "") {
        return { isValid: false, message: "Username không được để trống." };
    }

    const trimmed = String(username).trim();

    if (trimmed.length < 3 || trimmed.length > 50) {
        return { isValid: false, message: "Username phải có từ 3 đến 50 ký tự." };
    }

    // Regex: chỉ cho phép chữ thường, số, dấu gạch dưới, dấu chấm
    const usernameRegex = /^[a-z0-9_.]+$/;
    if (!usernameRegex.test(trimmed)) {
        return {
            isValid: false,
            message: "Username chỉ được chứa chữ thường (a-z), số (0-9), dấu gạch dưới (_) và dấu chấm (.). Không dấu, không in hoa, không khoảng trắng.",
        };
    }

    return { isValid: true, message: "" };
};

/**
 * Kiểm tra độ mạnh mật khẩu:
 * - Tối thiểu 6 ký tự
 * - Ít nhất 1 chữ in hoa
 * - Ít nhất 1 ký tự đặc biệt (!@#$%^&*...)
 * @param {string} password
 * @returns {{ isValid: boolean, message: string }}
 */
export const validatePassword = (password) => {
    if (!password || String(password).trim() === "") {
        return { isValid: false, message: "Mật khẩu không được để trống." };
    }

    if (password.length < 6) {
        return { isValid: false, message: "Mật khẩu phải có tối thiểu 6 ký tự." };
    }

    if (!/[A-Z]/.test(password)) {
        return { isValid: false, message: "Mật khẩu phải có ít nhất 1 chữ cái in hoa." };
    }

    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~]/.test(password)) {
        return { isValid: false, message: "Mật khẩu phải có ít nhất 1 ký tự đặc biệt (VD: !@#$%^&*)." };
    }

    return { isValid: true, message: "" };
};

/**
 * Kiểm tra format số điện thoại Việt Nam.
 * Chấp nhận: 0xx hoặc +84xx, tổng cộng 10-11 chữ số.
 * Trường này là tùy chọn (nullable) nên chỉ validate khi có giá trị.
 * @param {string} phone
 * @returns {{ isValid: boolean, message: string }}
 */
export const validatePhone = (phone) => {
    // Phone là trường tùy chọn — nếu rỗng thì bỏ qua
    if (!phone || String(phone).trim() === "") {
        return { isValid: true, message: "" };
    }

    const phoneRegex = /^(\+84|0)[0-9]{9,10}$/;
    if (!phoneRegex.test(String(phone).trim())) {
        return { isValid: false, message: "Số điện thoại không hợp lệ (VD: 0912345678 hoặc +84912345678)." };
    }

    return { isValid: true, message: "" };
};

/**
 * Kiểm tra role hợp lệ (phải thuộc danh sách enum đã định).
 * @param {string} role
 * @returns {{ isValid: boolean, message: string }}
 */
export const validateRole = (role) => {
    const validRoles = ["ADMIN", "LECTURER", "STUDENT"];

    if (!role || String(role).trim() === "") {
        return { isValid: false, message: "Vai trò (role) không được để trống." };
    }

    if (!validRoles.includes(String(role).trim().toUpperCase())) {
        return { isValid: false, message: `Vai trò không hợp lệ. Chỉ chấp nhận: ${validRoles.join(", ")}.` };
    }

    return { isValid: true, message: "" };
};

/**
 * Kiểm tra ngày sinh (dob) hợp lệ.
 * - Phải là chuỗi ngày hợp lệ (có thể parse bằng Date)
 * - Không được là ngày trong tương lai
 * @param {string} dob
 * @returns {{ isValid: boolean, message: string }}
 */
export const validateDob = (dob) => {
    if (!dob || String(dob).trim() === "") {
        return { isValid: false, message: "Ngày sinh (dob) không được để trống." };
    }

    const date = new Date(dob);
    if (isNaN(date.getTime())) {
        return { isValid: false, message: "Ngày sinh không hợp lệ (Định dạng: YYYY-MM-DD)." };
    }

    if (date > new Date()) {
        return { isValid: false, message: "Ngày sinh không thể là ngày trong tương lai." };
    }

    return { isValid: true, message: "" };
};

/**
 * Kiểm tra mã người dùng (code) hợp lệ theo role:
 *
 * - STUDENT : Đúng chuẩn: 3 chữ cái in hoa (mã ngành) + 5-7 chữ số (VD: BIT250052)
 *             Regex: ^[A-Z]{3}[0-9]{5,7}$  |  Độ dài: 8-10 ký tự
 *
 * - LECTURER: Tên viết tắt hoặc mã cán bộ tự do (VD: NTSon, TranVanA, IT_GV01)
 *             Bắt đầu bằng chữ cái in hoa, các ký tự sau có thể là chữ/số/._-
 *             Regex: ^[A-Z][A-Za-z0-9._-]{2,14}$  |  Độ dài: 3-15 ký tự
 *
 * - ADMIN   : Bắt đầu bằng 'AD', theo sau là chữ/số (VD: ADMIN01, AD123456)
 *             Regex: ^AD[A-Z0-9]{4,13}$  |  Độ dài: 6-15 ký tự
 *
 * @param {string} code
 * @param {string} role  - "STUDENT" | "LECTURER" | "ADMIN"
 * @returns {{ isValid: boolean, message: string }}
 */
export const validateUserCode = (code, role) => {
    if (!code || String(code).trim() === "") {
        return { isValid: false, message: "Mã người dùng (code) không được để trống." };
    }

    const trimmedCode = String(code).trim();

    if (role === "STUDENT") {
        // Sinh viên: 3 chữ cái in hoa + 5-7 chữ số, tổng 8-10 ký tự
        const regex = /^[A-Z]{3}[0-9]{5,7}$/;
        if (!regex.test(trimmedCode)) {
            return {
                isValid: false,
                message:
                    "Mã Sinh viên phải gồm 3 chữ cái in hoa (mã ngành) theo sau là 5-7 chữ số (VD: BIT250052).",
            };
        }
    } else if (role === "LECTURER") {
        // Giảng viên: bắt đầu chữ cái in hoa, phần còn lại có thể là chữ/số/._-, tổng 3-15 ký tự
        const regex = /^[A-Z][A-Za-z0-9._-]{2,14}$/;
        if (!regex.test(trimmedCode)) {
            return {
                isValid: false,
                message:
                    "Mã Giảng viên phải bắt đầu bằng chữ cái in hoa, chỉ chứa chữ cái, số và ký tự ._-, độ dài 3-15 ký tự (VD: NTSon, IT_GV01).",
            };
        }
    } else if (role === "ADMIN") {
        // Admin: bắt đầu bằng 'AD', theo sau là chữ/số, tổng 6-15 ký tự
        const regex = /^AD[A-Z0-9]{4,13}$/;
        if (!regex.test(trimmedCode)) {
            return {
                isValid: false,
                message: "Mã Admin phải bắt đầu bằng 'AD' và chỉ chứa chữ in hoa hoặc số (VD: ADMIN01).",
            };
        }
    } else {
        return { isValid: false, message: "Vai trò người dùng không hợp lệ." };
    }

    return { isValid: true, message: "" };
};
