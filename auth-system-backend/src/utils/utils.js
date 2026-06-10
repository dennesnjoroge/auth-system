import jwt from "jsonwebtoken";
import crypto from "crypto";
import db from "../config/db.js";

// create app error
const appError = (message, statusCode) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  error.isAppError = true;
  return error;
};

// sign access token
const signAccessToken = (id, email) => {
  return jwt.sign({ sub: id, email: email }, process.env.JWT_SECRET, {
    expiresIn: "1h",
  });
};

// password regex utility function
const passwordRegex = (password) => {
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).+$/;
  return passwordRegex.test(password);
};

// ip address utility functions
const getClientIP = (req) => {
  return (
    req.headers["x-forwarded-for"]?.split(",")[0]?.trim() ||
    req.headers["x-real-ip"] ||
    req.socket?.remoteAddress ||
    "Unknown"
  );
};

const parseUserAgent = (userAgent) => {
  if (!userAgent) return "Unknown Device";

  const isMobile = /mobile|android|iphone|ipad/i.test(userAgent);
  const browser = userAgent.includes("Chrome")
    ? "Chrome"
    : userAgent.includes("Firefox")
      ? "Firefox"
      : userAgent.includes("Safari")
        ? "Safari"
        : "Unknown";

  return `${isMobile ? "Mobile" : "Desktop"} - ${browser} `;
};

const getLocationFromIP = async (ip) => {
  if (ip === "Unknown" || ip.startsWith("127.") || ip.startsWith("192.168.")) {
    return "Local Network";
  }

  try {
    const response = await fetch(`https://ipapi.co/${ip}/json/`);
    const data = await response.json();
    return `${data.city || "Unknown"}, ${data.country_name || "Unknown"}`;
  } catch (error) {
    return "Unknown Location";
  }
};

const resendEmail = async (userId) => {
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

export default {
  appError,
  signAccessToken,
  passwordRegex,
  getClientIP,
  parseUserAgent,
  getLocationFromIP,
  resendEmail,
};
