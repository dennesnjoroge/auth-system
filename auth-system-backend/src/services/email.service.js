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

const resetCodeEmail = async (name, email, code, codeExpirytime) => {
  try {
    const html = resetCodeTemplate(name, code, codeExpirytime, email);

    await resend.emails.send({
      from: `"Authentication System" <onboarding@resend.dev>`,
      to: email,
      subject: "Your Password Reset Code",
      html,
    });
  } catch (error) {
    throw error;
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

    await resend.emails.send({
      from: `"Security Auth System" <onboarding@resend.dev>`,
      to: email,
      subject: `Security Alert!`,
      html,
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
  resetCodeEmail,
  onboardingEmail,
  passwordChangedEmail,
  deleteAccountEmail,
};
