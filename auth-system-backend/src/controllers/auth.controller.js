import {
  createUser,
  verifyEmailUser,
  logUserIn,
} from "../services/auth.service.js";
import {
  validateRegisterInput,
  validateLoginInput,
} from "../validators/auth.validator.js";
import {
  sendSignupEmail,
  sendResetCodeEmail,
  sendOnboardingEmail,
} from "../services/email.service.js";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import db from "../config/db.js";
import { response } from "express";

import { recordPasswordChange } from "../services/passwordAlert.service.js";
import { error } from "console";
import { stat } from "fs";

const saltRounds = 10;

export const registerUser = async (req, res) => {
  try {
    const { data, error } = validateRegisterInput(req.body);

    if (error) {
      return res.status(error.status).json({ message: error.message });
    }

    const fullName = `${data.firstName} ${data.lastName}`;

    const { verificationToken, linkExpirytime } = await createUser(data);
    const verificationLink = `http://${process.env.CLIENT_ORIGIN}/verify?token=${verificationToken}`;
    sendSignupEmail(
      `${data.firstName} ${data.lastName}`,
      data.emailAddress,
      verificationLink,
      linkExpirytime,
    );

    return res.status(201).json({
      message:
        "Registration successful. Please check your email to verify your account.",
    });
  } catch (error) {
    console.error("registerUser error:", error);

    if (error.code === "EMAIL_EXISTS") {
      return res.status(409).json({ message: "Email already exists" });
    }

    return res.status(500).json({ message: "Internal server error" });
  }
};

