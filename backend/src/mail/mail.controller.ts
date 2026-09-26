import { Controller, Post, Body, BadRequestException, NotFoundException } from '@nestjs/common';
import { MailService } from './mail.service';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcryptjs';

@Controller('mail')
export class MailController {
  constructor(
    private readonly mailService: MailService,
    private readonly prisma: PrismaService
  ) {}

  /**
   * Request an OTP for email verification
   */
  @Post('send-otp')
  async sendOtp(@Body() body: { email: string; type?: 'VERIFICATION' | 'PASSWORD_RESET' }) {
    if (!body.email) {
      throw new BadRequestException('Email address is required');
    }
    return this.mailService.generateAndSendOtp(body.email, body.type || 'VERIFICATION');
  }

  /**
   * Verify an OTP code
   */
  @Post('verify-otp')
  async verifyOtp(@Body() body: { email: string; otpCode: string; type?: 'VERIFICATION' | 'PASSWORD_RESET' }) {
    if (!body.email || !body.otpCode) {
      throw new BadRequestException('Email and OTP code are required');
    }
    return this.mailService.verifyOtp(body.email, body.otpCode, body.type || 'VERIFICATION');
  }

  /**
   * Request password reset OTP
   */
  @Post('forgot-password')
  async forgotPassword(@Body() body: { email: string }) {
    if (!body.email) {
      throw new BadRequestException('Email address is required');
    }

    const normalizedEmail = body.email.toLowerCase().trim();
    const user = await this.prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user) {
      // Don't leak existence, return success message
      return {
        success: true,
        message: 'If an account exists with this email, a verification code has been dispatched.',
      };
    }

    await this.mailService.generateAndSendOtp(normalizedEmail, 'PASSWORD_RESET');

    return {
      success: true,
      message: 'Password reset code has been sent to your email.',
    };
  }

  /**
   * Complete password reset using verified OTP
   */
  @Post('reset-password')
  async resetPassword(@Body() body: { email: string; otpCode: string; newPassword: string }) {
    if (!body.email || !body.otpCode || !body.newPassword) {
      throw new BadRequestException('Email, OTP code, and new password are required');
    }

    if (body.newPassword.length < 6) {
      throw new BadRequestException('New password must be at least 6 characters long');
    }

    const normalizedEmail = body.email.toLowerCase().trim();

    // 1. Verify OTP in real PostgreSQL database
    await this.mailService.verifyOtp(normalizedEmail, body.otpCode, 'PASSWORD_RESET');

    // 2. Hash new password with bcryptjs
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(body.newPassword, salt);

    // 3. Update user password in PostgreSQL
    const user = await this.prisma.user.update({
      where: { email: normalizedEmail },
      data: { password_hash: passwordHash },
    });

    return {
      success: true,
      message: 'Password reset successful. You may now log in with your new credentials.',
    };
  }

  /**
   * Send test email
   */
  @Post('test')
  async sendTestEmail(@Body() body: { email: string }) {
    if (!body.email) throw new BadRequestException('Email is required');
    return this.mailService.sendWelcomeEmail(body.email, 'Admin User', 'Zyvo Enterprise CRM');
  }
}
