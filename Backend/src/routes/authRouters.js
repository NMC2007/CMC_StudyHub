import express from "express";
import { testAuth } from "../controller/authController.js";

const authRouter = express.Router();

// @route GET /api/v1/auth
authRouter.get("/", testAuth);

export default authRouter;