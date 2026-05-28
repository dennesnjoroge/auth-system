import bcrypt from "bcryptjs";
import crypto from "crypto";
import db from "../config/db.js";
import jwt from "jsonwebtoken";
import { recordPasswordChange } from "./passwordAlert.service.js";
import { sendOnboardingEmail, sendResetCodeEmail } from "./email.service.js";
import { resendEmailUtil } from "../utils/mail.js";
import { signAccessToken } from "../utils/tokens.js";
import { sendSignupEmail } from "./email.service.js";
import { createAppError } from "../utils/error.js";
import { sendErrorMessage } from "../utils/error.js";

const SALT_ROUNDS = 10;

export const registerUserService = async ({
  normalizedFirstName: firstName,
  normalizedLastName: lastName,
  normalizedEmailAddress: emailAddress,
  normalizedPassword: password,
}) => {
  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();
    const [rows] = await connection.execute(
      "SELECT id FROM users WHERE email_address = ?",
      [emailAddress],
    );

    if (rows.length > 0) {
      throw createAppError(
        "An account with that email address already exists",
        409,
      );
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    const verificationToken = crypto.randomBytes(32).toString("hex");
    const verificationTokenHash = crypto
      .createHash("sha256")
      .update(verificationToken)
      .digest("hex");
    const now = new Date();
    const linkExpiryTime = 5;
    const verificationTokenExpiresAt = new Date(
      now.getTime() + linkExpiryTime * 60 * 1000,
    );

    const verificationLink = `${process.env.CLIENT_ORIGIN}/verify?token=${verificationToken}`;

    const [result] = await connection.execute(
      `INSERT INTO users (first_name, last_name, email_address, password_hash) VALUES (?, ?, ?, ?)`,
      [firstName, lastName, emailAddress, passwordHash],
    );

    const userId = result.insertId;

    await connection.execute(
      `INSERT INTO verification_tokens (user_id, token_hash, expires_at) VALUES (?, ?, ?)`,
      [userId, verificationTokenHash, verificationTokenExpiresAt],
    );

    await connection.commit();

    sendSignupEmail(
      `${firstName} ${lastName}`,
      emailAddress,
      verificationLink,
      linkExpiryTime,
    ).catch((emailError) =>
      console.error("Send SignupEmail Error: ", emailError),
    );

    return;
  } catch (error) {
    await connection.rollback();
    if (error.isAppError) {
      throw error;
    }

    console.error("Registration service Critical Error:", error.message);
    throw createAppError("Internal Server Error", 500);
  } finally {
    connection.release();
  }
};

export async function verifyEmailService(verificationToken) {
  const connection = await db.getConnection();
  try {
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
      throw createAppError("Invalid verification token", 400);
    }

    const token = rows[0];

    if (token.expires_at < new Date()) {
      throw createAppError("Verification token has expired", 400);
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
      throw createAppError("User with that token was not found", 404);
    }

    const user = userRows[0];

    await connection.commit();

    try {
      await sendOnboardingEmail(
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

    throw createAppError("Internal Server Error", 500);
  } finally {
    connection.release();
  }
}

export async function loginUserService(emailAddress, password) {
  try {
    const [rows] = await db.execute(
      "SELECT id, first_name, last_name, email_address, email_verified, password_hash FROM users WHERE email_address = ?",
      [emailAddress],
    );

    if (rows.length === 0) {
      throw createAppError("Incorrect email or password", 401);
    }

    const user = rows[0];

    const comparePassword = await bcrypt.compare(password, user.password_hash);

    if (!comparePassword) {
      throw createAppError("Incorrect email or password", 401);
    }

    const [tokenRows] = await db.execute(
      "SELECT expires_at FROM verification_tokens WHERE user_id = ?",
      [user.id],
    );

    const token = tokenRows[0];

    if (user.email_verified === 0) {
      if (token?.expires_at) {
        if (new Date(token.expires_at).getTime() > Date.now()) {
          throw createAppError(
            "A verification email was already sent. Check your inbox",
            403,
          );
        }
      }

      const { verificationToken, linkExpiryTime } = await resendEmailUtil(
        user.id,
      );
      const verificationLink = `${process.env.CLIENT_ORIGIN}/verify?token=${verificationToken}`;
      sendSignupEmail(
        `${user.first_name} ${user.last_name}`,
        user.email_address,
        verificationLink,
        linkExpiryTime,
      ).catch((emailError) =>
        console.error("Resend verification email Error: ", emailError.message),
      );

      throw createAppError(
        "Email not verified. We have sent a new link to your inbox",
        403,
      );
    }

    return signAccessToken({ id: user.id, email: user.email_address });
  } catch (error) {
    if (error.isAppError) {
      throw error;
    }

    console.error("Login Service Critical Error: ", error.message);
    throw createAppError("Internal Server Error", 500);
  }
}

export const forgotPasswordService = async (emailAddress) => {
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
      `UPDATE users SET reset_code_hash = ?, reset_code_expires_at = ? WHERE id = ?`,
      [codeHash, expiresAt, user.id],
    );

    await sendResetCodeEmail(
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
    throw createAppError("Internal Server Error", 500);
  }
};

