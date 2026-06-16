import bcrypt from "bcryptjs";
import crypto from "crypto";
import db from "../config/db.js";
import utils from "../utils/utils.js";
import emailService from "./email.service.js";
import alertService from "./alert.service.js";

const login = async (emailAddress, password) => {
  try {
    const [rows] = await db.execute(
      "SELECT * FROM users WHERE email_address = ?",
      [emailAddress],
    );

    if (rows.length === 0) {
      throw utils.appError("Incorrect email or password", 401);
    }

    // destructure user data
    const {
      id,
      first_name,
      last_name,
      email_address,
      email_verified,
      role,
      created_at,
      updated_at,
    } = rows[0]; // for returning

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

      const { verificationToken, linkExpiryTime } = await utils.resendEmail(id);
      emailService.signupEmail(
        `${first_name} ${last_name}`,
        user.email_address,
        verificationToken,
      );

      throw utils.appError(
        "Email not verified. We have sent a new link to your inbox",
        403,
      );
    }

    const accessToken = utils.signAccessToken(id);
    const refreshToken = utils.signRefreshToken(id);
    const refreshTokenHash = crypto.hash("sha256", refreshToken, "hex");
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    // store hash in db
    await db.execute(
      `INSERT INTO refresh_tokens (user_id, token_hash, expires_at) VALUES (?, ?, ?)`,
      [id, refreshTokenHash, expiresAt],
    );

    return {
      id,
      first_name,
      last_name,
      email_address,
      email_verified,
      role,
      created_at,
      updated_at,
      accessToken,
      refreshToken,
    };
  } catch (error) {
    throw error;
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

    // hash incoming token
    const incomingHash = crypto.hash("sha256", verificationToken, "hex");

    const [rows] = await connection.execute(
      "SELECT user_id, expires_at FROM verification_tokens WHERE token_hash = ?",
      [incomingHash],
    );

    if (rows.length === 0) {
      throw utils.appError("Invalid or expired verification token", 400);
    }

    // destructure db data
    const { user_id, expires_at } = rows[0];
    const token = rows[0];

    if (new Date(expires_at).getTime() < Date.now()) {
      // delete expired token
      await connection.execute(
        `DELETE FROM verification_tokens WHERE user_id = ?`,
        [user_id],
      );

      throw utils.appError("Invalid or expired verification token", 400);
    }

    await connection.execute(
      `UPDATE users SET email_verified = ? WHERE id = ?`,
      [1, user_id],
    );

    await connection.execute(
      `DELETE FROM verification_tokens WHERE user_id = ?`,
      [user_id],
    );

    const [userRows] = await connection.execute(
      `SELECT first_name, last_name, email_address, role FROM users WHERE id = ?`,
      [user_id],
    );

    // throw custom error/ user must exist
    if (userRows.length === 0) {
      const error = new Error("User with token-id reference not found");
      error.statusCode = 500;
      throw error;
    }

    // destructure user data
    const { first_name, last_name, email_address, role } = userRows[0];

    await connection.commit();

    emailService.onboardingEmail(`${first_name} ${last_name}`, email_address);

    // add magic login
    const accessToken = utils.signAccessToken(user_id, email_address);
    const refreshToken = utils.signRefreshToken(user_id);

    // hash refresh token
    const refreshTokenHash = crypto.hash("sha256", refreshToken, "hex");
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    // store hash in db
    await connection.execute(
      `INSERT INTO refresh_tokens (user_id, token_hash, expires_at) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE token_hash = VALUES(token_hash), expires_at = VALUES(expires_at)`,
      [user_id, refreshTokenHash, expiresAt],
    );

    return {
      user_id,
      first_name,
      last_name,
      email_address,
      role,
      accessToken,
      refreshToken,
    };
  } catch (error) {
    await connection.rollback();

    throw error;
  } finally {
    connection.release();
  }
};

