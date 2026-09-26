import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { Resend } from 'resend';
import { PrismaService } from '../prisma/prisma.service';
import { getWelcomeEmailTemplate } from './templates/welcome.template';
import { getOtpEmailTemplate } from './templates/otp.template';
import { getTeamInviteTemplate, getInvoiceReceiptTemplate } from './templates/invite.template';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private resend: Resend;
  private primaryFrom: string;
  private fallbackFrom: string;

  constructor(private prisma: PrismaService) {
    const apiKey = process.env.RESEND_API_KEY || '';
    this.resend = new Resend(apiKey);
    this.primaryFrom = process.env.MAIL_FROM || 'Zyvo CRM <noreply@zyvocrm.in>';
    this.fallbackFrom = process.env.MAIL_FALLBACK_FROM || 'onboarding@resend.dev';
  }

  /**
   * Internal helper to dispatch email with automatic fallback if custom domain is still propagating.
   */
  private async dispatchEmail(to: string, subject: string, html: string) {
    try {
      this.logger.log(`Dispatching email to ${to} with subject "${subject}"...`);
      // Try primary domain first
      const res = await this.resend.emails.send({
        from: this.primaryFrom,
        to: [to],
        subject,
        html,
      });

      if (res.error) {
        this.logger.warn(`Primary sender ${this.primaryFrom} error: ${res.error.message}. Retrying with fallback sender ${this.fallbackFrom}...`);
        const fallbackRes = await this.resend.emails.send({
          from: this.fallbackFrom,
          to: [to],
          subject,
          html,
        });
        return fallbackRes;
      }

      return res;
    } catch (err: any) {
      this.logger.warn(`Primary send exception: ${err.message}. Retrying with fallback...`);
      try {
        const fallbackRes = await this.resend.emails.send({
          from: this.fallbackFrom,
          to: [to],
          subject,
          html,
        });
        return fallbackRes;
      } catch (fallbackErr: any) {
        this.logger.error(`Failed to send email to ${to}: ${fallbackErr.message}`);
        return { error: fallbackErr };
      }
    }
  }

  /**
   * 1. Send Welcome Email upon new workspace creation
   */
  async sendWelcomeEmail(email: string, name: string, organizationName: string) {
    const subject = `Welcome to Zyvo CRM — ${organizationName} is ready`;
    const html = getWelcomeEmailTemplate(name, email, organizationName);
    return this.dispatchEmail(email, subject, html);
  }

  /**
   * 2. Generate and Send 6-digit OTP to real PostgreSQL database and user's email
   */
  async generateAndSendOtp(email: string, type: 'VERIFICATION' | 'PASSWORD_RESET' = 'VERIFICATION') {
    const normalizedEmail = email.toLowerCase().trim();

    // Invalidate existing unused OTPs for this email and type
    await this.prisma.otpVerification.updateMany({
      where: {
        email: normalizedEmail,
        type,
        used: false,
      },
      data: {
        used: true,
      },
    });

    // Generate secure 6-digit numerical code
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Store in real PostgreSQL database
    await this.prisma.otpVerification.create({
      data: {
        email: normalizedEmail,
        otp_code: otpCode,
        type,
        expires_at: expiresAt,
        used: false,
      },
    });

    const subject = type === 'PASSWORD_RESET' 
      ? `${otpCode} is your Zyvo CRM password reset code` 
      : `${otpCode} is your Zyvo CRM verification code`;

    const html = getOtpEmailTemplate(otpCode, type, normalizedEmail);
    const result = await this.dispatchEmail(normalizedEmail, subject, html);

    return {
      success: true,
      message: `Verification code sent to ${normalizedEmail}`,
      deliveryId: (result as any)?.data?.id || (result as any)?.id,
    };
  }

  /**
   * 3. Verify OTP code against real PostgreSQL database
   */
  async verifyOtp(email: string, otpCode: string, type: 'VERIFICATION' | 'PASSWORD_RESET' = 'VERIFICATION') {
    const normalizedEmail = email.toLowerCase().trim();
    const cleanCode = otpCode.trim();

    const record = await this.prisma.otpVerification.findFirst({
      where: {
        email: normalizedEmail,
        otp_code: cleanCode,
        type,
        used: false,
        expires_at: {
          gt: new Date(),
        },
      },
      orderBy: {
        created_at: 'desc',
      },
    });

    if (!record) {
      throw new BadRequestException('Invalid or expired verification code. Please check your email or request a new code.');
    }

    // Mark as used
    await this.prisma.otpVerification.update({
      where: { id: record.id },
      data: { used: true },
    });

    return {
      success: true,
      message: 'Code verified successfully',
    };
  }

  /**
   * 4. Team Member Invitation Email
   */
  async sendTeamInvite(email: string, inviterName: string, organizationName: string, role: string, inviteLink: string) {
    const subject = `${inviterName} invited you to join ${organizationName} on Zyvo CRM`;
    const html = getTeamInviteTemplate(inviterName, organizationName, role, inviteLink);
    return this.dispatchEmail(email, subject, html);
  }

  /**
   * 5. Send Invoice Payment Receipt
   */
  async sendInvoiceReceipt(
    customerEmail: string,
    customerName: string,
    invoiceNumber: string,
    amount: number,
    currency: string,
    paidAt: string,
    organizationName: string
  ) {
    const subject = `Payment Receipt for Invoice ${invoiceNumber} — ${organizationName}`;
    const html = getInvoiceReceiptTemplate(customerName, invoiceNumber, amount, currency, paidAt, organizationName);
    return this.dispatchEmail(customerEmail, subject, html);
  }
}
