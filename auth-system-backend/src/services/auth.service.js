import bcrypt from "bcryptjs";
import crypto, { sign } from "crypto";
import db from "../config/db.js";
import jwt from "jsonwebtoken";
import { sendOnboardingEmail } from "./email.service.js";
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
  try {
    const [rows] = await db.execute(
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
    const linkExpiryTime = 5;
    const expiresAt = new Date(Date.now() + linkExpiryTime * 60 * 1000);
    const verificationLink = `${process.env.CLIENT_ORIGIN}/verify?token=${verificationToken}`;

    await db.execute(
      `INSERT INTO users (
      first_name,
      last_name,
      email_address,
      password_hash,
      verification_token_hash,
      verification_token_expires_at
    ) VALUES (?, ?, ?, ?, ?, ?)`,
      [
        firstName,
        lastName,
        emailAddress,
        passwordHash,
        verificationTokenHash,
        expiresAt,
      ],
    );

    await sendSignupEmail(
      `${firstName} ${lastName}`,
      emailAddress,
      verificationLink,
      linkExpiryTime,
    );

    return;
  } catch (error) {
    if (error.isAppError) {
      throw error;
    }

    console.error("Registration service Critical Error:", error.message);
    throw createAppError("Internal Server Error", 500);
  }
};

export async function verifyEmailService(verificationToken) {
  try {
    const verificationTokenHash = crypto
      .createHash("sha256")
      .update(verificationToken)
      .digest("hex");

    const [rows] = await db.execute(
      "SELECT id, first_name, last_name, email_address, verification_token_expires_at FROM users WHERE verification_token_hash = ?",
      [verificationTokenHash],
    );

    if (rows.length === 0) {
      throw createAppError("Invalid verification token", 400);
    }

    const user = rows[0];

    if (new Date(user.verification_token_expires_at) < new Date()) {
      throw createAppError("Verification token has expired", 400);
    }

    await db.execute(
      `UPDATE users SET email_address_verified = ?, verification_token_hash = ?, verification_token_expires_at = ? WHERE id = ?`,
      [true, null, null, user.id],
    );

    const { first_name, last_name, email_address } = user;
    await sendOnboardingEmail(`${first_name} ${last_name}`, email_address);
  } catch (error) {
    if (error.isAppError) {
      throw error;
    }

    console.error(
      `Email Verification Service Critical Error: ${error.message}`,
    );

    throw createAppError("Internal Server Error", 500);
  }
}

export async function loginUserService(emailAddress, password) {
  try {
    const [rows] = await db.execute(
      "SELECT id, first_name,last_name, email_address, email_address_verified, password_hash, verification_token_expires_at FROM users WHERE email_address = ?",
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

    if (user.email_address_verified === 0) {
      if (user.verification_token_expires_at) {
        const expires = new Date(user.verification_token_expires_at);

        if (expires > new Date()) {
          throw createAppError(
            "A verification email was already sent. Check your inbox",
            403,
          );
        }
      }

      const { verificationToken, linkExpiryTime } = await resendEmailUtil(
        user?.email_address,
      );
      const verificationLink = `${process.env.CLIENT_ORIGIN}/verify?token=${verificationToken}`;
      await sendSignupEmail(
        `${user?.first_name} ${user?.last_name}`,
        user.email_address,
        verificationLink,
        linkExpiryTime,
      );

      throw createAppError(
        "Email not verified. We have sent a new link to your inbox",
        403,
      );
    }

    return signAccessToken(user?.id, user?.email_address);
  } catch (error) {
    if (error.isAppError) {
      throw error;
    }

    console.error("Login Service Critical Error: ", error.message);
    throw createAppError("Internal Server Error", 500);
  }
}