const forgotPassword = async (emailAddress) => {
  try {
    // check user
    const [rows] = await db.execute(
      `SELECT id, first_name, last_name FROM users WHERE email_address = ?`,
      [emailAddress],
    );

    // return silently
    if (rows.length === 0) {
      return;
    }

    // destructure user data
    const { id, first_name, last_name } = rows[0];

    // generate reset token
    const { resetToken, resetTokenHash, expiresAt } =
      utils.generateresetToken();

    // store token hash in db
    await db.execute(
      `INSERT INTO reset_tokens (user_id, token_hash, expires_at) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE token_hash = VALUES(token_hash), expires_at = VALUES(expires_at)`,
      [id, resetTokenHash, expiresAt],
    );

    emailService.forgotPassword(
      `${first_name} ${last_name}`,
      emailAddress,
      resetToken,
    );
  } catch (error) {
    throw error;
  }
};

const resetPassword = async (resetToken, password, req) => {
  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    // hash incoming token
    const incomingHash = crypto.hash("sha256", resetToken, "hex");

    const [tokenRows] = await connection.execute(
      `SELECT user_id, expires_at FROM reset_tokens WHERE token_hash = ?`,
      [incomingHash],
    );

    if (tokenRows.length === 0) {
      throw utils.appError("Invalid or expired reset token", 400);
    }

    // destructure token data
    const { user_id, expires_at } = tokenRows[0];

    if (new Date(expires_at).getTime() < Date.now()) {
      throw utils.appError("Invalid or expired reset token", 400);
    }

    const [userRows] = await connection.execute(
      `SELECT first_name, last_name FROM users WHERE id = ? FOR UPDATE`,
      [user_id],
    );

    if (userRows.length === 0) {
      const error = new Error("User not found");
      error.statusCode = 500;

      throw error;
    }

    const { first_name, last_name } = userRows[0];

    const passwordHash = await bcrypt.hash(password, 10);

    await connection.execute(
      `UPDATE users SET password_hash = ? WHERE id = ?`,
      [passwordHash, user_id],
    );

    // delete the token
    await connection.execute(`DELETE FROM reset_tokens WHERE token_hash = ?`, [
      incomingHash,
    ]);

    await connection.commit();
    alertService.recordPasswordChange(user_id, req, "Manual");
  } catch (error) {
    await connection.rollback();
    throw error;
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

const refresh = async (userId, refreshToken) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();
    // hash token
    const incomingHash = crypto.hash("sha256", refreshToken, "hex");

    // checkup db
    const [rows] = await db.execute(
      `SELECT id, user_id, is_used, expires_at FROM refresh_tokens WHERE token_hash = ?`,
      [incomingHash],
    );

    if (rows.length === 0) {
      return { accessToken: null, newRefreshToken: null };
    }

    const { id, user_id, is_used, expires_at } = rows[0];

    // detect token resuse
    if (is_used === true) {
      await db.execute(`DELETE FROM refresh_tokens WHERE id = ?`, [id]);
      throw new Error(
        "Security Breach: Token reuse detected. Logging out all sessions.",
      );
    }

    if (new Date() > new Date(expires_at)) {
      // Token expired naturally. Just remove it.
      await db.execute(`DELETE FROM refresh_tokens WHERE id = ?`, [id]);
      return { accessToken: null, newRefreshToken: null };
    }

    // new tokens
    const accessToken = utils.signAccessToken(user_id);
    const newRefreshToken = utils.signRefreshToken(user_id);
    const refreshTokenHash = crypto.hash("sha256", newRefreshToken, "hex");
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    // insert in db
    await connection.execute(
      `INSERT INTO refresh_tokens (user_id, token_hash, expires_at) VALUES (?, ?, ?)`,
      [user_id, refreshTokenHash, expiresAt],
    );

    // mark old token as used
    await connection.execute(
      `UPDATE refresh_tokens SET is_used = ? WHERE id = ?`,
      [1, id],
    );

    await connection.commit();

    return { accessToken, newRefreshToken };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

export default {
  login,
  register,
  verifyEmail,
  forgotPassword,
  resetPassword,
  changePassword,
  refresh,
};
