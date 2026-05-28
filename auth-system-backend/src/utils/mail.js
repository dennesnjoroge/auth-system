import crypto from "crypto";
import db from "../config/db.js";

// resend email verification token
export const resendEmailUtil = async (userId) => {
  const verificationToken = crypto.randomBytes(32).toString("hex");
  const verificationTokenHash = crypto
    .createHash("sha256")
    .update(verificationToken)
    .digest("hex");

  const linkExpiryTime = 5;
  const verificationTokenExpiresAt = new Date(
    Date.now() + linkExpiryTime * 60 * 1000,
  );

  await db.execute(
    `UPDATE verification_tokens 
   SET token_hash = ?, 
       expires_at = ?
   WHERE user_id = ?`,
    [verificationTokenHash, verificationTokenExpiresAt, userId],
  );

  return { verificationToken, linkExpiryTime };
};
