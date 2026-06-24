import db from "../config/db.js";
import auditEvents from "../constants/auditEvents.js";
import logger from "../utils/logger.js";
import utils from "../utils/utils.js";
import emailService from "./email.service.js";

const profile = async (userId) => {
  try {
    const [rows] = await db.execute(`SELECT * FROM users WHERE id = ?`, [
      userId,
    ]);

    if (rows.length === 0) {
      throw utils.appError("User information not found", 404);
    }

    const user = rows[0];

    return utils.buildUserProfile(user);
  } catch (error) {
    throw error;
  }
};

const settings = async (userId) => {
  const [rows] = await db.execute(
    `SELECT changed_at FROM password_change_history WHERE user_id = ? ORDER BY changed_at DESC LIMIT 1`,
    [userId],
  );

  return rows[0];
};

const deleteAccount = async (userId, req) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    const [rows] = await connection.execute(
      `SELECT first_name, last_name, email_address FROM users WHERE id = ?`,
      [userId],
    );

    const { first_name, last_name, email_address } = rows[0];

    await connection.execute(
      `INSERT INTO archive (first_name, last_name, email_address, ip) VALUES (?, ?, ?, ?)`,
      [first_name, last_name, email_address, utils.getClientIP(req)],
    );

    await connection.execute(`DELETE FROM users WHERE id = ?`, [userId]);

    await connection.commit();

    emailService.deleteAccountEmail(
      `${first_name} ${last_name}`,
      email_address,
    );

    logger.triggerSecurityLog(
      auditEvents.AUDIT_EVENTS.USER_ACCOUNT_DELETION,
      "SUCCESS",
      req,
    );
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

export default { profile, settings, deleteAccount };
