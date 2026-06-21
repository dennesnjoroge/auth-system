import db from "../config/db.js";
import utils from "../utils/utils.js";

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

export default { profile, settings };
