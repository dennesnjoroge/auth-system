import transporter from "./email.transporter.js";
import { createAppError } from "../utils/error.js";
import verifyEmailTemplate from "./templates/verifyEmailTemplate.js";
import { resetCodeTemplate } from "./templates/resetCodeTemplate.js";
import { onboardingTemplate } from "./templates/onboardingTemplate.js";
import { getPasswordChangedEmailTemplate } from "./templates/passwordChangedTemplate.js";
import { accountDeletedTemplate } from "./templates/accountDeleteTemplate.js";

export const sendSignupEmail = async (
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
      from: `"Auth System" <${process.env.EMAIL_USER}>`,
      to: emailAddress,
      subject: "Verify your Email",
      html,
    });
  } catch (error) {
    console.error("Critical email service error: ", error.message);
    throw createAppError("Failed to send signup email", 500);
  }
};

export const sendResetCodeEmail = async (name, email, code, codeExpirytime) => {
  try {
    const html = resetCodeTemplate(name, code, codeExpirytime, email);
    await transporter.sendMail({
      from: `"Auth System" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Your Password Reset Code",
      html,
    });
  } catch (error) {
    console.error(error);
    throw new Error("Failed to send reset code");
  }
};

export const sendOnboardingEmail = async (name, email) => {
  try {
    const html = onboardingTemplate(name, email);
    await transporter.sendMail({
      from: `"Onboarding Auth System" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: `Welcome onboard, ${name}`,
      html,
    });
  } catch (error) {
    console.error(error);
    throw new Error("Failed to send reset code");
  }
};

export const sendPasswordChangedAlert = async ({
  email,
  name,
  timestamp,
  ipAddress,
  deviceInfo,
  location,
}) => {
  try {
    const html = getPasswordChangedEmailTemplate({
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
    console.error(error);
    throw new Error("Failed to send reset code");
  }
};

export const sendDeleteAccountEmail = async (name, email) => {
  try {
    const html = accountDeletedTemplate(name, email);
    await transporter.sendMail({
      from: `"Support Team Auth System" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: `Account Deletion`,
      html,
    });
  } catch (error) {
    console.error(error);
    throw new Error("Failed to send account delete alert");
  }
};
