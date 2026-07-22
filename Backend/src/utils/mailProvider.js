/**
 * ============================================
 * MAIL PROVIDER - Tiện ích gửi Email qua SMTP
 * ============================================
 * Sử dụng nodemailer kết nối Gmail SMTP để gửi email xác thực OTP.
 *
 * Cấu hình đọc từ biến môi trường (.env):
 *   - SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM_NAME
 *
 * Exports:
 *   - sendOtpEmail(toEmail, otpCode, fullName): Gửi email OTP xác thực đăng ký
 */

import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

// ==========================================
// 1. KHỞI TẠO TRANSPORTER SMTP
// ==========================================
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: parseInt(process.env.SMTP_PORT) || 587,
    secure: false, // true cho port 465, false cho port 587 (STARTTLS)
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

// Kiểm tra kết nối SMTP khi khởi động server (chỉ log, không throw)
transporter.verify()
    .then(() => console.log("📧 SMTP: Kết nối Gmail thành công! Sẵn sàng gửi email."))
    .catch((err) => console.error("❌ SMTP: Kết nối thất bại:", err.message));

// ==========================================
// 2. GỬI EMAIL OTP XÁC THỰC ĐĂNG KÝ
// ==========================================
/**
 * Gửi email OTP xác thực đăng ký tài khoản mới.
 *
 * @param {string} toEmail - Địa chỉ email nhận (VD: bit250052@st.cmcu.edu.vn)
 * @param {string} otpCode - Mã OTP 6 chữ số (VD: "849201")
 * @param {string} fullName - Họ tên người nhận (VD: "Nguyễn Văn A")
 * @returns {Promise<object>} - Kết quả gửi email từ nodemailer
 */
export const sendOtpEmail = async (toEmail, otpCode, fullName) => {
    const fromName = process.env.SMTP_FROM_NAME || "StudyHub";
    const expiryMinutes = parseInt(process.env.OTP_EXPIRY_MINUTES) || 10;

    const mailOptions = {
        from: `"${fromName}" <${process.env.SMTP_USER}>`,
        to: toEmail,
        subject: `[StudyHub] Mã xác thực đăng ký tài khoản: ${otpCode}`,
        text: generateOtpEmailTemplateText(otpCode, fullName, expiryMinutes),
        html: generateOtpEmailTemplate(otpCode, fullName, expiryMinutes),
        headers: {
            "X-Mailer": "Microsoft Outlook 16.0",
            "X-Priority": "3 (Normal)",
            "Importance": "normal"
        },
        messageId: `<${Date.now()}-${Math.random().toString(36).substring(2)}@mail.gmail.com>`
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`📧 OTP Email đã gửi tới ${toEmail} — Message ID: ${info.messageId}`);
    return info;
};

// ==========================================
// 3. TEMPLATE EMAIL OTP (TEXT + HTML)
// ==========================================
/**
 * Sinh nội dung Plain Text (Văn bản thuần)
 * Rất quan trọng để bypass bộ lọc Spam của Microsoft Exchange / Outlook
 */
function generateOtpEmailTemplateText(otpCode, fullName, expiryMinutes) {
    return `Xin chào ${fullName},\n\nBạn đang đăng ký tài khoản trên hệ thống StudyHub. Vui lòng sử dụng mã xác thực bên dưới để hoàn tất quá trình đăng ký.\n\nMÃ XÁC THỰC CỦA BẠN: ${otpCode}\n\nMã có hiệu lực trong ${expiryMinutes} phút.\nNếu bạn không thực hiện yêu cầu này, vui lòng bỏ qua thư này.\n\n© ${new Date().getFullYear()} StudyHub CMC University.`;
}

/**
 * Sinh nội dung HTML cho email OTP.
 * Thiết kế đơn giản, rõ ràng, tránh sử dụng quá nhiều thẻ phức tạp để lọt qua spam filter.
 */
function generateOtpEmailTemplate(otpCode, fullName, expiryMinutes) {
    return `
<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
</head>
<body style="font-family: Arial, sans-serif; color: #333; line-height: 1.6; padding: 20px;">
  <h2 style="color: #0ea5e9;">StudyHub - Nền tảng chia sẻ tài liệu CMCU</h2>
  <p>Xin chào <strong>${fullName}</strong>,</p>
  <p>Bạn đang đăng ký tài khoản trên hệ thống. Vui lòng sử dụng mã xác thực bên dưới để hoàn tất quá trình đăng ký:</p>
  
  <div style="background-color: #f8fafc; border: 1px dashed #0ea5e9; padding: 15px; margin: 20px 0; max-width: 400px; text-align: center;">
    <p style="margin: 0; font-size: 14px; color: #64748b; font-weight: bold;">MÃ XÁC THỰC CỦA BẠN</p>
    <h1 style="margin: 10px 0 0 0; font-size: 36px; color: #0f172a; letter-spacing: 8px;">${otpCode}</h1>
  </div>

  <p style="color: #ef4444; font-weight: bold;">⏳ Mã này có hiệu lực trong vòng ${expiryMinutes} phút.</p>
  <p style="font-size: 13px; color: #64748b;">Nếu bạn không thực hiện yêu cầu đăng ký này, vui lòng bỏ qua email. Không chia sẻ mã này với bất kỳ ai.</p>
  
  <hr style="border: none; border-top: 1px solid #e2e8f0; margin-top: 30px;" />
  <p style="font-size: 12px; color: #94a3b8;">© ${new Date().getFullYear()} StudyHub CMC University. All rights reserved.</p>
</body>
</html>
    `.trim();
}
