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
        html: generateOtpEmailTemplate(otpCode, fullName, expiryMinutes),
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`📧 OTP Email đã gửi tới ${toEmail} — Message ID: ${info.messageId}`);
    return info;
};

// ==========================================
// 3. TEMPLATE HTML EMAIL OTP
// ==========================================
/**
 * Sinh nội dung HTML cho email OTP.
 * Thiết kế tối giản, chuyên nghiệp, phù hợp trên mọi nền tảng email client.
 */
function generateOtpEmailTemplate(otpCode, fullName, expiryMinutes) {
    return `
<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0; padding:0; background-color:#f1f5f9; font-family:'Segoe UI',Arial,sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color:#f1f5f9; padding:40px 0;">
    <tr>
      <td align="center">
        <table role="presentation" width="480" cellspacing="0" cellpadding="0" style="background-color:#ffffff; border-radius:16px; overflow:hidden; box-shadow:0 4px 24px rgba(0,0,0,0.08);">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #0ea5e9, #6366f1); padding:32px 40px; text-align:center;">
              <h1 style="margin:0; color:#ffffff; font-size:24px; font-weight:700; letter-spacing:-0.5px;">
                📚 StudyHub
              </h1>
              <p style="margin:8px 0 0; color:rgba(255,255,255,0.85); font-size:14px;">
                Nền tảng chia sẻ tài liệu học tập CMC University
              </p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:32px 40px;">
              <p style="margin:0 0 16px; color:#334155; font-size:16px; line-height:1.6;">
                Xin chào <strong>${fullName}</strong>,
              </p>
              <p style="margin:0 0 24px; color:#475569; font-size:14px; line-height:1.6;">
                Bạn đang đăng ký tài khoản trên <strong>StudyHub</strong>. 
                Vui lòng sử dụng mã xác thực bên dưới để hoàn tất quá trình đăng ký:
              </p>

              <!-- OTP Code Box -->
              <div style="background:#f8fafc; border:2px dashed #0ea5e9; border-radius:12px; padding:24px; text-align:center; margin:0 0 24px;">
                <p style="margin:0 0 8px; color:#64748b; font-size:12px; text-transform:uppercase; letter-spacing:2px; font-weight:600;">
                  Mã xác thực của bạn
                </p>
                <p style="margin:0; color:#0f172a; font-size:36px; font-weight:800; letter-spacing:8px; font-family:'Courier New',monospace;">
                  ${otpCode}
                </p>
              </div>

              <p style="margin:0 0 8px; color:#ef4444; font-size:13px; font-weight:600;">
                ⏳ Mã có hiệu lực trong ${expiryMinutes} phút.
              </p>
              <p style="margin:0; color:#94a3b8; font-size:13px; line-height:1.6;">
                Nếu bạn không thực hiện yêu cầu đăng ký này, vui lòng bỏ qua email này. 
                Không chia sẻ mã xác thực này với bất kỳ ai.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color:#f8fafc; padding:20px 40px; text-align:center; border-top:1px solid #e2e8f0;">
              <p style="margin:0; color:#94a3b8; font-size:12px;">
                © ${new Date().getFullYear()} StudyHub CMC University. All rights reserved.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `.trim();
}
