/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Authentication endpoints
 */

/**
 * @swagger
 * /api/v1/auth/register:
 *   post:
 *     summary: Register user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - firstName
 *               - lastName
 *               - emailAddress
 *               - password
 *             properties:
 *               firstName:
 *                 type: string
 *                 example: John
 *               lastName:
 *                 type: string
 *                 example: Doe
 *               emailAddress:
 *                 type: string
 *                 format: email
 *                 example: john@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: StrongPass123!
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: Validation error
 */

/**
 * @swagger
 * /api/v1/auth/verify:
 *   post:
 *     summary: Verify email using token
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *             properties:
 *               verificationToken:
 *                 type: string
 *                 example: "bf9e659e7e0cce1f26b20bdd392b6d7ce77574efb32bd5a02bb00afe76530335"
 *     responses:
 *       200:
 *         description: Email verified successfully. User can now log in.
 *       400:
 *         description: Missing or invalid token
 *       404:
 *         description: Token expired
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/v1/auth/login:
 *   post:
 *     summary: Login user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - emailAddress
 *               - password
 *             properties:
 *               emailAddress:
 *                 type: string
 *                 example: john@example.com
 *               password:
 *                 type: string
 *                 example: StrongPass123!
 *     responses:
 *       200:
 *         description: Login successful (cookie set)
 *       401:
 *         description: Invalid credentials(email/password)
 *       403:
 *         description: Unverified email
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/v1/auth/logout:
 *   post:
 *     summary: Logout user (clears auth cookie)
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Logged out successfully
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/v1/auth/forgot:
 *   post:
 *     summary: Request password reset code
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - emailAddress
 *             properties:
 *               emailAddress:
 *                 type: string
 *                 example: john@example.com
 *     responses:
 *       200:
 *         description: If account exists, reset code is sent
 *       400:
 *         description: Email is required
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/auth/verify-reset-code:
 *   post:
 *     summary: Verify password reset code
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - emailAddress
 *               - code
 *             properties:
 *               emailAddress:
 *                 type: string
 *                 example: john@example.com
 *               code:
 *                 type: string
 *                 example: "123456"
 *     responses:
 *       200:
 *         description: Reset code verified successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 resetToken:
 *                   type: string
 *       400:
 *         description: Invalid or expired reset code
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/auth/reset-password:
 *   post:
 *     summary: Reset user password using reset token
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - emailAddress
 *               - resetToken
 *               - newPassword
 *             properties:
 *               emailAddress:
 *                 type: string
 *                 example: john@example.com
 *               resetToken:
 *                 type: string
 *                 example: "bf9e659e7e0cce1f26b20bdd392b6d7ce77574efb32bd5a02bb00afe76530335"
 *               newPassword:
 *                 type: string
 *                 example: "NewStrongPass123!"
 *     responses:
 *       200:
 *         description: Password reset successful
 *       400:
 *         description: Invalid or expired reset token
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/auth/change-password:
 *   post:
 *     summary: Change password for authenticated user
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - currentPassword
 *               - newPassword
 *             properties:
 *               currentPassword:
 *                 type: string
 *                 example: OldPass123!
 *               newPassword:
 *                 type: string
 *                 example: NewStrongPass123!
 *     responses:
 *       200:
 *         description: Password changed successfully
 *       400:
 *         description: Invalid input
 *       404:
 *         description: Current password incorrect
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Check authentication status
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Authenticated status
 *       401:
 *         description: Not authenticated
 */

import express from "express";
import { auth } from "../auth/auth.js";
import {
  registerUser,
  verifyEmail,
  loginUser,
  logoutUser,
  forgotPassword,
  verifyResetCode,
  resetPassword,
  changePassword,
  checkAuthToken,
} from "../controllers/auth.controller.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/verify", verifyEmail);
router.post("/login", loginUser);
router.post("/logout", logoutUser);
router.post("/forgot", forgotPassword);
router.post("/verify-reset-code", verifyResetCode);
router.post("/reset-password", resetPassword);
router.post("/change-password", auth, changePassword);
router.get("/me", checkAuthToken);

export default router;
