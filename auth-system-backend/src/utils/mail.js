import crypto from "crypto";
import db from "../config/db.js";

// resend email verification token
export const resendEmailUtil = async (email) => {
  const verificationToken = crypto.randomBytes(32).toString("hex");
  const verificationTokenHash = crypto
    .createHash("sha256")
    .update(verificationToken)
    .digest("hex");

  const linkExpiryTime = 5;
  const expiresAt = new Date(Date.now() + linkExpiryTime * 60 * 1000);

  await db.execute(
    `UPDATE users 
   SET verification_token_hash = ?, 
       verification_token_expires_at = ?
   WHERE email_address = ?`,
    [verificationTokenHash, expiresAt, email],
  );

  return verificationToken;
};
