import express from "express";
import { auth } from "../auth/auth.js";
import db from "../config/db.js";
import jwt from "jsonwebtoken";
import emailService from "../services/email.service.js";
import authMiddleware from "../middlewares/auth.middleware.js";
import userController from "../controllers/user.controller.js";

const router = express.Router();

router.get("/profile", authMiddleware.auth, userController.profile);
router.get("/settings", authMiddleware.auth, userController.settings);
router.post("/delete", authMiddleware.auth, userController.deleteAccount);

export default router;
