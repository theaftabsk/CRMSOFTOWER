export function getOtpEmailTemplate(
  otpCode: string, 
  type: 'VERIFICATION' | 'PASSWORD_RESET' | 'LOGIN_2FA',
  email: string
): string {
  const isPasswordReset = type === 'PASSWORD_RESET';
  const title = isPasswordReset ? 'Password Reset Verification' : 'Email Security Verification';
  const actionText = isPasswordReset 
    ? 'Use the following 6-digit one-time password (OTP) to reset your Zyvo CRM password.'
    : 'Use the following 6-digit security code to verify your work email address.';

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #F6F6F8; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #111111;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #F6F6F8; padding: 40px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width: 520px; background-color: #FFFFFF; border: 1px solid #E5E5E5; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0, 0, 0, 0.04);">
          <!-- Header -->
          <tr>
            <td style="padding: 28px 32px 20px 32px; border-bottom: 1px solid #F0F0F0;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td>
                    <span style="font-size: 18px; font-weight: 800; letter-spacing: -0.5px; color: #111111; text-transform: uppercase;">
                      ZYVO<span style="color: #666666; font-weight: 400;">CRM</span>
                    </span>
                  </td>
                  <td align="right">
                    <span style="font-size: 11px; color: #666666; background-color: #F4F4F6; padding: 4px 8px; border-radius: 6px; font-family: monospace;">
                      Security Verification
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 32px;">
              <h1 style="font-size: 20px; font-weight: 700; color: #111111; margin: 0 0 12px 0; letter-spacing: -0.4px;">
                ${title}
              </h1>
              <p style="font-size: 13px; line-height: 1.6; color: #555555; margin: 0 0 24px 0;">
                ${actionText}
              </p>

              <!-- OTP Code Display Card -->
              <table role="presentation" width="100%" style="background-color: #FAFAFA; border: 2px dashed #D4D4D4; border-radius: 12px; margin-bottom: 24px;">
                <tr>
                  <td align="center" style="padding: 24px 16px;">
                    <div style="font-size: 11px; font-weight: 600; text-transform: uppercase; color: #888888; letter-spacing: 1px; margin-bottom: 8px;">
                      Your One-Time Passcode
                    </div>
                    <div style="font-size: 34px; font-weight: 800; font-family: 'Courier New', Courier, monospace; letter-spacing: 10px; color: #111111;">
                      ${otpCode}
                    </div>
                    <div style="font-size: 11px; color: #DC2626; font-weight: 500; margin-top: 8px;">
                      Expires in 10 minutes &bull; Single-use only
                    </div>
                  </td>
                </tr>
              </table>

              <!-- Security Notice -->
              <div style="background-color: #FFFBEB; border: 1px solid #FDE68A; border-radius: 8px; padding: 12px 16px; margin-bottom: 20px;">
                <div style="font-size: 11px; color: #92400E; line-height: 1.5;">
                  <strong>Important Security Notice:</strong> Zyvo staff will never ask for your verification code. Never share this code with anyone.
                </div>
              </div>

              <p style="font-size: 12px; color: #888888; margin: 0; line-height: 1.5;">
                This request was generated for <strong>${email}</strong>. If you did not initiate this request, your account may be secure, but you can immediately update your password or contact support.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #FAFAFA; border-top: 1px solid #E5E5E5; padding: 20px 32px; text-align: center;">
              <p style="font-size: 11px; color: #888888; margin: 0 0 4px 0;">
                Zyvo CRM &bull; Strict Multi-Tenant Isolation & Role-Based Access Control
              </p>
              <p style="font-size: 11px; color: #AAAAAA; margin: 0;">
                This is an automated security transmission. Please do not reply directly to this email.
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
}
