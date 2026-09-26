import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService) {}

  private getJwtSecret(): string {
    return process.env.JWT_SECRET || 'crm-secret-key-super-secure-production-2026';
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email.trim().toLowerCase() },
      include: { organization: true },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // Verify password: check bcrypt hash, seeded hash, or legacy plain-text
    let isPasswordValid = false;
    if (user.password_hash) {
      if (user.password_hash.startsWith('$2a$') || user.password_hash.startsWith('$2b$')) {
        isPasswordValid = await bcrypt.compare(dto.password, user.password_hash);
      } else {
        // Plain text match - upgrade hash securely on successful login
        isPasswordValid = user.password_hash === dto.password;
        if (isPasswordValid) {
          const salt = await bcrypt.genSalt(10);
          const newHash = await bcrypt.hash(dto.password, salt);
          await this.prisma.user.update({
            where: { id: user.id },
            data: { password_hash: newHash },
          });
        }
      }
    }

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // Update last_login
    await this.prisma.user.update({
      where: { id: user.id },
      data: { last_login: new Date().toISOString() },
    });

    // Generate cryptographically signed JWT
    const tokenPayload = {
      sub: user.id,
      email: user.email,
      orgId: user.organization_id,
      role: user.role,
    };
    const accessToken = jwt.sign(tokenPayload, this.getJwtSecret(), { expiresIn: '7d' });

    return {
      accessToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department || 'Management',
        organizationId: user.organization_id,
        organizationName: user.organization ? user.organization.name : 'ABC Technologies',
      },
    };
  }

  async register(dto: RegisterDto) {
    const normalizedEmail = dto.email.trim().toLowerCase();
    const existing = await this.prisma.user.findUnique({ where: { email: normalizedEmail } });
    if (existing) {
      throw new ConflictException('User with this email already exists');
    }

    // Hash password with bcrypt (salt rounds: 10)
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(dto.password, salt);

    // Create unique Organization with CUID
    let orgId = 'ORG001';
    if (dto.organizationName && dto.organizationName.trim()) {
      const newOrg = await this.prisma.organization.create({
        data: {
          name: dto.organizationName.trim(),
          currency: '₹',
          timezone: 'Asia/Kolkata',
        },
      });
      orgId = newOrg.id;

      // Seed 14-day free trial on Starter plan
      const starterPlan = await this.prisma.subscriptionPlan.findUnique({
        where: { slug: 'starter' },
      });
      if (starterPlan) {
        const startDate = new Date();
        const trialEnd = new Date(startDate.getTime() + 14 * 24 * 60 * 60 * 1000);
        await this.prisma.organizationSubscription.create({
          data: {
            organization_id: newOrg.id,
            plan_id: starterPlan.id,
            status: 'TRIALING',
            billing_cycle: 'MONTHLY',
            current_period_start: startDate,
            current_period_end: trialEnd,
            trial_ends_at: trialEnd,
            payment_provider: 'CASHFREE',
          },
        });
      }
    }

    const user = await this.prisma.user.create({
      data: {
        name: dto.name.trim(),
        email: normalizedEmail,
        password_hash: passwordHash,
        organization_id: orgId,
        role: 'Admin',
        department: 'Executive Administration',
        status: 'Active',
      },
      include: { organization: true },
    });

    const tokenPayload = {
      sub: user.id,
      email: user.email,
      orgId: user.organization_id,
      role: user.role,
    };
    const accessToken = jwt.sign(tokenPayload, this.getJwtSecret(), { expiresIn: '7d' });

    return {
      accessToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        organizationId: user.organization_id,
        organizationName: user.organization ? user.organization.name : 'ABC Technologies',
      },
    };
  }

  async getSession(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { organization: true },
    });
    if (!user) throw new UnauthorizedException('Session expired or invalid user');
    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        organizationId: user.organization_id,
        organizationName: user.organization ? user.organization.name : 'ABC Technologies',
      },
    };
  }
}
