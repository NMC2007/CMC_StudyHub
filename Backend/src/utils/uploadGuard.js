/**
 * ============================================
 * UPLOAD GUARD UTILS - Tiện ích kiểm tra quyền upload & dọn dẹp file
 * ============================================
 * Tách riêng logic kiểm tra quyền upload nghiệp vụ cho STUDENT
 * và xử lý xóa file vật lý rác để tái sử dụng giữa documentService và groupService.
 */

import fs from "fs";
import { v2 as cloudinary } from "cloudinary";
import { AppDataSource } from "#config/db.js";

/**
 * Xóa file (dùng cho rollback khi lỗi DB hoặc validation).
 * Hỗ trợ cả file vật lý trên ổ cứng và file đã upload lên Cloudinary.
 * @param {string|Object} fileOrPath - Đường dẫn tuyệt đối tới file cần xóa hoặc Multer req.file object
 */
export const cleanupFile = async (fileOrPath) => {
    if (!fileOrPath) return;
    try {
        // Trường hợp 1: Truyền vào Multer file object của Cloudinary
        if (typeof fileOrPath === "object" && fileOrPath.filename && fileOrPath.path?.startsWith("http")) {
            const resourceType = fileOrPath.path.includes("/raw/upload/") ? "raw" : "image";
            await cloudinary.uploader.destroy(fileOrPath.filename, { resource_type: resourceType });
            return;
        }
        // Trường hợp 2: Truyền vào chuỗi URL Cloudinary
        if (typeof fileOrPath === "string" && (fileOrPath.startsWith("http://") || fileOrPath.startsWith("https://"))) {
            return;
        }
        // Trường hợp 3: File vật lý trên ổ cứng cục bộ
        const targetPath = typeof fileOrPath === "object" ? fileOrPath.path : fileOrPath;
        if (targetPath && !targetPath.startsWith("http")) {
            await fs.promises.unlink(targetPath);
        }
    } catch (err) {
        if (err.code !== "ENOENT") {
            console.warn(`⚠️ [Cleanup Warning] Không thể dọn dẹp file rác:`, err.message);
        }
    }
};

/**
 * Kiểm tra Upload Guard nghiệp vụ cho sinh viên (STUDENT) và xác minh Môn học hợp lệ.
 * @param {Object} user - User từ req.user
 * @param {Object} body - Request body
 * @param {string} filePath - Đường dẫn file đã upload (để dọn dẹp nếu lỗi)
 * @returns {Promise<{ isValid: boolean, error: Object|null, subject: Object|null }>}
 */
export const validateStudentUploadContext = async (user, body, filePath) => {
    // 1. Kiểm tra ràng buộc Khóa/Khoa/Ngành với STUDENT
    if (user.role === "STUDENT") {
        const cohortId = parseInt(body.cohort_id);
        const facultyId = parseInt(body.faculty_id);
        const majorId = parseInt(body.major_id);

        if (!cohortId || !facultyId || !majorId) {
            await cleanupFile(filePath);
            return {
                isValid: false,
                error: {
                    statusCode: 400,
                    message: "Sinh viên phải cung cấp đầy đủ Khóa (cohort_id), Khoa (faculty_id) và Ngành (major_id) khi upload tài liệu.",
                    data: null,
                    errors: ["Missing Academic Context for Student Upload"],
                },
                subject: null,
            };
        }

        const mismatchFields = [];
        if (cohortId !== user.cohort_id) mismatchFields.push("Khóa học (cohort_id)");
        if (facultyId !== user.faculty_id) mismatchFields.push("Khoa (faculty_id)");
        if (majorId !== user.major_id) mismatchFields.push("Ngành (major_id)");

        if (mismatchFields.length > 0) {
            await cleanupFile(filePath);
            return {
                isValid: false,
                error: {
                    statusCode: 403,
                    message: `Bạn chỉ được upload tài liệu vào đúng ${mismatchFields.join(", ")} của mình.`,
                    data: null,
                    errors: ["Upload Guard Violation — Student academic context mismatch"],
                },
                subject: null,
            };
        }
    }

    // 2. Kiểm tra subject_id tồn tại trong DB
    const subjectRepo = AppDataSource.getRepository("Subject");
    const subject = await subjectRepo.findOne({
        where: { id: parseInt(body.subject_id) },
        relations: { majors: true },
    });

    if (!subject) {
        await cleanupFile(filePath);
        return {
            isValid: false,
            error: {
                statusCode: 400,
                message: `Môn học với ID '${body.subject_id}' không tồn tại trong hệ thống.`,
                data: null,
                errors: ["Subject Not Found"],
            },
            subject: null,
        };
    }

    // 3. Kiểm tra môn học thuộc chuyên ngành của sinh viên
    if (user.role === "STUDENT") {
        const isSubjectInMajor = subject.majors && subject.majors.some((m) => m.id === user.major_id);
        if (!isSubjectInMajor) {
            await cleanupFile(filePath);
            return {
                isValid: false,
                error: {
                    statusCode: 403,
                    message: "Môn học này không thuộc chương trình đào tạo của chuyên ngành bạn đang theo học.",
                    data: null,
                    errors: ["Upload Guard Violation — Subject does not belong to student major"],
                },
                subject: null,
            };
        }
    }

    return {
        isValid: true,
        error: null,
        subject,
    };
};
