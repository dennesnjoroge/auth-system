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

    const {
      id,
      first_name,
      last_name,
      email_address,
      email_verified,
      role,
      created_at,
      updated_at,
    } = rows[0];

    const userProfile = utils.buildUserProfile(
      id,
      first_name,
      last_name,
      email_address,
      email_verified,
      role,
      created_at,
      updated_at,
    );

    return userProfile;
  } catch (error) {
    throw error;
  }
};

export default { profile };
