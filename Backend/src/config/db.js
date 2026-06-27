import pg from "pg"
import dotenv from "dotenv";
dotenv.config();

const pool = new pg.Pool({
    host: process.env.DB_HOST, // Địa chỉ server
    port: process.env.DB_PORT, // Cổng PostgreSQL
    database: process.env.DB_NAME, // Tên database
    user: process.env.DB_USER, // Username
    password: process.env.DB_PASSWORD, // Password

    max: 20, // Số kết nối tối đa trong pool
    idleTimeoutMillis: 30000, // Đóng kết nối nếu rảnh 30s
    connectionTimeoutMillis: 2000, // Timeout khi kết nối
})

export const connectDB = async () => {
    try {
        const client = await pool.connect();
        console.log("Kết nối thành công");
        // mnếu kết nối thành công thì trả connection cho pool
        client.release();
    } catch (error) {
        console.log("Kết nối thất bại:", error.message);
    }
}
// xuất ra pool cho repo gọi và gửi truy vấn
export { pool };