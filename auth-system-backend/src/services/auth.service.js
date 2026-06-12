import bcrypt from "bcryptjs";
import crypto from "crypto";
import db from "../config/db.js";
import jwt from "jsonwebtoken";
import utils from "../utils/utils.js";
import emailService from "./email.service.js";
import alertService from "./alert.service.js";

const SALT_ROUNDS = 10;

const login = async (emailAddress, password) => {
  try {
    const [rows] = await db.execute(
      "SELECT id, first_name, last_name, email_address, email_verified, password_hash FROM users WHERE email_address = ?",
      [emailAddress],
    );

    if (rows.length === 0) {
      throw utils.appError("Incorrect email or password", 401);
    }

    const user = rows[0];

    const comparePassword = await bcrypt.compare(password, user.password_hash);

    if (!comparePassword) {
      throw utils.appError("Incorrect email or password", 401);
    }

    const [tokenRows] = await db.execute(
      "SELECT expires_at FROM verification_tokens WHERE user_id = ?",
      [user.id],
    );

    const token = tokenRows[0];

    if (user.email_verified === 0) {
      if (token?.expires_at) {
        if (new Date(token.expires_at).getTime() > Date.now()) {
          throw utils.appError(
            "A verification email was already sent. Check your inbox",
            403,
          );
        }
      }

      const { verificationToken, linkExpiryTime } = await utils.resendEmail(
        user.id,
      );
      const verificationLink = `${process.env.CLIENT_ORIGIN}/verify?token=${verificationToken}`;
      emailService
        .signupEmail(
          `${user.first_name} ${user.last_name}`,
          user.email_address,
          verificationLink,
          linkExpiryTime,
        )
        .catch((emailError) =>
          console.error(
            "Resend verification email Error: ",
            emailError.message,
          ),
        );

      throw utils.appError(
        "Email not verified. We have sent a new link to your inbox",
        403,
      );
    }

    return utils.signAccessToken({ id: user.id, email: user.email_address });
  } catch (error) {
    if (error.isAppError) {
      throw error;
    }

    console.error("Login Service Critical Error: ", error.message);
    throw utils.appError("Internal Server Error", 500);
  }
};

