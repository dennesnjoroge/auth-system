import crypto from "crypto";
import bcrypt from "bcryptjs";
import db from "../config/db.js";
import utils from "../utils/utils.js";
import authService from "../services/auth.service.js";

import validator from "validator";

const saltRounds = 10;

const login = async (req, res, next) => {
  try {
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

const register = async (req, res, next) => {
  try {
    await authService.register(req.body);

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

    await authService.verifyEmail(verificationToken);

    return res.status(200).json({
      status: "success",
      message: "Email verified successfully. You can now log in",
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
    const { emailAddress } = req?.body;

    await authService.forgotPassword(emailAddress);

    return res.status(200).json({
      message:
        "If an account with that email exists, a reset code has been sent.",
    });
  } catch (error) {
    next(error);
  }
};

const resetPassword = async (req, res, next) => {
  try {
    const { resetToken, password } = req.body;

    await authService.resetPassword(resetToken, password, req);

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
  resetPassword,
  changePassword,
};
