const verifyEmailTemplate = (
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

export default verifyEmailTemplate;
