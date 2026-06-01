import {
  getClientIP,
  parseUserAgent,
  getLocationFromIP,
} from "../utils/ip.util.js";
import db from "../config/db.js";
import { sendPasswordChangedAlert } from "./email.service.js";

export async function recordPasswordChange({ userId, req, changeMethod }) {
  const ipAddress = getClientIP(req);
  const userAgent = req.headers["user-agent"];
  const deviceInfo = parseUserAgent(userAgent);
  const location = await getLocationFromIP(ipAddress);

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

  await sendPasswordChangedAlert({
    email,
    name,
    timestamp: new Date(),
    ipAddress,
    deviceInfo,
    location,
  });
}
