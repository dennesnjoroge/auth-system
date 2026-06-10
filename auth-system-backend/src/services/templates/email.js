export const verifyEmailTemplate = (
  fullName,
  verificationLink,
  emailAddress,
  linkExpiryTime,
) => {
  return `
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Verify Your Account</title>
  </head>

  <body
    style="
      margin: 0;
      padding: 0;
      background-color: #f3f3f3;
      font-family:
        -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto,
        Helvetica, Arial, sans-serif;
      -webkit-font-smoothing: antialiased;
    "
  >
    <table
      width="100%"
      cellpadding="0"
      cellspacing="0"
      border="0"
      style="background-color: #f3f3f3; padding: 40px 0"
    >
      <tr>
        <td align="center">
          <table
            width="560"
            cellpadding="0"
            cellspacing="0"
            border="0"
            style="background-color: #ffffff; margin: 0 auto"
          >
            <tr>
              <td
                align="left"
                style="background-color: #000000; padding: 30px 40px"
              >
                <span
                  style="
                    font-size: 24px;
                    font-weight: 700;
                    color: #ffffff;
                    letter-spacing: -0.5px;
                  "
                >
                  Authentication System
                </span>
              </td>
            </tr>

            <tr>
              <td style="padding: 40px 40px 40px 40px">
                <h1
                  style="
                    margin: 0 0 24px 0;
                    color: #000000;
                    font-size: 34px;
                    font-weight: 400;
                    line-height: 40px;
                    letter-spacing: -1px;
                  "
                >
                  Verify your account
                </h1>

                <p
                  style="
                    margin: 0 0 16px 0;
                    color: #333333;
                    font-size: 16px;
                    line-height: 24px;
                  "
                >
                  Hello ${fullName},
                </p>

                <p
                  style="
                    margin: 0 0 32px 0;
                    color: #333333;
                    font-size: 16px;
                    line-height: 24px;
                  "
                >
                  Click the button below to complete your sign-up
                  process. This link will expire in 5 minutes.
                </p>

                <table
                  cellpadding="0"
                  cellspacing="0"
                  border="0"
                  style="margin-bottom: 32px"
                >
                  <tr>
                    <td align="left">
                      <a
                        href="${verificationLink}"
                        style="
                          display: inline-block;
                          background-color: #000000;
                          color: #ffffff;
                          text-decoration: none;
                          font-size: 16px;
                          font-weight: 500;
                          padding: 14px 28px;
                          border: 1px solid #000000;
                        "
                      >
                        Verify Account
                      </a>
                    </td>
                  </tr>
                </table>

                <table
                  width="100%"
                  cellpadding="0"
                  cellspacing="0"
                  border="0"
                  style="margin-bottom: 32px;"
                >
                  <tr>
                    <td
                      style="
                        font-size: 12px;
                        line-height: 18px;
                        color: #6e6e73;
                        text-align: left;
                      "
                    >
                      If the button doesn't work, copy and paste this link into your
                      browser:
                      <br />
                      <span style="word-break: break-all; color: #1c1c1e; font-weight: 500;">
                        ${verificationLink}
                      </span>
                    </td>
                  </tr>
                </table>

                <p
                  style="
                    margin: 0;
                    color: #555555;
                    font-size: 14px;
                    line-height: 20px;
                  "
                >
                  If you did not request this code, you can safely ignore this
                  email.
                </p>
              </td>
            </tr>

            <tr>
              <td style="padding: 40px; background-color: #000000">
                <p
                  style="
                    margin: 0 0 12px 0;
                    color: #ffffff;
                    font-size: 12px;
                    line-height: 18px;
                    font-weight: 500;
                  "
                >
                  Auth System.
                </p>
                <p
                  style="
                    margin: 0 0 24px 0;
                    color: #e0e0e0;
                    font-size: 12px;
                    line-height: 18px;
                  "
                >
                  If you have any questions or need help, reach us anytime at
                  <a style="color: #e0e0e0; text-decoration: underline;" href="mailto:support@yourdomain.com"
                    >support@yourdomain.com</a
                  >
                </p>
                <p
                  style="
                    margin: 0;
                    color: #a0a0a0;
                    font-size: 11px;
                    line-height: 16px;
                  "
                >
                  This is a transactional email notification regarding your
                  security settings.<br />
                  &copy; 2026 Authentication System. All rights reserved.
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
`;
};

