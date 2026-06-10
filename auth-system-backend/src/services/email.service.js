import nodemailer from "nodemailer";

import {
  verifyEmailTemplate,
  accountDeletedTemplate,
  onboardingTemplate,
  passwordChangeTemplate,
  resetCodeTemplate,
} from "./templates/email.js";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const signupEmail = async (
  fullName,
  emailAddress,
  verificationLink,
  linkExpiryTime,
) => {
  try {
    const html = verifyEmailTemplate(
      fullName,
      verificationLink,
      emailAddress,
      linkExpiryTime,
    );
    await transporter.sendMail({
      from: `"Authentication System" <${process.env.EMAIL_USER}>`,
      to: emailAddress,
      subject: "Verify your Email",
      html,
    });
  } catch (error) {
    console.error("Critical signup email service error: ", error.message);
  }
};

const resetCodeEmail = async (name, email, code, codeExpirytime) => {
  try {
    const html = resetCodeTemplate(name, code, codeExpirytime, email);

    await transporter.sendMail({
      from: `"Authentication System" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Your Password Reset Code",
      html,
    });
  } catch (error) {
    console.error("Critical resetCode email service error: ", error);
  }
};

const onboardingEmail = async (name, email) => {
  try {
    const html = onboardingTemplate(name, email);
    await transporter.sendMail({
      from: `"Onboarding Auth System" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: `Welcome onboard, ${name}`,
      html,
    });
  } catch (error) {
    console.error("Critical Onboarding email service error: ", error.message);
  }
};

const passwordChangedEmail = async ({
  email,
  name,
  timestamp,
  ipAddress,
  deviceInfo,
  location,
}) => {
  try {
    const html = passwordChangeTemplate({
      name,
      timestamp,
      ipAddress,
      deviceInfo,
      location,
      email,
    });
    await transporter.sendMail({
      from: `"Security Auth System" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: `Security Alert!`,
      html,
    });
  } catch (error) {
    console.error(
      "Critical Password Change alert email service error: ",
      error.message,
    );
  }
};

const deleteAccountEmail = async (name, email) => {
  try {
    const html = accountDeletedTemplate(name, email);
    await transporter.sendMail({
      from: `"Support Authentication System" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: `Account Deletion`,
      html,
    });
  } catch (error) {
    console.error(
      "Critical Account Deletion email notification service error: ",
      error.message,
    );
  }
};

export default {
  signupEmail,
  resetCodeEmail,
  onboardingEmail,
  passwordChangedEmail,
  deleteAccountEmail,
};
