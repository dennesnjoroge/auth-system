const AUDIT_EVENTS = {
  /*
EVT_AUTH_LOGIN_SUCCESS: Correct credentials entered.
EVT_AUTH_LOGIN_FAILURE: Wrong password or email.
EVT_AUTH_LOGOUT: Active session destroyed by user.
EVT_AUTH_TOKEN_REFRESH: System extended session using refresh token.
EVT_AUTH_PASSWORD_RESET_REQUEST: User requested a reset link.
EVT_AUTH_PASSWORD_CHANGED: Password successfully updated.
EVT_AUTH_ACCOUNT_LOCKED: Too many failed attempts triggered a lock
*/

  // Authentication Domain (1000 - 1999)
  AUTH_LOGIN_SUCCESS: "AUTH_1001",
  AUTH_LOGIN_FAILED: "AUTH_1002",
  AUTH_LOGOUT: "AUTH_1003",
  AUTH_PASSWORD_RESET: "AUTH_1004",

  // User Management Domain (2000 - 2999)
  USER_PROFILE_UPDATE: "USER_2001",
  USER_EMAIL_VERIFY: "USER_2002",

  // Security / System Domain (3000 - 3999)
  SEC_XSS_ATTEMPT: "SEC_3001",
  SEC_RATE_LIMIT: "SEC_3002",
};

const AUDIT_REASONS = {
  AUTH: {
    EMAIL_NOT_FOUND: "ERR_AUTH_01",
    INVALID_PASSWORD: "ERR_AUTH_02",
    ACCOUNT_LOCKED: "ERR_AUTH_03",
    MFA_REQUIRED: "ERR_AUTH_04",
    TOKEN_EXPIRED: "ERR_AUTH_05",
  },
  SYSTEM: {
    RATE_LIMIT_EXCEEDED: "ERR_SYS_01",
    DATABASE_TIMEOUT: "ERR_SYS_02",
  },
};

export default { AUDIT_EVENTS, AUDIT_REASONS };