export const accountDeletedTemplate = (name, email) => {
  return `
  <!doctype html>
  <html>
    <head>
      <meta charset="UTF-8" />
      <title>Account Deleted</title>
    </head>

    <body style="margin:0; padding:0; background:#f1f5f9; font-family:Arial, sans-serif;">
      
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td align="center" style="padding:40px 15px;">
            
            <!-- Email Container -->
            <table width="500" cellpadding="0" cellspacing="0" style="background:#ffffff; border-radius:10px; padding:30px;">
              
              <!-- Title -->
              <tr>
                <td style="font-size:20px; font-weight:bold; color:#0f172a; padding-bottom:20px;">
                  Account Successfully Deleted
                </td>
              </tr>

              <!-- Body Content -->
              <tr>
                <td style="font-size:14px; color:#334155; line-height:1.7;">
                  <p style="margin:0 0 15px;">Hello <strong>${name}</strong>,</p>

                  <p style="margin:0 0 15px;">
                    This is to confirm that your account has been successfully deleted.
                  </p>

                  <p style="margin:0 0 15px;">
                    You will no longer be able to access your account or any related services.
                  </p>

                  <p style="margin:0 0 15px;">
                    Some limited information may be retained for a short period where required for legal, security, or administrative purposes.
                  </p>

                  <p style="margin:0 0 15px;">
                    If this action was not initiated by you, please contact support immediately.
                  </p>

                  <p style="margin:25px 0 0;">
                    Regards,<br/>
                    <strong>Auth System Team</strong>
                  </p>
                </td>
              </tr>

              <!-- Divider -->
              <tr>
                <td style="padding:25px 0 10px;">
                  <hr style="border:none; border-top:1px solid #e2e8f0;" />
                </td>
              </tr>

              <!-- Footer -->
              <tr>
                <td style="font-size:12px; color:#94a3b8;">
                  This message was sent to <strong>${email}</strong>.
                </td>
              </tr>

              <tr>
                <td style="font-size:12px; color:#94a3b8; padding-top:5px;">
                  &copy; ${new Date().getFullYear()} Support Team Authentication System. All rights reserved.
                </td>
              </tr>

            </table>

          </td>
        </tr>
      </table>

    </body>
  </html>
  `;
};

export const onboardingTemplate = (name, email) => {
  return `
  <!doctype html>
  <html>
    <head>
      <meta charset="UTF-8" />
      <title>Welcome to Our Platform!</title>
    </head>

    <body
      style="
        margin: 0;
        padding: 0;
        background: #f1f5f9;
        font-family: Arial, sans-serif;
      "
    >
      <table width="100%" cellpadding="0" cellspacing="0" style="padding: 20px 0">
        <tr>
          <td align="center">
            <table
              width="420"
              cellpadding="0"
              cellspacing="0"
              style="
                background: #ffffff;
                border-radius: 12px;
                padding: 30px;
                box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
              "
            >
              <tr>
                <td align="center" style="padding-top: 10px">
                  <h2 style="margin: 0; color: #0f172a">🎉 Welcome to Our Platform!</h2>
                </td>
              </tr>

              <!-- Message -->
              <tr>
                <td
                  style="
                    padding-top: 15px;
                    color: #475569;
                    font-size: 14px;
                    line-height: 1.6;
                    text-align: center;
                  "
                >
                  <p>Hi <b>${name}</b> 👋</p>
                  <p>We're thrilled to have you on board! 🎉 Get ready to explore all the amazing features we have in store for you.</p>
                  <p>If you have any questions, feel free to reach out — we're always happy to help!</p>
                </td>

              <!-- Footer -->
              <tr>
                <td
                  style="
                    padding-top: 25px;
                    font-size: 12px;
                    color: #94a3b8;
                    text-align: center;
                  "
                >
                  This message was sent to <b>${email}</b> because you joined our platform. We're excited to have you with us!
                </td>
              </tr>
              <tr>
                <td
                  style="
                    padding-top: 25px;
                    font-size: 12px;
                    color: #94a3b8;
                    text-align: center;
                  "
                >
                  &copy; ${new Date().getFullYear()} Authentication System. All rights reserved.
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
  </html>
  `;
};

