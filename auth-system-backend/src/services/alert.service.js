import utils from "../utils/utils.js";
import db from "../config/db.js";
import emailService from "./email.service.js";

const recordPasswordChange = async ({ userId, req, changeMethod }) => {
  const ipAddress = utils.getClientIP(req);
  const userAgent = req.headers["user-agent"];
  const deviceInfo = utils.parseUserAgent(userAgent);
  const location = await utils.getLocationFromIP(ipAddress);

  await db.execute(
    `INSERT INTO password_change_history 
   (user_id, ip_address, user_agent, device_info, location, change_method)
   VALUES (?, ?, ?, ?, ?, ?)`,
    [userId, ipAddress, userAgent, deviceInfo, location, changeMethod],
  );

  const [rows] = await db.execute(
    `SELECT first_name, last_name, email_address FROM users WHERE id = ?`,
    [userId],
  );

  const email = rows[0].email_address;
  const name = `${rows[0].first_name} ${rows[0].last_name}`;

  emailService.passwordChangedEmail({
    email,
    name,
    timestamp: new Date(),
    ipAddress,
    deviceInfo,
    location,
  });
};

export default { recordPasswordChange };
