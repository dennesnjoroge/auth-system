import crypto from "crypto";
import bcrypt from "bcryptjs";
import db from "../config/db.js";
import utils from "../utils/utils.js";
import authService from "../services/auth.service.js";

import validator from "validator";

const saltRounds = 10;

const register = async (req, res, next) => {
  try {
    const { firstName, lastName, emailAddress, password } = req?.body || {};

    const normalizedFirstName = firstName?.trim() || "";
    const normalizedLastName = lastName?.trim() || "";
    const normalizedEmailAddress = emailAddress?.trim().toLowerCase() || "";
    const normalizedPassword = password || "";

    if (!normalizedFirstName) {
      throw utils.appError("First name is required", 400);
    }

    if (!normalizedLastName) {
      throw utils.appError("Last name is required", 400);
    }

    if (!validator.isEmail(normalizedEmailAddress)) {
      throw utils.appError("Invalid email address", 400);
    }
    if (
      !normalizedFirstName ||
      !normalizedLastName ||
      !normalizedEmailAddress ||
      !normalizedPassword.trim()
    ) {
      throw utils.appError("Missing required fields", 400);
    }

    if (normalizedPassword.length < 8) {
      throw utils.appError("Password must be at least 8 characters long", 400);
    }

    if (!utils.passwordRegex(normalizedPassword)) {
      throw utils.appError(
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

    await authService.register(registrationData);

    return res.status(201).json({
      status: "success",
      message:
        "Registration successful. Please check your email to verify your account.",
    });
  } catch (error) {
    next(error);
  }
};

const verifyEmail = async (req, res, next) => {
  try {
    const { verificationToken } = req.body;

    if (!verificationToken) {
      throw utils.appError("Verification token is required", 400);
    }

    await authService.verifyEmail(verificationToken);

    return res.status(200).json({
      status: "success",
      message: "Email verified successfully. You can now log in",
    });
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { emailAddress, password } = req?.body || {};

    const normalizedEmail = emailAddress?.trim().toLowerCase();
    const normalizedPassword = password || "";

    if (!normalizedEmail) {
      throw utils.appError("Email address is required");
    }

    if (!normalizedPassword.trim()) {
      throw utils.appError("Password cannot be empty", 400);
    }

    const accessToken = await authService.login(
      normalizedEmail,
      normalizedPassword,
    );

    res.cookie("_at", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 1000,
    });

    return res.status(200).json({
      status: "success",
      message: "Login was successful",
    });
  } catch (error) {
    next(error);
  }
};

const logout = async (req, res, next) => {
  try {
    res.clearCookie("_at", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    });

    return res.status(200).json({
      status: "success",
      message: "Logged out successfully",
    });
  } catch (error) {
    next(error);
  }
};

const forgotPassword = async (req, res, next) => {
  try {
    const { emailAddress } = req?.body || {};

    const normalizedEmailAddress = emailAddress?.trim().toLowerCase();
    if (!normalizedEmailAddress) {
      throw utils.appError("Email address is required", 400);
    }

    await authService.sendResetCode(normalizedEmailAddress);

    return res.status(200).json({
      message:
        "If an account with that email exists, a reset code has been sent.",
    });
  } catch (error) {
    next(error);
  }
};

const verifyResetCode = async (req, res, next) => {
  try {
    const { emailAddress, resetCode } = req?.body || {};

    const normalizedEmailAddress = emailAddress?.trim().toLowerCase();
    const normalizedResetCode = resetCode?.trim();

    if (!normalizedEmailAddress) {
      throw utils.appError("Email address is required", 400);
    }

    if (!normalizedResetCode) {
      throw utils.appError("Reset code cannot be empty", 400);
    }

    const { resetToken } = await authService.verifyResetCode(
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

    return res.status(200).json({
      status: "success",
      message: "Reset code verified successfully",
    });
  } catch (error) {
    next(error);
  }
};

const resetPassword = async (req, res, next) => {
  try {
    const resetToken = req?.cookies._rt || undefined;

    const { newPassword } = req?.body || {};

    if (!resetToken) {
      throw utils.appError("Invalid reset session", 400);
    }

    if (!newPassword) {
      throw utils.appError("Password cannot be empty", 400);
    }

    await authService.resetPassword(resetToken, newPassword, req);

    return res
      .status(200)
      .json({ status: "success", message: "Password reset successful" });
  } catch (error) {
    next(error);
  }
};

const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req?.body || {};
    const userId = req.user.id;

    await authService.changePassword(currentPassword, newPassword, userId);

    return res
      .status(200)
      .json({ status: "success", message: "Password changed successfully" });
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

export default {
  register,
  verifyEmail,
  login,
  logout,
  forgotPassword,
  verifyResetCode,
  resetPassword,
  changePassword,
};