export const passwordChangeTemplate = ({
  name,
  timestamp,
  ipAddress,
  deviceInfo,
  location,
  email,
}) => {
  const formattedTime = new Date(timestamp).toLocaleString();

  return `
  <!doctype html>
  <html>
    <head>
      <meta charset="UTF-8" />
      <title>Password Changed</title>
    </head>

    <body
      style="
        margin: 0;
        padding: 0;
        background: #f1f5f9;
        font-family: Arial, sans-serif;
      "
    >
      <table width="100%" cellpadding="0" cellspacing="0" style="padding: 20px 0">
        <tr>
          <td align="center">
            <table
              width="420"
              cellpadding="0"
              cellspacing="0"
              style="
                background: #ffffff;
                border-radius: 12px;
                padding: 30px;
                box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
              "
            >
              <tr>
                <td align="center" style="padding-top: 10px">
                  <h2 style="margin: 0; color: #0f172a">Password Changed</h2>
                </td>
              </tr>

              <!-- Message -->
              <tr>
                <td
                  style="
                    padding-top: 15px;
                    color: #475569;
                    font-size: 14px;
                    line-height: 1.6;
                    text-align: center;
                  "
                >
                  <p>Hello <b>${name}</b>,</p>
                  <p>Your password was successfully changed.</p>
                </td>
              </tr>

              <!-- Details Box -->
              <tr>
                <td style="padding-top: 20px">
                  <table
                    width="100%"
                    cellpadding="0"
                    cellspacing="0"
                    style="
                      background: #f8fafc;
                      border-radius: 8px;
                      padding: 15px;
                      border: 1px solid #e2e8f0;
                    "
                  >
                    <tr>
                      <td style="padding-bottom: 8px">
                        <strong style="color: #64748b; font-size: 12px;">TIME</strong><br/>
                        <span style="color: #0f172a; font-size: 14px;">${formattedTime}</span>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding-bottom: 8px">
                        <strong style="color: #64748b; font-size: 12px;">IP ADDRESS</strong><br/>
                        <span style="color: #0f172a; font-size: 14px;">${ipAddress}</span>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding-bottom: 8px">
                        <strong style="color: #64748b; font-size: 12px;">DEVICE</strong><br/>
                        <span style="color: #0f172a; font-size: 14px;">${deviceInfo}</span>
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <strong style="color: #64748b; font-size: 12px;">LOCATION</strong><br/>
                        <span style="color: #0f172a; font-size: 14px;">${location}</span>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

              <!-- Warning -->
              <tr>
                <td
                  style="
                    padding-top: 20px;
                    color: #dc2626;
                    font-size: 13px;
                    text-align: center;
                    background: #fef2f2;
                    padding: 12px;
                    border-radius: 8px;
                  "
                >
                  If this wasn't you, please reset your password immediately.
                </td>
              </tr>

              <!-- Footer -->
              <tr>
                <td
                  style="
                    padding-top: 25px;
                    font-size: 12px;
                    color: #94a3b8;
                    text-align: center;
                  "
                >
                  This message was sent to <b>${email}</b> because your password was changed.
                </td>
              </tr>
              <tr>
                <td
                  style="
                    padding-top: 10px;
                    font-size: 12px;
                    color: #94a3b8;
                    text-align: center;
                  "
                >
                  &copy; ${new Date().getFullYear()} Security Team Authentication System. All rights reserved.
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
  </html>
  `;
};

export const resetCodeTemplate = (name, code, codeExpirytime, email) => {
  return `
  <!doctype html>
  <html>
    <head>
      <meta charset="UTF-8" />
      <title>Reset Your Password</title>
    </head>

    <body
      style="
        margin: 0;
        padding: 0;
        background: #f1f5f9;
        font-family: Arial, sans-serif;
      "
    >
      <table width="100%" cellpadding="0" cellspacing="0" style="padding: 20px 0">
        <tr>
          <td align="center">
            <table
              width="420"
              cellpadding="0"
              cellspacing="0"
              style="
                background: #ffffff;
                border-radius: 12px;
                padding: 30px;
                box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
              "
            >
              <tr>
                <td align="center" style="padding-top: 10px">
                  <h2 style="margin: 0; color: #0f172a">Password Reset Code</h2>
                </td>
              </tr>

              <!-- Message -->
              <tr>
                <td
                  style="
                    padding-top: 15px;
                    color: #475569;
                    font-size: 14px;
                    line-height: 1.6;
                    text-align: center;
                  "
                >
                  <p>Hello <b>${name}</b>,</p>
                  <p>Use the code below to reset your password. If you didn't request a password reset, you can ignore this email.</p>
                  <h1 style="letter-spacing: 6px;">${code}</h1>
                </td>

              <!-- Expiry -->
              <tr>
                <td style="color: #64748b; font-size: 13px; text-align: center">
                  This code will expire in <b>${codeExpirytime} minutes</b>.
                </td>
              </tr>

              <!-- Footer -->
              <tr>
                <td
                  style="
                    padding-top: 25px;
                    font-size: 12px;
                    color: #94a3b8;
                    text-align: center;
                  "
                >
                  This message was sent to <b>${email}</b> because you requested a password reset. If you didn’t request this, you can safely ignore this email. Also, please do not share this code with anyone else.
                </td>
              </tr>
              <tr>
                <td
                  style="
                    padding-top: 25px;
                    font-size: 12px;
                    color: #94a3b8;
                    text-align: center;
                  "
                >
                  &copy; ${new Date().getFullYear()} Authentication System. All rights reserved.
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
  </html>
  `;
};
