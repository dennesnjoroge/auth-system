const verifyEmail = (fullName, verificationLink) => {
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

const onboardingEmail = (fullName, emailAddress) => {
  return `
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Welcome to Our Platform!</title>
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
                 🎉 Welcome to Our Platform!
                </h1>

                <p
                  style="
                    margin: 0 0 16px 0;
                    color: #333333;
                    font-size: 16px;
                    line-height: 24px;
                  "
                >
                  Hi <b>${fullName},
                </p>

                <p
                  style="
                    margin: 0 0 32px 0;
                    color: #333333;
                    font-size: 16px;
                    line-height: 24px;
                  "
                >
                  We're thrilled to have you on board! 🎉 Get ready to explore all the amazing features we have in store for you.
                </p>

                <p style="
                    margin: 0 0 32px 0;
                    color: #333333;
                    font-size: 16px;
                    line-height: 24px;
                  ">If you have any questions, feel free to reach out — we're always happy to help!</p>

                <p
                  style="
                    margin: 0;
                    color: #555555;
                    font-size: 14px;
                    line-height: 20px;
                  "
                >
                  This message was sent to <b>${emailAddress}</b> because you joined our platform. We're excited to have you with us!
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

const forgotPassword = (fullName, resetLink) => {
  return `
  <!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Reset Your Password</title>
  </head>

  <body
    style="
      margin: 0;
      padding: 0;
      background-color: #f3f3f3;
      font-family:
        -apple-system, BlinkMacSystemFont, &quot;Segoe UI&quot;, Roboto,
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
                  Reset Your Password
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
                  Click the button below to reset your password. This link will
                  expire in 5 minutes.
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
                        href="${resetLink}"
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
                        Reset Password
                      </a>
                    </td>
                  </tr>
                </table>

                <table
                  width="100%"
                  cellpadding="0"
                  cellspacing="0"
                  border="0"
                  style="margin-bottom: 32px"
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
                      If the button doesn't work, copy and paste this link into
                      your browser:
                      <br />
                      <span
                        style="
                          word-break: break-all;
                          color: #1c1c1e;
                          font-weight: 500;
                        "
                      >
                        ${resetLink}
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
                  <a
                    style="color: #e0e0e0; text-decoration: underline"
                    href="mailto:support@yourdomain.com"
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

export default { verifyEmail, onboardingEmail, forgotPassword };