export const verifyEmail = async (req, res) => {
  const { token } = req.body;

  try {
    if (!token) {
      return res
        .status(400)
        .json({ message: "Verification token is required" });
    }

    const user = await verifyEmailUser(token);

    // send onboarding email here
    const { first_name, last_name, email_address } = user;

    const fullName = `${first_name} ${last_name}`;
    sendOnboardingEmail(fullName, email_address);

    return res.status(201).json({
      message: "Email verified successfully. You can now log in.",
    });
  } catch (error) {
    console.error("Verify user/email error:", error);

    if (error.code === "INVALID_TOKEN") {
      return res.status(400).json({ message: "Invalid verification token" });
    } else if (error.code === "EXPIRED_TOKEN") {
      return res.status(404).json({ message: "Token has expired" });
    }
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const loginUser = async (req, res) => {
  const { emailAddress, password } = req.body;

  const normalizedEmail = emailAddress.trim().toLowerCase();
  const normalizedPassword = password.trim();

  if (!normalizedEmail) {
    return res.status(400).json({
      success: false,
      message: "Email address is required",
      status: 400,
      errors: {
        message: "Email address is required",
      },
    });
  }

  if (!normalizedPassword) {
    return res.status(400).json({
      success: false,
      message: "Password cannot be empty",
      status: 400,
      errors: {
        message: "Password cannot be empty",
      },
    });
  }

  try {
    const loginToken = await logUserIn(normalizedEmail, normalizedPassword);

    res.cookie("loginToken", loginToken, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 60 * 60 * 1000,
    });

    return res.status(200).json({
      message: "Login successful",
    });

    // await loginUser here
  } catch (error) {
    return res.status(error.status || 500).json({
      success: false,
      message: error.message,
      status: error.status,
      errors: {
        message: error.message,
      },
    });
    if (error.code === "USER_NOT_FOUND") {
      return res.status(404).json({ message: "Email not found" });
    } else if (error.code === "WRONG_PASSWORD") {
      return res.status(404).json({ message: "Wrong password" });
    } else if (error.code === "UNVERIFIED_EMAIL") {
      return res.status(404).json({
        message:
          "Email not verified. A verification link has been sent. Please check your email.",
      });
    } else if ((error.code = "TOKEN_STILL_VALID")) {
      return res.status(404).json({
        message: "A verification email was already sent. Check your inbox.",
      });
    }

    return res.status(500).json({ message: "Internal server error" });
  }
};

export const logoutUser = async (req, res) => {
  res.clearCookie("loginToken", {
    httpOnly: true,
    secure: false,
    sameSite: "lax",
    path: "/", // IMPORTANT (often missing)
  });

  return res.status(200).json({
    success: true,
    message: "Logged out successfully",
  });
};

export const forgotPassword = async (req, res) => {
  let { emailAddress } = req.body;

  try {
    emailAddress = emailAddress?.trim().toLowerCase();
    if (!emailAddress) {
      return res.status(400).json({ message: "Email is required" });
    }

    const [rows] = await db.execute(
      `SELECT id, first_name, last_name FROM users WHERE email_address = ?`,
      [emailAddress],
    );

    if (rows.length === 0) {
      return res.status(200).json({
        message:
          "If an account with that email exists, a reset code has been sent.",
      });
    }

    const user = rows[0];

    const code = crypto.randomInt(100000, 1000000).toString();
    const codeHash = crypto.createHash("sha256").update(code).digest("hex");

    // the code will expire in five minutes
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);
    const codeExpirytime = 5; // for email content

    await db.execute(
      `UPDATE users SET reset_code_hash = ?, reset_code_expires_at = ? WHERE id = ?`,
      [codeHash, expiresAt, user.id],
    );

    // await send code here
    await sendResetCodeEmail(
      `${user.first_name} ${user.last_name}`,
      emailAddress,
      code,
      codeExpirytime,
    );

    return res.status(200).json({
      message:
        "If an account with that email exists, a reset code has been sent.",
    });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const verifyResetCode = async (req, res) => {
  const { emailAddress, code } = req.body;

  try {
    if (!emailAddress || !code) {
      return res.status(400).json({ message: "Email and code are required" });
    }

    const [rows] = await db.execute(
      `SELECT id, reset_code_hash, reset_code_expires_at FROM users WHERE email_address = ? LIMIT 1`,
      [emailAddress],
    );

    if (rows.length === 0) {
      return res.status(400).json({ message: "Invalid reset request" });
    }

    const user = rows[0];

    if (!user.reset_code_hash || !user.reset_code_expires_at) {
      return res.status(400).json({
        message: "Invalid reset request",
      });
    }

    if (new Date(user.reset_code_expires_at) < new Date()) {
      await db.execute(
        `UPDATE users SET reset_code_hash = NULL, reset_code_expires_at = NULL WHERE id = ?`,
        [user.id],
      );
      return res.status(400).json({
        message: "Reset code has expired. Please request an new one.",
        error_code: "EXPIRED",
      });
    }

    const submittedCodeHash = crypto
      .createHash("sha256")
      .update(code)
      .digest("hex");

    if (submittedCodeHash !== user.reset_code_hash) {
      return res.status(400).json({ message: "Invalid reset code" });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenHash = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    const resetTokenExpiresAt = new Date(Date.now() + 15 * 60 * 1000);

    await db.execute(
      `UPDATE users SET reset_code_hash = NULL, reset_code_expires_at = NULL, reset_token_hash = ?, reset_token_expires_at = ? WHERE id = ?`,
      [resetTokenHash, resetTokenExpiresAt, user.id],
    );

    return res.status(200).json({
      message: "Reset code verified successfully",
      resetToken: resetToken,
    });
  } catch (error) {
    console.error("Verify reset code error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const resetPassword = async (req, res) => {
  const { emailAddress, resetToken, newPassword } = req.body;

  try {
    const [rows] = await db.execute(
      `SELECT id, first_name, last_name, email_address, reset_token_hash, reset_token_expires_at FROM users WHERE email_address = ? LIMIT 1`,
      [emailAddress],
    );

    if (rows.length === 0) {
      return res.status(400).json({ message: "Invalid reset request" });
    }

    const user = rows[0];

    if (!user.reset_token_hash || !user.reset_token_expires_at) {
      return res.status(400).json({ message: "Invalid reset request" });
    }

    if (new Date(user.reset_token_expires_at) < new Date()) {
      return res.status(400).json({ message: "Reset token has expired" });
    }

    const submittedCodeHash = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    if (submittedCodeHash !== user.reset_token_hash) {
      return res.status(400).json({ message: "Invalid reset token" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    await db.execute(
      `UPDATE users SET password_hash = ?, reset_token_hash = NULL, reset_token_expires_at = NULL WHERE id = ?`,
      [hashedPassword, user.id],
    );

    const userId = user.id;
    const changeMethod = "Manual";

    await recordPasswordChange({ userId, req, changeMethod });
    return res.status(200).json({ message: "Password reset successful" });
  } catch (error) {
    console.error("Reset password error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  try {
    const userId = req.user.id;
    const [rows] = await db.execute(
      "SELECT password_hash FROM users WHERE id = ?",
      [userId],
    );

    const user = rows[0];

    const comparePassword = await bcrypt.compare(
      currentPassword,
      user.password_hash,
    );

    if (!comparePassword) {
      return res
        .status(404)
        .json({ message: "Check your password and try again" });
    }

    const passwordHash = await bcrypt.hash(newPassword, saltRounds);

    await db.execute(`UPDATE users SET password_hash = ? WHERE id = ?`, [
      passwordHash,
      userId,
    ]);

    const changeMethod = "Manual";

    recordPasswordChange({ userId, req, changeMethod });

    return res.status(200).json({ message: "Password changed succesfully" });
  } catch (error) {
    console.error("Reset password error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const checkAuthToken = async (req, res) => {
  const token = req.cookies.loginToken;

  if (!token) {
    return res.status(401).json({ authenticated: false });
  }

  return res.status(200).json({ authenticated: true });
};
