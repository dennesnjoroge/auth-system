/**
 * @swagger
 * /api/dashboard:
 *   get:
 *     summary: Get authenticated user dashboard data
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User data retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 user:
 *                   type: object
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /api/update:
 *   post:
 *     summary: Update user profile
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *                 example: John
 *               lastName:
 *                 type: string
 *                 example: Doe
 *               phoneNumber:
 *                 type: string
 *                 example: "0712345678"
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *       401:
 *         description: Unauthorized or user not found
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /api/delete-account:
 *   post:
 *     summary: Permanently delete user account
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Account deleted successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */

import express from "express";
import { auth } from "../auth/auth.js";
import db from "../config/db.js";
import jwt from "jsonwebtoken";
import { sendDeleteAccountEmail } from "../services/email.service.js";

const router = express.Router();

router.get("/dashboard", auth, async (req, res) => {
  try {
    const userId = req.user.id;

    const [rows] = await db.execute("SELECT * FROM users WHERE id = ?", [
      userId,
    ]);

    if (rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const data = rows[0];

    res.json({
      success: true,
      message: "",
      data: data,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/update", auth, async (req, res) => {
  const { firstName, lastName, phoneNumber } = req.body;
  const token = req.cookies.loginToken;

  const decoded = jwt.verify(token, process.env.JWT_SECRET);

  //const userId = req.id;
  const userId = decoded.id;
  //console.log(userId);

  /* return res.status(200).json({
    firstName: firstName,
    lastName: lastName,
    phoneNumber: phoneNumber,
    user_id: userId,
  });*/
  try {
    const [rows] = await db.execute(`SELECT id FROM users WHERE id = ?`, [
      userId,
    ]);

    if (rows.length === 0) {
      return res.status(401).json({ message: "User not found" });
    }

    const user = rows[0];

    if (!phoneNumber) {
      await db.execute(
        `UPDATE users SET first_name = ?, last_name = ? WHERE id = ?`,
        [firstName, lastName, userId],
      );
      return res.status(200).json({ message: "Profile updated successfully" });
    } else {
      await db.execute(
        `UPDATE users SET first_name = ?, last_name = ?, phone_number = ? WHERE id = ?`,
        [firstName, lastName, phoneNumber, userId],
      );
    }

    return res.status(200).json({ message: "Profile updated successfully" });
  } catch (error) {}
});

router.post("/delete-account", auth, async (req, res) => {
  const token = req.cookies.loginToken;
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  const userID = decoded.id;

  try {
    const [currentUserRows] = await db.execute(
      `SELECT first_name, last_name, email_address FROM users WHERE id=?`,
      [userID],
    );

    if (currentUserRows.length === 0) {
      return res.status(404).json({ message: "Email not found" });
    }

    const currentUser = currentUserRows[0];

    await db.execute(
      `INSERT INTO deleted_users(first_name, last_name, email_address, deleted_at) VALUES (?, ?, ?, NOW())`,
      [
        currentUser.first_name,
        currentUser.last_name,
        currentUser.email_address,
      ],
    );

    await db.execute(`DELETE FROM users WHERE id = ?`, [userID]);

    const name = `${currentUser.first_name} ${currentUser.last_name}`;
    const email = currentUser.email_address;

    // send deletion email here --
    await sendDeleteAccountEmail(name, email);

    return res.status(200).json({ message: "Account deleted successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
});

export default router;
