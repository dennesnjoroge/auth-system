import crypto from "crypto";
import bcrypt from "bcryptjs";
import db from "../config/db.js";
import utils from "../utils/utils.js";
import authService from "../services/auth.service.js";

import validator from "validator";

const login = async (req, res, next) => {
  try {
    const { emailAddress, password } = req.body;
    const { userProfile, accessToken, refreshToken } = await authService.login(
      emailAddress,
      password,
    );

    res.cookie("_at", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 15 * 60 * 1000,
    });

    res.cookie("_rt", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      status: "success",
      message: "Login was successful",
      payload: userProfile,
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

    const { userProfile, accessToken, refreshToken } =
      await authService.verifyEmail(verificationToken);

    res.cookie("_at", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 15 * 60 * 1000,
    });

    res.cookie("_rt", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      status: "success",
      message: "Email verified successfully",
      payload: userProfile,
    });
  } catch (error) {
    next(error);
  }
};

const logout = async (req, res, next) => {
  try {
    const { refreshToken } = req.user;

    await authService.logout(refreshToken);

    res.clearCookie("_at", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    });

    res.clearCookie("_rt", {
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

const session = async (req, res, next) => {
  try {
    const { userId } = req.user;

    const session = await authService.session(userId);

    res.status(200).json({
      status: "success",
      payload: session,
    });
  } catch (error) {
    next(error);
  }
};

const refresh = async (req, res, next) => {
  try {
    const { refreshToken } = req.refreshToken;

    const result = await authService.refresh(refreshToken);

    if (!result || !result.accessToken || !result.newRefreshToken) {
      res.clearCookie("_at");
      res.clearCookie("_rt");

      return res.status(401).json({
        status: "fail",
        message: "Session expired or invalid. Please log in again.",
      });
    }

    const { accessToken, newRefreshToken } = result;

    res.cookie("_at", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 15 * 60 * 1000,
    });

    res.cookie("_rt", newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.sendStatus(200);
  } catch (error) {
    next(error);
  }
};

export default {
  register,
  verifyEmail,
  login,
  logout,
  forgotPassword,
  resetPassword,
  changePassword,
  session,
  refresh,
};
