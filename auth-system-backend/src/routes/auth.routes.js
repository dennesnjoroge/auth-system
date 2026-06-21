import authController from "../controllers/auth.controller.js";
import validationMiddleware from "../middlewares/validation.middleware.js";
import authMiddleware from "../middlewares/auth.middleware.js";
import validationSchema from "../schema/validation.schema.js";

import express from "express";
import { auth } from "../auth/auth.js";

const router = express.Router();

router.post(
  "/register",
  validationMiddleware.register(validationSchema.register),
  authController.register,
);
router.post(
  "/login",
  validationMiddleware.login(validationSchema.login),
  authController.login,
);
router.post(
  "/verify-email",
  validationMiddleware.verifyEmail(validationSchema.verifyEmail),
  authController.verifyEmail,
);
router.post("/logout", authMiddleware.auth, authController.logout);
router.post(
  "/forgot-password",
  validationMiddleware.forgotPassword(validationSchema.forgotPassword),
  authController.forgotPassword,
);
router.post(
  "/reset-password",
  validationMiddleware.resetPassword(validationSchema.resetPassword),
  authController.resetPassword,
);
router.post("/change-password", auth, authController.changePassword);
router.get("/session", authMiddleware.auth, authController.session);
router.post("/refresh", authMiddleware.refresh, authController.refresh);

export default router;