export const verifyResetCodeService = async (emailAddress, resetCode) => {
  try {
    const [rows] = await db.execute(
      `SELECT id, reset_code_hash, reset_code_expires_at FROM users WHERE email_address = ? LIMIT 1`,
      [emailAddress],
    );

    if (rows.length === 0) {
      throw createAppError("Invalid reset request", 400);
    }

    const user = rows[0];

    if (!user.reset_code_hash || !user.reset_code_expires_at) {
      throw createAppError("Invalid reset request", 400);
    }

    if (new Date(user.reset_code_expires_at) < new Date()) {
      await db.execute(
        `UPDATE users SET reset_code_hash = ?, reset_code_expires_at = ? WHERE id = ?`,
        [null, null, user.id],
      );

      throw createAppError(
        "Reset code has expired. Please request an new one.",
        400,
      );
    }

    const submittedCodeHash = crypto
      .createHash("sha256")
      .update(resetCode)
      .digest("hex");

    if (submittedCodeHash !== user.reset_code_hash) {
      throw createAppError("Invalid reset code", 400);
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenHash = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    const resetTokenExpiresAt = new Date(Date.now() + 15 * 60 * 1000);

    await db.execute(
      `UPDATE users SET reset_code_hash = ?, reset_code_expires_at = ?, reset_token_hash = ?, reset_token_expires_at = ? WHERE id = ?`,
      [null, null, resetTokenHash, resetTokenExpiresAt, user.id],
    );
  } catch (error) {
    if (error.isAppError) {
      throw error;
    }

    console.error("Verify Reset Code Service Critical Error: ", error.message);
    throw createAppError("Internal Server Error");
  }
};

export const resetPasswordService = async (
  emailAddress,
  resetToken,
  newPassword,
) => {
  const [rows] = await db.execute(
    `SELECT id, first_name, last_name, email_address, reset_token_hash, reset_token_expires_at FROM users WHERE email_address = ? LIMIT 1`,
    [emailAddress],
  );

  if (rows.length === 0) {
    throw createAppError("Invalid reset request", 400);
  }

  const user = rows[0];

  if (!user.reset_token_hash || !user.reset_token_expires_at) {
    throw createAppError("Invalid reset request", 400);
  }

  if (new Date(user.reset_token_expires_at) < new Date()) {
    throw createAppError("Reset token has expired", 400);
  }

  const submittedCodeHash = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  if (submittedCodeHash !== user.reset_token_hash) {
    throw createAppError("Invalid reset token", 400);
  }

  const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

  await db.execute(
    `UPDATE users SET password_hash = ?, reset_token_hash = NULL, reset_token_expires_at = NULL WHERE id = ?`,
    [hashedPassword, user.id],
  );

  const userId = user.id;
  const changeMethod = "Manual";

  await recordPasswordChange({ userId, req, changeMethod });
};

export const changePasswordService = async (
  currentPassword,
  newPassword,
  userId,
) => {
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
      throw createAppError("Wrong password", 400);
    }

    const passwordHash = await bcrypt.hash(newPassword, saltRounds);

    await db.execute(`UPDATE users SET password_hash = ? WHERE id = ?`, [
      passwordHash,
      userId,
    ]);

    const changeMethod = "Manual";

    recordPasswordChange({ userId, req, changeMethod });
  } catch (error) {
    if (error.isAppError) {
      throw error;
    }

    console.error("Change Password Service Critical Error: ", error.message);
    throw createAppError("Internal Server Error", 500);
  }
};
