import winston from "winston";
import "winston-daily-rotate-file";
import utils from "./utils.js";

/*
EVT_AUTH_LOGIN_SUCCESS: Correct credentials entered.
EVT_AUTH_LOGIN_FAILURE: Wrong password or email.
EVT_AUTH_LOGOUT: Active session destroyed by user.
EVT_AUTH_TOKEN_REFRESH: System extended session using refresh token.
EVT_AUTH_PASSWORD_RESET_REQUEST: User requested a reset link.
EVT_AUTH_PASSWORD_CHANGED: Password successfully updated.
EVT_AUTH_ACCOUNT_LOCKED: Too many failed attempts triggered a lock
*/

// winston logger
const logger = winston.createLogger({
  level: "info",
  format: winston.format.json(),
  transports: [
    //new winston.transports.Console(),
    new winston.transports.DailyRotateFile({
      filename: "logs/security-%DATE%.log",
      datePattern: "YYYY-MM-DD",
      maxSize: "20m",
      maxFiles: "30d",
      zippedArchive: true,

      format: winston.format.combine(
        winston.format((info) => (info.level === "info" ? info : false))(),
        winston.format.json(),
      ),
    }),

    new winston.transports.DailyRotateFile({
      filename: "logs/error-%DATE%.log",
      datePattern: "YYYY-MM-DD",
      level: "error",
      maxSize: "50m",
      maxFiles: "90d",
      zippedArchive: true,
    }),
  ],
});

const triggerSecurityLog = (eventId, status, req, details = {}) => {
  const ip = utils.getClientIP(req);

  logger.info({
    timestamp: new Date().toISOString(),
    event_id: eventId,
    status: status,
    ip_address: ip,
    user_agent: req.headers["user-agent"],
    ...details,
  });
};

const triggerSystemErrorLog = (message, error, req) => {
  const ip = utils.getClientIP(req);

  logger.error({
    message: message,
    error_name: error?.name,
    error_message: error?.message,
    stack: error?.stack, // This is now safe and guaranteed to print
    ip_address: ip,
    url: req?.originalUrl,
    method: req?.method,
  });
};

export default { triggerSecurityLog, triggerSystemErrorLog };
