import jwt from "jsonwebtoken";
import crypto from "crypto";
import db from "../config/db.js";

// create app error
const appError = (message, statusCode, errors = null) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  error.errors = errors;
  error.isAppError = true;
  return error;
};

const buildUserProfile = ({
  id: userId,
  first_name: firstName,
  last_name: lastName,
  email_address: emailAddress,
  email_verified: emailVerified,
  role,
  city,
  country,
  timezone,
  created_at: createdAt,
  updated_at: updatedAt,
}) => {
  const userProfile = {
    userId,
    firstName,
    lastName,
    emailAddress,
    emailVerified: emailVerified ? true : false,
    role,
    city,
    country,
    timezone,
    createdAt,
    updatedAt,
  };
  return userProfile;
};

// sign access token
const signAccessToken = (id) => {
  const accessTokenJti = crypto.randomUUID();
  const accessToken = jwt.sign(
    { sub: id, jti: accessTokenJti },
    process.env.JWT_SECRET,
    {
      expiresIn: "15m",
    },
  );

  return { accessToken };
};

const signRefreshToken = (id) => {
  const refreshTokenJti = crypto.randomUUID();
  const refreshToken = jwt.sign(
    { sub: id, jti: refreshTokenJti },
    process.env.JWT_SECRET,
    {
      expiresIn: "7d",
    },
  );
  return { refreshToken };
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
  if (!ip || ip === "Unknown") return "Unknown Network";

  const privateIpRegex =
    /^(localhost|127\.\d+\.\d+\.\d+|10\.\d+\.\d+\.\d+|192\.168\.\d+\.\d+|172\.(1[6-9]|2\d|3[0-1])\.\d+\.\d+|::1|::ffff:127\.\d+\.\d+\.\d+|::ffff:10\.\d+\.\d+\.\d+|::ffff:192\.168\.\d+\.\d+|::ffff:172\.(1[6-9]|2\d|3[0-1])\.\d+\.\d+)$/;

  if (privateIpRegex.test(ip.trim())) {
    const city = "Unknown";
    const country = "Unknown";
    const timezone = "Unknown";

    return { city, country, timezone };
  }

  try {
    const response = await fetch(`http://ip-api.com/json/${ip}`);
    const data = await response.json();

    const city = data.city || "Unknown";
    const country = data.country || "Unknown";
    const timezone = data.timezone || "Unknown";

    return { city, country, timezone };
  } catch (error) {
    const city = "Unknown";
    const country = "Unknown";
    const timezone = "Unknown";

    return { city, country, timezone };
  }
};

const geoData = async (req) => {
  const userIp = getClientIP(req);
  const { city, country, timezone } = await getLocationFromIP(userIp);

  return { city, country, timezone };
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

const generateVerificationToken = () => {
  const verificationToken = crypto.randomBytes(32).toString("hex");
  const verificationTokenHash = crypto.hash("sha256", verificationToken, "hex");
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

  return { verificationToken, verificationTokenHash, expiresAt };
};

const generateresetToken = () => {
  const resetToken = crypto.randomBytes(32).toString("hex");
  const resetTokenHash = crypto.hash("sha256", resetToken, "hex");
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

  return { resetToken, resetTokenHash, expiresAt };
};

export default {
  appError,
  buildUserProfile,
  signAccessToken,
  signRefreshToken,
  passwordRegex,
  getClientIP,
  parseUserAgent,
  getLocationFromIP,
  geoData,
  resendEmail,
  generateVerificationToken,
  generateresetToken,
};
