import { Resend } from "resend";
import emailTemplates from "../templates/email.templates.js";

const resend = new Resend(process.env.RESEND_API_KEY);

import {
  accountDeletedTemplate,
  onboardingTemplate,
  passwordChangeTemplate,
  resetCodeTemplate,
} from "./templates/email.js";

const BASE_URL =
  process.env.NODE_ENV === "production"
    ? process.env.FRONTEND_URL
    : process.env.DEV_FRONTEND_URL;

const signupEmail = async (fullName, emailAddress, verificationToken) => {
  try {
    const verificationLink = `${BASE_URL}/verify?token=${verificationToken}`;

    await resend.emails.send({
      from: `"Authentication System" <onboarding@resend.dev>`,
      to: emailAddress,
      subject: "Verify your Email",
      html: emailTemplates.verifyEmail(fullName, verificationLink),
    });
  } catch (error) {
    throw error;
  }
};

const onboardingEmail = async (fullName, emailAddress) => {
  try {
    await resend.emails.send({
      from: `"Onboarding Auth System" <onboarding@resend.dev>`,
      to: emailAddress,
      subject: `Welcome onboard, ${fullName}`,
      html: emailTemplates.onboardingEmail(fullName, emailAddress),
    });
  } catch (error) {
    throw error;
  }
};

const forgotPassword = async (fullName, emailAddress, resetToken) => {
  const resetLink = `${BASE_URL}/forgot/flow?token=${resetToken}`;
  try {
    await resend.emails.send({
      from: `"Authentication System" <onboarding@resend.dev>`,
      to: emailAddress,
      subject: "Your Password Reset Link",
      html: emailTemplates.forgotPassword(fullName, resetLink),
    });
  } catch (error) {
    throw error;
  }
};

const passwordAlert = async (
  emailAddress,
  fullName,
  timestamp,
  ipAddress,
  deviceInfo,
  city,
  country,
) => {
  try {
    await resend.emails.send({
      from: `"Security Auth System" <onboarding@resend.dev>`,
      to: emailAddress,
      subject: `Security Alert!`,
      html: emailTemplates.passwordAlert(
        fullName,
        timestamp,
        ipAddress,
        deviceInfo,
        city,
        country,
      ),
    });
  } catch (error) {
    throw error;
  }
};

const deleteAccountEmail = async (name, email) => {
  try {
    const html = accountDeletedTemplate(name, email);

    await resend.emails.send({
      from: `"Support Authentication System" <onboarding@resend.dev>`,
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
  onboardingEmail,
  forgotPassword,
  passwordAlert,
  deleteAccountEmail,
};
