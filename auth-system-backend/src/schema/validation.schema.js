import z from "zod";

const login = z.object({
  emailAddress: z
    .string({ error: "Email address is required" })
    .email("Invalid email address")
    .toLowerCase(),
  password: z
    .string({ error: "Password is required" })
    .min(1, "Password is required"),
});

const register = z.object({
  firstName: z
    .string({ error: "First name is required" })
    .trim()
    .min(1, "First name is required")
    .max(50, "First name must not exceed 50 characters"),
  lastName: z
    .string({ error: "Last name is required" })
    .trim()
    .min(1, "Last name is required")
    .max(50, "Last name must not exceed 50 characters"),
  emailAddress: z
    .string({ error: "Email address is required" })
    .email("Invalid email address")
    .toLowerCase(),
  password: z
    .string({ error: "Password is required" })
    .min(8, "Password must be at least 8 characters"),
});

const verifyEmail = z.object({
  verificationToken: z
    .string({ error: "Invalid or expired verification token" })
    .trim()
    .length(64, { error: "Invalid or expired verification token" }),
});

const forgotPassword = z.object({
  emailAddress: z
    .string({ error: "Email address is required" })
    .email({ error: "Invalid email address" })
    .toLowerCase(),
});

const resetPassword = z.object({
  resetToken: z
    .string({ error: "Invalid or expired reset token" })
    .trim()
    .length(64, { error: "Invalid or expired reset token" }),
  password: z
    .string({ error: "Password is required" })
    .min(8, { error: "Password must be at least 8 characters" }),
});

export default { register, login, verifyEmail, forgotPassword, resetPassword };
