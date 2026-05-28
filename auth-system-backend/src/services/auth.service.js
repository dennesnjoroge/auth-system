import bcrypt from "bcryptjs";
import crypto, { sign } from "crypto";
import db from "../config/db.js";
import jwt from "jsonwebtoken";
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
    const [rowss] = await db.execute(
      "SELECT id FROM users WHERE email_address = ?",
      [emailAddress],
    );

    if (rows.length > 0) {
      return throwErrorMessage(
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
    const verificationLink = `http://${process.env.CLIENT_ORIGIN}/verify?token=${verificationToken}`;

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

    await sendSignupEmaill(
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
    return throwErrorMessage("Internal Server Error", 500);
  }
};

export async function verifyEmailUser(token) {
  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

  const [rows] = await db.execute(
    "SELECT id, first_name, last_name, email_address, verification_token_expires_at FROM users WHERE verification_token_hash = ?",
    [tokenHash],
  );

  /*if (rows.length === 0) {
    return res.status(400).json({ message: "Invalid verification token" });
  }*/

  if (rows.length === 0) {
    const error = new Error("Invalid verification token");
    error.code = "INVALID_TOKEN";
    throw error;
  }

  const user = rows[0];

  if (new Date(user.verification_token_expires_at) < new Date()) {
    const error = new Error("Token has expired");
    error.code = "EXPIRED_TOKEN";
    throw error;
  }

  await db.execute(
    `UPDATE users SET email_address_verified = 1, verification_token_hash = NULL, verification_token_expires_at = NULL WHERE id = ?`,
    [user.id],
  );
  return user;
}

export async function loginUserService(emailAddress, password) {
  try {
    const [rows] = await db.execute(
      "SELECT id, first_name,last_name, email_address, email_address_verified, password_hash, verification_token_expires_at FROM users WHERE email_address = ?",
      [emailAddress],
    );

    if (rows.length === 0) {
      throw createAppError("Incorrect email or password", 404);
    }

    const user = rows[0];

    const comparePassword = await bcrypt.compare(password, user.password_hash);

    if (!comparePassword) {
      throw createAppError("Incorrect email or password", 404);
    }

    if (user.email_address_verified === 0) {
      if (user.verification_token_expires_at) {
        const expires = new Date(user.verification_token_expires_at);

        if (expires > new Date()) {
          throw createAppError(
            "A verification email was already sent. Check your inbox",
            409,
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
        "Email not verified. We have sent an new link to your inbox",
        403,
      );
    }

    return signAccessToken(user?.id, user?.email_address);
  } catch (error) {
    if (error.isAppError) {
      throw error;
    }

    console.error("Login Service critical error: ", error.message);
    return throwErrorMessage("Internal Server Error", 500);
  }
}
