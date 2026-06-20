import winston from "winston";
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
    new winston.transports.File({ filename: "logs/security.log" }),
  ],
});

const triggerSecurityLog = (eventId, status, req, details = {}) => {
  const ip = utils.getClientIP(req);

  logger.info({
    timestamp: winston.format.timestamp(),
    event_id: eventId,
    status: status,
    ip_address: ip,
    user_agent: req.headers["user-agent"],
    ...details,
  });
};

export default { triggerSecurityLog };
