export const verifyEmailTemplate = (
  fullName,
  verificationLink,
  emailAddress,
  linkExpiryTime,
) => {
  return `
  <!doctype html>
  <html>
    <body style="margin: 0; background: #f5f5f7; font-family: Inter, Arial, sans-serif">
      <table width="100%" cellpadding="0" cellspacing="0" style="padding: 24px 0">
        <tr>
          <td align="center">
            <table
              width="420"
              cellpadding="0"
              cellspacing="0"
              style="
                background: #ffffff;
                border-radius: 18px;
                padding: 28px;
                border: 1px solid rgba(28,28,30,0.04);
                box-shadow: 0 8px 24px rgba(15, 23, 42, 0.06);
              "
            >
              <!-- Title -->
              <tr>
                <td align="center" style="padding-top: 8px">
                  <h2 style="margin: 0; color: #1c1c1e; font-weight: 700; letter-spacing: -0.02em;">
                    Verify Your Email
                  </h2>
                </td>
              </tr>

              <!-- Message -->
              <tr>
                <td
                  style="
                    padding-top: 14px;
                    color: #6e6e73;
                    font-size: 14px;
                    line-height: 1.6;
                    text-align: center;
                  "
                >
                  Hello <b style="color:#1c1c1e">${fullName}</b>, <br /><br />
                  Thanks for signing up! Please confirm your email address by
                  clicking the button below.
                </td>
              </tr>

              <!-- Button -->
              <tr>
                <td align="center" style="padding: 24px 0">
                  <a
                    href="${verificationLink}"
                    style="
                      background: #1c1c1e;
                      color: #ffffff;
                      text-decoration: none;
                      padding: 14px 24px;
                      border-radius: 12px;
                      font-weight: 600;
                      display: inline-block;
                      box-shadow: 0 4px 14px rgba(0,0,0,0.08);
                    "
                  >
                    Verify Email
                  </a>
                </td>
              </tr>

              <!-- Expiry -->
              <tr>
                <td style="color: #6e6e73; font-size: 13px; text-align: center">
                  This link will expire in <b style="color:#1c1c1e">${linkExpiryTime} minutes</b>.
                </td>
              </tr>

              <!-- Fallback -->
              <tr>
                <td
                  style="
                    padding-top: 14px;
                    font-size: 12px;
                    color: #6e6e73;
                    text-align: center;
                  "
                >
                  If the button doesn't work, copy and paste this link into your
                  browser:
                  <br />
                  <span style="word-break: break-all; color: #1c1c1e">
                    ${verificationLink}
                  </span>
                </td>
              </tr>

              <!-- Footer -->
              <tr>
                <td
                  style="
                    padding-top: 24px;
                    font-size: 12px;
                    color: #6e6e73;
                    text-align: center;
                  "
                >
                  This email was sent to <b>${emailAddress}</b> because you created an account with us. If you didn’t create this account, you can safely ignore this
                  email.
                </td>
                
              </tr>

              <tr>
                <td
                  style="
                    padding-top: 24px;
                    font-size: 12px;
                    color: #6e6e73;
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
                  &copy; ${new Date().getFullYear()} Auth System. All rights reserved.
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
                  &copy; ${new Date().getFullYear()} Auth System. All rights reserved.
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
                  &copy; ${new Date().getFullYear()} Auth System. All rights reserved.
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
                  &copy; ${new Date().getFullYear()} Auth System. All rights reserved.
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
