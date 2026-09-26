export function getWelcomeEmailTemplate(name: string, email: string, organizationName: string): string {
  const loginUrl = 'https://app.zyvocrm.in/login';
  const onboardingUrl = 'https://app.zyvocrm.in/onboarding';

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to Zyvo CRM</title>
</head>
<body style="margin: 0; padding: 0; background-color: #F6F6F8; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #111111;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #F6F6F8; padding: 40px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width: 560px; background-color: #FFFFFF; border: 1px solid #E5E5E5; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0, 0, 0, 0.04);">
          <!-- Header -->
          <tr>
            <td style="padding: 32px 32px 24px 32px; border-bottom: 1px solid #F0F0F0;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td>
                    <a href="https://zyvocrm.in" target="_blank" style="text-decoration: none; display: inline-block;">
                      <img src="https://app.zyvocrm.in/favicon.svg" alt="Zyvo CRM" height="32" style="height: 32px; width: auto; display: block; border: 0;" />
                    </a>
                  </td>
                  <td align="right">
                    <span style="font-size: 11px; color: #16A34A; background-color: #ECFDF5; border: 1px solid #A7F3D0; padding: 4px 8px; border-radius: 6px; font-weight: 600;">
                      Workspace Active
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Hero Content -->
          <tr>
            <td style="padding: 32px 32px 24px 32px;">
              <h1 style="font-size: 22px; font-weight: 700; color: #111111; margin: 0 0 12px 0; letter-spacing: -0.5px;">
                Welcome to your sales command center, ${name}!
              </h1>
              <p style="font-size: 14px; line-height: 1.6; color: #555555; margin: 0 0 24px 0;">
                Your multi-tenant workspace for <strong>${organizationName}</strong> is now live. Zyvo CRM is designed to streamline your deal pipelines, automate lead capture, generate GST-compliant invoices, and settle payouts instantly.
              </p>

              <!-- Workspace Credentials Box -->
              <table role="presentation" width="100%" style="background-color: #FAFAFA; border: 1px solid #E5E5E5; border-radius: 10px; margin-bottom: 28px;">
                <tr>
                  <td style="padding: 16px 20px;">
                    <div style="font-size: 11px; font-weight: 600; text-transform: uppercase; color: #888888; margin-bottom: 8px;">
                      Workspace Access Details
                    </div>
                    <div style="font-size: 13px; color: #111111; margin-bottom: 4px;">
                      <strong>Workspace:</strong> ${organizationName}
                    </div>
                    <div style="font-size: 13px; color: #111111; margin-bottom: 4px;">
                      <strong>Work Email:</strong> <span style="font-family: monospace;">${email}</span>
                    </div>
                    <div style="font-size: 13px; color: #111111;">
                      <strong>Portal URL:</strong> <a href="${loginUrl}" style="color: #111111; font-family: monospace; text-decoration: underline;">app.zyvocrm.in</a>
                    </div>
                  </td>
                </tr>
              </table>

              <!-- CTA Button -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td align="center">
                    <a href="${onboardingUrl}" style="display: block; width: 100%; box-sizing: border-box; background-color: #111111; color: #FFFFFF; font-size: 13px; font-weight: 600; text-align: center; text-decoration: none; padding: 14px 24px; border-radius: 8px; letter-spacing: 0.2px;">
                      Complete Setup & Launch Command Center &rarr;
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Feature Highlights -->
          <tr>
            <td style="padding: 0 32px 32px 32px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-top: 1px solid #F0F0F0; padding-top: 20px;">
                <tr>
                  <td width="33%" style="vertical-align: top; padding-right: 8px;">
                    <div style="font-size: 12px; font-weight: 600; color: #111111; margin-bottom: 4px;">⚡ Real-time Leads</div>
                    <div style="font-size: 11px; color: #777777; line-height: 1.4;">Capture leads directly from your web forms and APIs.</div>
                  </td>
                  <td width="33%" style="vertical-align: top; padding: 0 4px;">
                    <div style="font-size: 12px; font-weight: 600; color: #111111; margin-bottom: 4px;">💳 Cashfree Settled</div>
                    <div style="font-size: 11px; color: #777777; line-height: 1.4;">Instant payment collection with automatic invoice sync.</div>
                  </td>
                  <td width="33%" style="vertical-align: top; padding-left: 8px;">
                    <div style="font-size: 12px; font-weight: 600; color: #111111; margin-bottom: 4px;">🔒 Strict Isolation</div>
                    <div style="font-size: 11px; color: #777777; line-height: 1.4;">Enterprise multi-tenant data encryption by default.</div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #FAFAFA; border-top: 1px solid #E5E5E5; padding: 20px 32px; text-align: center;">
              <p style="font-size: 11px; color: #888888; margin: 0 0 6px 0;">
                Zyvo CRM &bull; High-Performance Enterprise Sales Operating System
              </p>
              <p style="font-size: 11px; color: #AAAAAA; margin: 0;">
                If you did not register this account, you can safely ignore this email.
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
