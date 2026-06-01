import {
  registerUserService,
  verifyEmailService,
  loginUserService,
  sendResetCodeService,
  verifyResetCodeService,
  resetPasswordService,
  changePasswordService,
} from "../services/auth.service.js";
import {
  sendSignupEmail,
  sendResetCodeEmail,
  sendOnboardingEmail,
} from "../services/email.service.js";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import db from "../config/db.js";
import { passwordRegex } from "../utils/password.util.js";
import { sendSuccessMessage } from "../utils/success.util.js";
import { createAppError } from "../utils/error.util.js";
import { sendErrorMessage } from "../utils/error.util.js";

import { recordPasswordChange } from "../services/alert.service.js";
import validator from "validator";

const saltRounds = 10;

export const registerUser = async (req, res, next) => {
  try {
    const { firstName, lastName, emailAddress, password } = req?.body || {};

    const normalizedFirstName = firstName?.trim() || "";
    const normalizedLastName = lastName?.trim() || "";
    const normalizedEmailAddress = emailAddress?.trim().toLowerCase() || "";
    const normalizedPassword = password || "";

    if (!normalizedFirstName) {
      throw createAppError("First name is required", 400);
    }

    if (!normalizedLastName) {
      throw createAppError("Last name is required", 400);
    }

    if (!validator.isEmail(normalizedEmailAddress)) {
      throw createAppError("Invalid email address", 400);
    }
    if (
      !normalizedFirstName ||
      !normalizedLastName ||
      !normalizedEmailAddress ||
      !normalizedPassword.trim()
    ) {
      throw createAppError("Missing required fields", 400);
    }

    if (normalizedPassword.length < 8) {
      throw createAppError("Password must be at least 8 characters long", 400);
    }

    if (!passwordRegex(normalizedPassword)) {
      throw createAppError(
        "Password must include uppercase, lowercase, number, and special character",
        400,
      );
    }

    const registrationData = {
      normalizedFirstName,
      normalizedLastName,
      normalizedEmailAddress,
      normalizedPassword,
    };

    await registerUserService(registrationData);

    return sendSuccessMessage(
      res,
      201,
      "Registration successful. Please check your email to verify your account.",
    );
  } catch (error) {
    next(error);
  }
};

export const verifyEmail = async (req, res, next) => {
  try {
    const { verificationToken } = req.body;

    if (!verificationToken) {
      throw createAppError("Verification token is required", 400);
    }

    await verifyEmailService(verificationToken);

    return sendSuccessMessage(
      res,
      200,
      "Email verified successfully. You can now log in",
    );
  } catch (error) {
    next(error);
  }
};

export const loginUser = async (req, res, next) => {
  try {
    const { emailAddress, password } = req?.body || {};

    const normalizedEmail = emailAddress?.trim().toLowerCase();
    const normalizedPassword = password || "";

    if (!normalizedEmail) {
      throw createAppError("Email address is required");
    }

    if (!normalizedPassword.trim()) {
      throw createAppError("Password cannot be empty", 400);
    }

    const accessToken = await loginUserService(
      normalizedEmail,
      normalizedPassword,
    );

    res.cookie("_at", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 1000,
    });

    sendSuccessMessage(res, 200, "Login was successful");
  } catch (error) {
    next(error);
  }
};

export const logoutUser = async (req, res) => {
  res.clearCookie("_at", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
  });

  return sendSuccessMessage(res, 200, "Logged out successfully");
};

export const forgotPassword = async (req, res, next) => {
  try {
    const { emailAddress } = req?.body || {};

    const normalizedEmailAddress = emailAddress?.trim().toLowerCase();
    if (!normalizedEmailAddress) {
      throw createAppError("Email address is required", 400);
    }

    await sendResetCodeService(normalizedEmailAddress);

    return res.status(200).json({
      message:
        "If an account with that email exists, a reset code has been sent.",
    });
  } catch (error) {
    next(error);
  }
};

export const verifyResetCode = async (req, res, next) => {
  try {
    const { emailAddress, resetCode } = req?.body || {};

    const normalizedEmailAddress = emailAddress?.trim().toLowerCase();
    const normalizedResetCode = resetCode?.trim();

    if (!normalizedEmailAddress) {
      throw createAppError("Email address is required", 400);
    }

    if (!normalizedResetCode) {
      throw createAppError("Reset code cannot be empty", 400);
    }

    const { resetToken } = await verifyResetCodeService(
      normalizedEmailAddress,
      normalizedResetCode,
    );

    res.clearCookie("_rt", {
      path: "/api/v1/auth/reset-password",
    });

    res.cookie("_rt", resetToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 15 * 60 * 1000,
      path: "/api/v1/auth/reset-password",
    });

    return sendSuccessMessage(res, 200, "Reset code verified successfully");
  } catch (error) {
    next(error);
  }
};

export const resetPassword = async (req, res, next) => {
  try {
    const resetToken = req?.cookies._rt || undefined;

    const { newPassword } = req?.body || {};

    if (!resetToken) {
      throw createAppError("Invalid reset session", 400);
    }

    if (!newPassword) {
      throw createAppError("Password cannot be empty", 400);
    }

    await resetPasswordService(resetToken, newPassword, req);

    return sendSuccessMessage(res, 200, "Password reset successful");
  } catch (error) {
    next(error);
  }
};

export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req?.body || {};
    const userId = req.user.id;

    await changePasswordService(currentPassword, newPassword, userId);

    return sendSuccessMessage(res, 200, "Password changed successfully");
  } catch (error) {
    next(error);
  }
};

export const checkAuthToken = async (req, res) => {
  const token = req.cookies.loginToken;

  if (!token) {
    return res.status(401).json({ authenticated: false });
  }

  return res.status(200).json({ authenticated: true });
};
