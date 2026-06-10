import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

import {
  verifyEmailTemplate,
  accountDeletedTemplate,
  onboardingTemplate,
  passwordChangeTemplate,
  resetCodeTemplate,
} from "./templates/email.js";

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
    await resend.emails.send({
      from: `"Authentication System" <onboarding@resend.dev>`,
      to: emailAddress,
      subject: "Verify your Email",
      html,
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

const onboardingEmail = async (name, email) => {
  try {
    const html = onboardingTemplate(name, email);

    await resend.emails.send({
      from: `"Onboarding Auth System" <onboarding@resend.dev>`,
      to: email,
      subject: `Welcome onboard, ${name}`,
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
