import { toAPIResponse } from "../models/dto/response/APIResponse.js";

export const testAuth = async (req, res) => {
    try {
        res.status(200).json(toAPIResponse(200, "Lấy dữ liệu thành công", { data: "Test API is running" }));
    } catch (error) {
        console.log(error);
        res.status(500).json(toAPIResponse(500, "Lấy dữ liệu thất bại", null, error.message));
    }
}