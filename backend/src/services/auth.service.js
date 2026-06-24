import bcrypt from "bcryptjs";
import crypto from "crypto";
import db from "../config/db.js";
import utils from "../utils/utils.js";
import logger from "../utils/logger.js";
import emailService from "./email.service.js";
import alertService from "./alert.service.js";
import auditEvents from "../constants/auditEvents.js";

const login = async (emailAddress, password, req) => {
  try {
    const [rows] = await db.execute(
      "SELECT * FROM users WHERE email_address = ?",
      [emailAddress],
    );

    if (rows.length === 0) {
      logger.triggerSecurityLog(
        auditEvents.AUDIT_EVENTS.AUTH_LOGIN_FAILED,
        "FAILED",
        req,
        {
          emailAddress,
          reason: auditEvents.AUDIT_REASONS.AUTH.EMAIL_NOT_FOUND,
        },
      );
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
      logger.triggerSecurityLog(
        auditEvents.AUDIT_EVENTS.AUTH_LOGIN_FAILED,
        "FAILED",
        req,
        {
          emailAddress,
          reason: auditEvents.AUDIT_REASONS.AUTH.INVALID_PASSWORD,
        },
      );
      throw utils.appError("Incorrect email or password", 401);
    }

    const [tokenRows] = await db.execute(
      "SELECT expires_at FROM verification_tokens WHERE user_id = ?",
      [user.id],
    );

    const token = tokenRows[0];

    if (user.email_verified === 0) {
      logger.triggerSecurityLog(
        auditEvents.AUDIT_EVENTS.AUTH_LOGIN_FAILED,
        "FAILED",
        req,
        {
          emailAddress: emailAddress,
          reason: auditEvents.AUDIT_REASONS.AUTH.EMAIL_NOT_VERIFIED,
        },
      );

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

    logger.triggerSecurityLog(
      auditEvents.AUDIT_EVENTS.AUTH_LOGIN_SUCCESS,
      "SUCCESS",
      req,
    );

    const { accessToken } = utils.signAccessToken(id);
    const { refreshToken } = utils.signRefreshToken(id);

    // hash refresh token
    const refreshTokenHash = crypto.hash("sha256", refreshToken, "hex");
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    // store hash in db
    await db.execute(
      `INSERT INTO refresh_tokens (user_id, token_hash, expires_at) VALUES (?, ?, ?)`,
      [id, refreshTokenHash, expiresAt],
    );

    const userProfile = utils.buildUserProfile(rows[0]);

    return {
      userProfile,
      accessToken,
      refreshToken,
    };
  } catch (error) {
    throw error;
  }
};

const register = async (
  { firstName, lastName, emailAddress, password },
  req,
) => {
  const connection = await db.getConnection();

  try {
    // start MySQL transaction
    await connection.beginTransaction();

    const [rows] = await connection.execute(
      "SELECT id FROM users WHERE email_address = ?",
      [emailAddress],
    );

    if (rows.length > 0) {
      logger.triggerSecurityLog(
        auditEvents.AUDIT_EVENTS.AUTH_REGISTRATION_FAILED,
        "FAILED",
        req,
        {
          email: emailAddress,
          reason: auditEvents.AUDIT_REASONS.AUTH.EMAIL_CONFLICT,
        },
      );
      throw utils.appError(
        "An account with that email address already exists",
        409,
      );
    }

    // hash password
    const passwordHash = await bcrypt.hash(password, 10);

    const { verificationToken, verificationTokenHash, expiresAt } =
      utils.generateVerificationToken();

    // get user geo-data(ip, location, timezone)
    const { city, country, timezone } = await utils.geoData(req);

    // account expiry-> deleted by cron job
    const accountExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    // insert user in db
    const [result] = await connection.execute(
      `INSERT INTO users (first_name, last_name, email_address, password_hash, city, country, timezone, expires_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        firstName,
        lastName,
        emailAddress,
        passwordHash,
        city,
        country,
        timezone,
        accountExpiresAt,
      ],
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

    logger.triggerSecurityLog(
      auditEvents.AUDIT_EVENTS.AUTH_REGISTRATION_SUCCESS,
      "SUCCESS",
      req,
      { userId },
    );
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

const verifyEmail = async (verificationToken, req) => {
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
      logger.triggerSecurityLog(
        auditEvents.AUDIT_EVENTS.USER_EMAIL_VERIFY,
        "FAILED",
        req,
        { reason: "Expired token" },
      );
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
      `SELECT * FROM users WHERE id = ?`,
      [user_id],
    );

    // throw custom error/ user must exist
    if (userRows.length === 0) {
      const error = new Error("User with token-id reference not found");
      error.statusCode = 500;
      throw error;
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
    } = userRows[0];

    await connection.commit();

    emailService.onboardingEmail(`${first_name} ${last_name}`, email_address);

    // add magic login
    const { accessToken } = utils.signAccessToken(user_id, email_address);
    const { refreshToken } = utils.signRefreshToken(user_id);

    // hash refresh token
    const refreshTokenHash = crypto.hash("sha256", refreshToken, "hex");
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    // store hash in db
    await connection.execute(
      `INSERT INTO refresh_tokens (user_id, token_hash, expires_at) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE token_hash = VALUES(token_hash), expires_at = VALUES(expires_at)`,
      [user_id, refreshTokenHash, expiresAt],
    );

    const userProfile = utils.buildUserProfile(userRows[0]);

    logger.triggerSecurityLog(
      auditEvents.AUDIT_EVENTS.USER_EMAIL_VERIFY,
      "SUCCESS",
      req,
    );

    return {
      userProfile,
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

const logout = async (refreshToken, req) => {
  try {
    // hash refresh token
    const incomingHash = crypto.hash("sha256", refreshToken, "hex");

    // lookup hash in db
    await db.execute(`DELETE FROM refresh_tokens WHERE token_hash = ?`, [
      incomingHash,
    ]);

    logger.triggerSecurityLog(
      auditEvents.AUDIT_EVENTS.AUTH_LOGOUT,
      "SUCCESS",
      req,
    );
  } catch (error) {
    throw error;
  }
};

const forgotPassword = async (emailAddress, req) => {
  try {
    // check user
    const [rows] = await db.execute(
      `SELECT id, first_name, last_name FROM users WHERE email_address = ?`,
      [emailAddress],
    );

    // return silently
    if (rows.length === 0) {
      logger.triggerSecurityLog(
        auditEvents.AUDIT_EVENTS.AUTH_FORGOT_PASSWORD_SEND_LINK,
        "FAILED",
        req,
        {
          email: emailAddress,
          reason: auditEvents.AUDIT_REASONS.AUTH.EMAIL_NOT_FOUND,
        },
      );
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

    logger.triggerSecurityLog(
      auditEvents.AUDIT_EVENTS.AUTH_FORGOT_PASSWORD_SEND_LINK,
      "SUCCESS",
      req,
      { emailAddress },
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
      logger.triggerSecurityLog(
        auditEvents.AUDIT_EVENTS.AUTH_PASSWORD_RESET,
        "FAILED",
        req,
        {
          token: resetToken,
          reason: auditEvents.AUDIT_REASONS.AUTH.TOKEN_EXPIRED,
        },
      );
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
      logger.triggerSecurityLog(
        auditEvents.AUDIT_EVENTS.AUTH_PASSWORD_RESET,
        "FAILED",
        req,
        {
          userId: user_id,
          reason: auditEvents.AUDIT_REASONS.AUTH.USER_NOT_FOUND,
        },
      );
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
    alertService.recordPasswordChange(user_id, req);

    logger.triggerSecurityLog(
      auditEvents.AUDIT_EVENTS.AUTH_PASSWORD_RESET,
      "SUCCESS",
      req,
      { user_id },
    );
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

const changePassword = async (userId, password, req) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();
    // hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // insert new password in db
    await connection.execute(
      `UPDATE users SET password_hash = ? WHERE id = ?`,
      [passwordHash, userId],
    );

    // record password change
    const ipAddress = utils.getClientIP(req);
    const userAgent = req.headers["user-agent"];
    const deviceInfo = utils.parseUserAgent(userAgent);
    const { city, country } = await utils.getLocationFromIP(ipAddress);

    await connection.execute(
      `INSERT INTO password_change_history 
       (user_id, ip_address, city, country, user_agent, device_info)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [userId, ipAddress, city, country, userAgent, deviceInfo],
    );

    const [rows] = await connection.execute(
      `SELECT changed_at FROM password_change_history WHERE user_id = ? ORDER BY changed_at DESC LIMIT 1`,
      [userId],
    );

    await connection.commit();

    logger.triggerSecurityLog(
      auditEvents.AUDIT_EVENTS.AUTH_PASSWORD_CHANGE,
      "SUCCESS",
      req,
    );

    return rows[0];
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

const session = async (userId) => {
  try {
    const [rows] = await db.execute(`SELECT * FROM USERS WHERE id = ?`, [
      userId,
    ]);

    if (rows.length === 0) {
      throw new Error("User not found");
    }

    const user = rows[0];

    return utils.buildUserProfile(user);
  } catch (error) {
    throw error;
  }
};

const refresh = async (refreshToken) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();
    // hash token
    const incomingHash = crypto.hash("sha256", refreshToken, "hex");

    // checkup db
    const [rows] = await connection.execute(
      `SELECT id, user_id, is_used, expires_at FROM refresh_tokens WHERE token_hash = ?`,
      [incomingHash],
    );

    if (rows.length === 0) {
      return { accessToken: null, newRefreshToken: null };
    }

    const { id, user_id, is_used, expires_at } = rows[0];

    // detect token resuse
    if (is_used === true) {
      await connection.execute(`DELETE FROM refresh_tokens WHERE id = ?`, [id]);
      throw new Error(
        "Security Breach: Token reuse detected. Logging out all sessions.",
      );
    }

    if (new Date() > new Date(expires_at)) {
      // Token expired naturally. Just remove it.
      await connection.execute(`DELETE FROM refresh_tokens WHERE id = ?`, [id]);
      return { accessToken: null, newRefreshToken: null };
    }

    // new tokens
    const { accessToken } = utils.signAccessToken(user_id);
    const { refreshToken: newRefreshToken } = utils.signRefreshToken(user_id);
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
  logout,
  forgotPassword,
  resetPassword,
  changePassword,
  session,
  refresh,
};
