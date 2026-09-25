import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from '../../prisma/prisma.service';
import { SCOPES_KEY } from '../decorators/require-scope.decorator';
import * as crypto from 'crypto';

// In-memory token bucket / sliding window rate-limiter for API keys
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

@Injectable()
export class ApiKeyGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    // 1. Extract API key from x-api-key or Authorization Bearer
    let rawKey = request.headers['x-api-key'];
    if (!rawKey && request.headers['authorization']) {
      const authHeader = request.headers['authorization'];
      if (authHeader.startsWith('Bearer ')) {
        rawKey = authHeader.substring(7).trim();
      }
    }

    if (!rawKey || typeof rawKey !== 'string') {
      throw new UnauthorizedException('Missing x-api-key or Bearer token header');
    }

    // 2. Hash raw key using SHA-256
    const keyHash = crypto.createHash('sha256').update(rawKey.trim()).digest('hex');

    // 3. Lookup in database
    const keyRecord = await this.prisma.apiKey.findUnique({
      where: { api_key_hash: keyHash },
    });

    if (!keyRecord) {
      throw new UnauthorizedException('Invalid or unknown API Key');
    }

    // 4. Validate revocation
    if (keyRecord.is_revoked) {
      throw new UnauthorizedException('This API Key has been revoked');
    }

    // 5. Validate expiration
    if (keyRecord.expires_at && new Date(keyRecord.expires_at) < new Date()) {
      throw new UnauthorizedException('This API Key has expired');
    }

    // 6. Rate Limit check (per minute)
    const now = Date.now();
    const limitWindow = 60 * 1000;
    const rateLimit = keyRecord.rate_limit_per_min || 120;
    const currentRate = rateLimitMap.get(keyRecord.id);

    if (currentRate && currentRate.resetAt > now) {
      if (currentRate.count >= rateLimit) {
        throw new ForbiddenException(
          `Rate limit exceeded. Maximum ${rateLimit} requests per minute allowed.`,
        );
      }
      currentRate.count++;
    } else {
      rateLimitMap.set(keyRecord.id, { count: 1, resetAt: now + limitWindow });
    }

    // 7. Check Granular Scopes
    const requiredScopes = this.reflector.getAllAndOverride<string[]>(SCOPES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (requiredScopes && requiredScopes.length > 0) {
      const hasAllScopes = requiredScopes.every((scope) =>
        keyRecord.permissions.includes(scope),
      );
      if (!hasAllScopes) {
        throw new ForbiddenException(
          `Insufficient permissions. Required scope(s): [${requiredScopes.join(', ')}]. Provided key has: [${keyRecord.permissions.join(', ')}]`,
        );
      }
    }

    // 8. Enforce Organization Isolation: attach to request
    request.organizationId = keyRecord.organization_id;
    request.apiKey = {
      id: keyRecord.id,
      name: keyRecord.key_name,
      prefix: keyRecord.key_prefix,
      organizationId: keyRecord.organization_id,
      scopes: keyRecord.permissions,
    };

    // Update last_used_at asynchronously (without blocking response)
    this.prisma.apiKey
      .update({
        where: { id: keyRecord.id },
        data: { last_used_at: new Date() },
      })
      .catch(() => {});

    return true;
  }
}
