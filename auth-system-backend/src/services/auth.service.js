import bcrypt from "bcryptjs";
import crypto, { sign } from "crypto";
import db from "../config/db.js";
import jwt from "jsonwebtoken";
import { sendSignupEmail } from "./email.service.js";

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
    const error = new Error("User not found");
    error.status = 404;
    throw error;
  }

  const user = rows[0];

  const comparePassword = await bcrypt.compare(password, user.password_hash);

  if (!comparePassword) {
    const error = new Error("Wrong password");
    error.status = 404;
    throw error;
  }

  const resendMail = async (email) => {
    const verificationToken = crypto.randomBytes(32).toString("hex");
    const verificationTokenHash = crypto
      .createHash("sha256")
      .update(verificationToken)
      .digest("hex");

    const linkExpirytime = 5;
    const expiresAt = new Date(Date.now() + linkExpirytime * 60 * 1000);

    await db.execute(
      `UPDATE users 
   SET verification_token_hash = ?, 
       verification_token_expires_at = ?
   WHERE email_address = ?`,
      [verificationTokenHash, expiresAt, email],
    );
    return { verificationToken };
  };

  if (user.email_address_verified === 0) {
    if (user.verification_token_expires_at) {
      const expires = new Date(user.verification_token_expires_at);

      if (expires > new Date()) {
        const error = new Error(
          "A verification email was already sent. Check your inbox.",
        );
        error.status = 409;
        throw error;
      }
    }
    let { verificationToken } = await resendMail(user.email_address);
    let verificationLink = `http://${process.env.CLIENT_ORIGIN}/verify?token=${verificationToken}`;
    sendSignupEmail(
      `${user.first_name} ${user.last_name}`,
      user.email_address,
      verificationLink,
    );

    const error = new Error(
      "Email not verified. We have sent a new link to your inbox",
    );
    error.status = 403;
    throw error;
  }

  const signToken = (user) => {
    return jwt.sign(
      { id: user.id, email: user.email_address },
      process.env.JWT_SECRET,
      { expiresIn: "1h" },
    );
  };

  const token = signToken(user);
  return token;
}
