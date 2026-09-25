import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateApiKeyDto } from './dto/create-api-key.dto';
import * as crypto from 'crypto';

@Injectable()
export class ApiKeysService {
  constructor(private prisma: PrismaService) {}

  async create(orgId: string, dto: CreateApiKeyDto) {
    // 1. Generate 32-byte secure random secret
    const randomHex = crypto.randomBytes(24).toString('hex');
    const rawApiKey = `crm_live_${randomHex}`;

    // 2. Hash using SHA-256 for secure database storage
    const keyHash = crypto.createHash('sha256').update(rawApiKey).digest('hex');

    // 3. Extract safe prefix for identification (e.g. "crm_live_9f8b...")
    const keyPrefix = `crm_live_${randomHex.substring(0, 8)}...`;

    // 4. Save to database
    const record = await this.prisma.apiKey.create({
      data: {
        organization_id: orgId,
        key_name: dto.key_name,
        key_prefix: keyPrefix,
        api_key_hash: keyHash,
        permissions: dto.permissions && dto.permissions.length > 0
          ? dto.permissions
          : ['leads:read', 'leads:write'],
        rate_limit_per_min: dto.rate_limit_per_min || 120,
        allowed_domains: dto.allowed_domains || [],
        expires_at: dto.expires_at ? new Date(dto.expires_at) : null,
      },
    });

    // Return the raw key ONCE so user can copy it. It is never stored or displayed again.
    return {
      id: record.id,
      key_name: record.key_name,
      key_prefix: record.key_prefix,
      raw_api_key: rawApiKey,
      permissions: record.permissions,
      rate_limit_per_min: record.rate_limit_per_min,
      expires_at: record.expires_at,
      created_at: record.created_at,
      notice: 'Save this API Key now! For security reasons, it will never be displayed again.',
    };
  }

  async findAll(orgId: string) {
    return this.prisma.apiKey.findMany({
      where: { organization_id: orgId },
      select: {
        id: true,
        key_name: true,
        key_prefix: true,
        permissions: true,
        rate_limit_per_min: true,
        allowed_domains: true,
        is_revoked: true,
        expires_at: true,
        last_used_at: true,
        created_at: true,
      },
      orderBy: { created_at: 'desc' },
    });
  }

  async revoke(orgId: string, id: string) {
    const key = await this.prisma.apiKey.findFirst({
      where: { id, organization_id: orgId },
    });

    if (!key) {
      throw new NotFoundException('API Key not found');
    }

    return this.prisma.apiKey.update({
      where: { id },
      data: { is_revoked: true },
    });
  }

  async delete(orgId: string, id: string) {
    const key = await this.prisma.apiKey.findFirst({
      where: { id, organization_id: orgId },
    });

    if (!key) {
      throw new NotFoundException('API Key not found');
    }

    return this.prisma.apiKey.delete({ where: { id } });
  }

  // Partner Developer Access Requests
  async getRequests(orgId: string) {
    return this.prisma.partnerAccessRequest.findMany({
      where: { organization_id: orgId },
      orderBy: { created_at: 'desc' },
    });
  }

  async approveRequest(orgId: string, requestId: string) {
    const req = await this.prisma.partnerAccessRequest.findFirst({
      where: { id: requestId, organization_id: orgId },
    });

    if (!req) {
      throw new NotFoundException('Partner request not found');
    }

    if (req.status === 'Approved') {
      return { success: true, message: 'Request is already approved' };
    }

    // Auto-generate API key for partner with requested scopes
    const keyResult = await this.create(orgId, {
      key_name: `${req.company_name} (${req.developer_name})`,
      permissions: req.requested_scopes,
      rate_limit_per_min: 150,
    });

    await this.prisma.partnerAccessRequest.update({
      where: { id: requestId },
      data: {
        status: 'Approved',
        approved_key_id: keyResult.id,
      },
    });

    return {
      success: true,
      message: `Access approved for ${req.developer_name}. API key has been created.`,
      issued_key: keyResult,
    };
  }

  async rejectRequest(orgId: string, requestId: string) {
    const req = await this.prisma.partnerAccessRequest.findFirst({
      where: { id: requestId, organization_id: orgId },
    });

    if (!req) {
      throw new NotFoundException('Partner request not found');
    }

    return this.prisma.partnerAccessRequest.update({
      where: { id: requestId },
      data: { status: 'Rejected' },
    });
  }
}
