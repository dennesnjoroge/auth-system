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

export default { profile };
