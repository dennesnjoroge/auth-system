import pool from "../config/db.js";
import cron from "node-cron";

const deleteUserProfile = cron.schedule("0 * * * *", async () => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const [expiredUsers] = await connection.execute(
      `SELECT id FROM users WHERE expires_at < UTC_TIMESTAMP() LIMIT 500`,
    );

    if (expiredUsers.length === 0) {
      await connection.commit();
      return;
    }

    const idsToArchive = expiredUsers.map((user) => user.id);

    const placeholders = idsToArchive.map(() => "?").join(",");

    await connection.execute(
      `
      INSERT INTO archive1 (first_name, last_name, email_address, city, country, timezone)
      SELECT first_name, last_name, email_address, city, country, timezone
      FROM users 
      WHERE id IN (${placeholders})
    `,
      idsToArchive,
    );

    const [result] = await connection.execute(
      `
      DELETE FROM users 
      WHERE id IN (${placeholders})
    `,
      idsToArchive,
    );

    await connection.commit();
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
});

export default deleteUserProfile;
