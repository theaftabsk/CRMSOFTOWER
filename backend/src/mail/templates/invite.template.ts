export function getTeamInviteTemplate(
  inviterName: string,
  organizationName: string,
  role: string,
  inviteLink: string
): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Invitation to Join ${organizationName}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #F6F6F8; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #111111;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #F6F6F8; padding: 40px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width: 520px; background-color: #FFFFFF; border: 1px solid #E5E5E5; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0, 0, 0, 0.04);">
          <!-- Header -->
          <tr>
            <td style="padding: 28px 32px 20px 32px; border-bottom: 1px solid #F0F0F0;">
              <a href="https://zyvocrm.in" target="_blank" style="text-decoration: none; display: inline-block;">
                <img src="https://app.zyvocrm.in/favicon.svg" alt="Zyvo CRM" height="30" style="height: 30px; width: auto; display: block; border: 0;" />
              </a>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 32px;">
              <h1 style="font-size: 20px; font-weight: 700; color: #111111; margin: 0 0 12px 0;">
                You've been invited to join ${organizationName}
              </h1>
              <p style="font-size: 13px; line-height: 1.6; color: #555555; margin: 0 0 20px 0;">
                <strong>${inviterName}</strong> has invited you to collaborate on the <strong>${organizationName}</strong> sales workspace as a <strong>${role}</strong>.
              </p>

              <!-- Role Box -->
              <table role="presentation" width="100%" style="background-color: #FAFAFA; border: 1px solid #E5E5E5; border-radius: 10px; margin-bottom: 24px;">
                <tr>
                  <td style="padding: 14px 18px;">
                    <div style="font-size: 11px; text-transform: uppercase; color: #888888; font-weight: 600;">Assigned Role</div>
                    <div style="font-size: 14px; font-weight: 700; color: #111111; margin-top: 2px;">${role}</div>
                  </td>
                </tr>
              </table>

              <!-- CTA Button -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td>
                    <a href="${inviteLink}" style="display: block; width: 100%; box-sizing: border-box; background-color: #111111; color: #FFFFFF; font-size: 13px; font-weight: 600; text-align: center; text-decoration: none; padding: 14px 24px; border-radius: 8px;">
                      Accept Invitation & Join Workspace &rarr;
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #FAFAFA; border-top: 1px solid #E5E5E5; padding: 16px 32px; text-align: center;">
              <p style="font-size: 11px; color: #888888; margin: 0;">
                Zyvo Enterprise CRM &bull; High Performance Sales Infrastructure
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

export function getInvoiceReceiptTemplate(
  customerName: string,
  invoiceNumber: string,
  amount: number,
  currency: string,
  paidAt: string,
  organizationName: string
): string {
  const formattedAmount = `${currency}${amount.toLocaleString('en-IN')}`;

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Payment Receipt: ${invoiceNumber}</title>
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
                      ${organizationName}
                    </span>
                  </td>
                  <td align="right">
                    <span style="font-size: 11px; color: #16A34A; background-color: #ECFDF5; border: 1px solid #A7F3D0; padding: 4px 8px; border-radius: 6px; font-weight: 700;">
                      PAID
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 32px;">
              <h1 style="font-size: 20px; font-weight: 700; color: #111111; margin: 0 0 8px 0;">
                Payment Receipt
              </h1>
              <p style="font-size: 13px; color: #666666; margin: 0 0 24px 0;">
                Dear ${customerName}, thank you for your payment. Your transaction has settled successfully.
              </p>

              <!-- Payment Details Box -->
              <table role="presentation" width="100%" style="background-color: #FAFAFA; border: 1px solid #E5E5E5; border-radius: 10px; margin-bottom: 24px;">
                <tr>
                  <td style="padding: 16px 20px;">
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                      <tr>
                        <td style="font-size: 12px; color: #666666; padding-bottom: 8px;">Invoice Number:</td>
                        <td align="right" style="font-size: 12px; font-weight: 600; font-family: monospace; color: #111111; padding-bottom: 8px;">${invoiceNumber}</td>
                      </tr>
                      <tr>
                        <td style="font-size: 12px; color: #666666; padding-bottom: 8px;">Payment Date:</td>
                        <td align="right" style="font-size: 12px; color: #111111; padding-bottom: 8px;">${paidAt}</td>
                      </tr>
                      <tr>
                        <td style="font-size: 12px; color: #666666; padding-bottom: 8px;">Gateway:</td>
                        <td align="right" style="font-size: 12px; color: #111111; padding-bottom: 8px;">Cashfree Instant Settlement</td>
                      </tr>
                      <tr style="border-top: 1px solid #E5E5E5;">
                        <td style="font-size: 14px; font-weight: 700; color: #111111; padding-top: 10px;">Total Paid:</td>
                        <td align="right" style="font-size: 18px; font-weight: 800; font-family: monospace; color: #16A34A; padding-top: 10px;">${formattedAmount}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #FAFAFA; border-top: 1px solid #E5E5E5; padding: 16px 32px; text-align: center;">
              <p style="font-size: 11px; color: #888888; margin: 0;">
                Secured and Verified by Zyvo Enterprise CRM
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