const register = async ({ firstName, lastName, emailAddress, password }) => {
  const connection = await db.getConnection();

  try {
    // start MySQL transaction
    await connection.beginTransaction();

    const [rows] = await connection.execute(
      "SELECT id FROM users WHERE email_address = ?",
      [emailAddress],
    );

    if (rows.length > 0) {
      throw utils.appError(
        "An account with that email address already exists",
        409,
      );
    }

    // hash password
    const passwordHash = await bcrypt.hash(password, 10);

    const { verificationToken, verificationTokenHash, expiresAt } =
      utils.generateVerificationToken();

    // insert user in db
    const [result] = await connection.execute(
      `INSERT INTO users (first_name, last_name, email_address, password_hash) VALUES (?, ?, ?, ?)`,
      [firstName, lastName, emailAddress, passwordHash],
    );

    const userId = result.insertId;

    // insert verification token in db
    await connection.execute(
      `INSERT INTO verification_tokens (user_id, token_hash, expires_at) VALUES (?, ?, ?)`,
      [userId, verificationTokenHash, expiresAt],
    );

    await connection.commit();

    emailService.signupEmail(
      `${firstName} ${lastName}`,
      emailAddress,
      verificationToken,
    );

    return;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

const verifyEmail = async (verificationToken) => {
  // get mysql transaction
  const connection = await db.getConnection();
  try {
    // start mysql transaction
    await connection.beginTransaction();

    const verificationTokenHash = crypto
      .createHash("sha256")
      .update(verificationToken)
      .digest("hex");

    const [rows] = await connection.execute(
      "SELECT id, user_id, expires_at FROM verification_tokens WHERE token_hash = ?",
      [verificationTokenHash],
    );

    if (rows.length === 0) {
      throw utils.appError("Invalid verification token", 400);
    }

    const token = rows[0];

    if (token.expires_at < new Date()) {
      throw utils.appError("Verification token has expired", 400);
    }

    await connection.execute(
      `UPDATE users SET email_verified = ? WHERE id = ?`,
      [1, token.user_id],
    );

    await connection.execute(
      `DELETE FROM verification_tokens WHERE user_id = ?`,
      [token.user_id],
    );

    const [userRows] = await connection.execute(
      `SELECT first_name, last_name, email_address FROM users WHERE id = ?`,
      [token.user_id],
    );

    if (userRows.length === 0) {
      throw utils.appError("User with that token was not found", 404);
    }

    const user = userRows[0];

    await connection.commit();

    try {
      emailService.onboardingEmail(
        `${user.first_name} ${user.last_name}`,
        user.email_address,
      );
    } catch (emailError) {
      console.error(
        "Send Onboarding Email Critical Error: ",
        emailError.message,
      );
    }
  } catch (error) {
    await connection.rollback();
    if (error.isAppError) {
      throw error;
    }

    console.error(
      `Email Verification Service Critical Error: ${error.message}`,
    );

    throw utils.appError("Internal Server Error", 500);
  } finally {
    connection.release();
  }
};

const sendResetCode = async (emailAddress) => {
  try {
    const [rows] = await db.execute(
      `SELECT id, first_name, last_name FROM users WHERE email_address = ?`,
      [emailAddress],
    );

    if (rows.length === 0) {
      return;
    }

    const user = rows[0];

    const code = crypto.randomInt(100000, 1000000).toString();
    const codeHash = crypto.createHash("sha256").update(code).digest("hex");
    const codeExpiryTime = 5;
    const expiresAt = new Date(Date.now() + codeExpiryTime * 60 * 1000);

    await db.execute(
      `INSERT INTO reset_codes (user_id, code_hash, expires_at) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE code_hash = VALUES(code_hash), expires_at = VALUES(expires_at)`,
      [user.id, codeHash, expiresAt],
    );

    emailService.resetCodeEmail(
      `${user.first_name} ${user.last_name}`,
      emailAddress,
      code,
      codeExpiryTime,
    );
  } catch (error) {
    if (error.isAppError) {
      throw error;
    }

    console.error("Critical Forgot password service error", error.message);
    throw utils.appError("Internal Server Error", 500);
  }
};

const verifyResetCode = async (emailAddress, resetCode) => {
  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    const [rows] = await connection.execute(
      `SELECT id FROM users WHERE email_address = ?`,
      [emailAddress],
    );

    if (rows.length === 0) {
      throw utils.appError("Invalid reset request", 400);
    }

    const user = rows[0];

    const [codeRows] = await connection.execute(
      `SELECT code_hash, expires_at FROM reset_codes WHERE user_id = ? AND code_hash IS NOT NULL FOR UPDATE`,
      [user.id],
    );

    if (codeRows.length === 0) {
      throw utils.appError("Invalid reset request", 400);
    }

    const code = codeRows[0];

    if (new Date(code.expires_at).getTime() < Date.now()) {
      await connection.execute(`DELETE FROM reset_codes WHERE user_id = ?`, [
        user.id,
      ]);

      throw utils.appError(
        "Reset code has expired. Please request a new one.",
        401,
      );
    }

    const submittedCodeHash = crypto
      .createHash("sha256")
      .update(resetCode)
      .digest("hex");

    if (submittedCodeHash !== code.code_hash) {
      throw utils.appError("Invalid reset code", 400);
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenHash = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    const resetTokenExpiresAt = new Date(Date.now() + 15 * 60 * 1000);

    await connection.execute(
      `INSERT into reset_tokens (user_id, token_hash, expires_at) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE token_hash = VALUES(token_hash), expires_at = VALUES(expires_at)`,
      [user.id, resetTokenHash, resetTokenExpiresAt],
    );

    await connection.execute(`DELETE FROM reset_codes WHERE user_id = ?`, [
      user.id,
    ]);

    await connection.commit();

    return { resetToken };
  } catch (error) {
    await connection.rollback();

    if (error.isAppError) {
      throw error;
    }

    console.error("Verify Reset Code Service Critical Error: ", error.message);
    throw utils.appError("Internal Server Error");
  } finally {
    connection.release();
  }
};

const resetPassword = async (resetToken, newPassword, req) => {
  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    const clientTokenHash = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    const [tokenRows] = await connection.execute(
      `SELECT user_id, expires_at FROM reset_tokens WHERE token_hash = ?`,
      [clientTokenHash],
    );

    if (tokenRows.length === 0) {
      throw utils.appError("Invalid reset request", 400);
    }

    const token = tokenRows[0];

    if (new Date(token.expires_at).getTime() < Date.now()) {
      throw utils.appError("Reset token has expired", 401);
    }

    const [userRows] = await connection.execute(
      `SELECT first_name, last_name FROM users WHERE id = ? FOR UPDATE`,
      [token.user_id],
    );

    if (userRows.length === 0) {
      throw utils.appError("Invalid reset request", 400);
    }

    const user = userRows[0];

    const passwordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);

    await connection.execute(
      `UPDATE users SET password_hash = ? WHERE id = ?`,
      [passwordHash, token.user_id],
    );

    const userId = token.user_id;
    const changeMethod = "Manual";

    await connection.execute(`DELETE FROM reset_tokens WHERE user_id = ?`, [
      userId,
    ]);

    await connection.commit();
    alertService.recordPasswordChange({ userId, req, changeMethod });
  } catch (error) {
    await connection.rollback();
    if (error.isAppError) {
      throw error;
    }

    console.error("Reset password Service Error: ", error);
    throw utils.appError("Internal Server Error", 500);
  } finally {
    connection.release();
  }
};

const changePassword = async (currentPassword, newPassword, userId) => {
  try {
    const [rows] = await db.execute(
      `SELECT password_hash FROM users WHERE id = ?`,
      [userId],
    );

    const user = rows[0];

    const comparePassword = await bcrypt.compare(
      currentPassword,
      user.password_hash,
    );

    if (!comparePassword) {
      throw utils.appError("Wrong password", 400);
    }

    const passwordHash = await bcrypt.hash(newPassword, saltRounds);

    await db.execute(`UPDATE users SET password_hash = ? WHERE id = ?`, [
      passwordHash,
      userId,
    ]);

    const changeMethod = "Manual";

    alertService.recordPasswordChange({ userId, req, changeMethod });
  } catch (error) {
    if (error.isAppError) {
      throw error;
    }

    console.error("Change Password Service Critical Error: ", error.message);
    throw utils.appError("Internal Server Error", 500);
  }
};

export default {
  register,
  verifyEmail,
  login,
  sendResetCode,
  verifyResetCode,
  resetPassword,
  changePassword,
};
