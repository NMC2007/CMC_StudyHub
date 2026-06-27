import express from "express";
import { connectDB } from "./config/db.js";
import authRouter from "./routes/authRouters.js";

import dotenv from 'dotenv'
dotenv.config();

const PORT = process.env.SERVER_PORT || 8081;

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());


// cấu hình các cổng
app.use("/api/v1/auth", authRouter)


// kết nối
connectDB().then(() => {
    app.listen(PORT, () => {
        console.log(`Kết nối thành công tại port ${PORT}`);
    })
}).catch((error) => {
    console.log("Kết nối thất bại:", error.message);
})