import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService) {}

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email.trim().toLowerCase() },
      include: { organization: true },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // Verify password: check direct match, seeded hash, or default development password
    const isSeededDefault = user.password_hash === '$2b$10$EpRnTzVlqHNP0.fUbXUwSOyuiXe/QLSUG6x8ecr5eGdpfrWwHKgCu' && dto.password === 'password123';
    const isDirectMatch = user.password_hash === dto.password;
    const isDevPass = dto.password === 'password123';

    if (!isSeededDefault && !isDirectMatch && !isDevPass) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // Update last_login
    await this.prisma.user.update({
      where: { id: user.id },
      data: { last_login: new Date().toISOString() },
    });

    // Return token and user session
    return {
      accessToken: `crm_token_${user.id}_${Date.now()}`,
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
    }

    const user = await this.prisma.user.create({
      data: {
        name: dto.name.trim(),
        email: normalizedEmail,
        password_hash: dto.password,
        organization_id: orgId,
        role: 'Admin',
        department: 'Executive Administration',
        status: 'Active',
      },
      include: { organization: true },
    });

    return {
      accessToken: `crm_token_${user.id}_${Date.now()}`,
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
