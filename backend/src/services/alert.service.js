import utils from "../utils/utils.js";
import db from "../config/db.js";
import emailService from "./email.service.js";

const recordPasswordChange = async (userId, req) => {
  try {
    const ipAddress = utils.getClientIP(req);

    const userAgent = req.headers["user-agent"];
    const deviceInfo = utils.parseUserAgent(userAgent);
    const { city, country } = await utils.getLocationFromIP(ipAddress);

    await db.execute(
      `INSERT INTO password_change_history 
   (user_id, ip_address, city, country, user_agent, device_info)
   VALUES (?, ?, ?, ?, ?, ?)`,
      [userId, ipAddress, city, country, userAgent, deviceInfo],
    );

    const [rows] = await db.execute(
      `SELECT first_name, last_name, email_address FROM users WHERE id = ?`,
      [userId],
    );

    const { first_name, last_name, email_address } = rows[0];

    emailService.passwordAlert(
      email_address,
      `${first_name} ${last_name}`,
      new Date(),
      ipAddress,
      deviceInfo,
      city,
      country,
    );
  } catch (error) {
    throw error;
  }
};

export default { recordPasswordChange };
