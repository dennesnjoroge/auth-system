import bcrypt from "bcryptjs";
import crypto, { sign } from "crypto";
import db from "../config/db.js";
import jwt from "jsonwebtoken";
import { resendEmailUtil } from "../utils/mail.js";
import { signAccessToken } from "../utils/tokens.js";
import { sendSignupEmail } from "./email.service.js";
import { throwErrorMessage } from "../utils/error.js";
import { sendErrorMessage } from "../utils/error.js";

const SALT_ROUNDS = 10;

export async function createUser({
  firstName,
  lastName,
  emailAddress,
  password,
}) {
  const [existingUsers] = await db.execute(
    "SELECT id FROM users WHERE email_address = ?",
    [emailAddress],
  );

  if (existingUsers.length > 0) {
    const error = new Error("Email already exists");
    error.code = "EMAIL_EXISTS";
    throw error;
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

  const verificationToken = crypto.randomBytes(32).toString("hex");
  const verificationTokenHash = crypto
    .createHash("sha256")
    .update(verificationToken)
    .digest("hex");

  const linkExpirytime = 5;
  const expiresAt = new Date(Date.now() + linkExpirytime * 60 * 1000);

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

  return { verificationToken, linkExpirytime };
}

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

export async function logUserIn(emailAddress, password) {
  const [rows] = await db.execute(
    "SELECT id, first_name,last_name, email_address, email_address_verified, password_hash, verification_token_expires_at FROM users WHERE email_address = ?",
    [emailAddress],
  );

  if (rows.length === 0) {
    return throwErrorMessage("User with that Email was not found", 404);
  }

  const user = rows[0];

  const comparePassword = await bcrypt.compare(password, user.password_hash);

  if (!comparePassword) {
    return throwErrorMessage("Wrong password", 404);
  }

  if (user.email_address_verified === 0) {
    if (user.verification_token_expires_at) {
      const expires = new Date(user.verification_token_expires_at);

      if (expires > new Date()) {
        return throwErrorMessage(
          "A verification email was already sent. Check your inbox",
          409,
        );
      }
    }

    const verificationToken = await resendEmailUtil(user?.email_address);
    const verificationLink = `http://${process.env.CLIENT_ORIGIN}/verify?token=${verificationToken}`;
    await sendSignupEmail(
      `${user?.first_name || "User"} ${user?.last_name || ""}`,
      user.email_address,
      verificationLink,
    );

    return throwErrorMessage(
      "Email not verified. We have sent a new link to your inbox",
      403,
    );
  }

  if (!process.env.JWT_SECRET) {
    console.error("ENV Variable Error: JWT Secret is missing");

    return throwErrorMessage("Internal server error", 500);
  }

  return signAccessToken(user?.id, user?.email_address);
}
