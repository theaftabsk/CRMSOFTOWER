import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class IdempotencyInterceptor implements NestInterceptor {
  constructor(private prisma: PrismaService) {}

  async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest();
    const idempotencyKey = request.headers['idempotency-key'];
    const orgId = request.organizationId;

    if (!idempotencyKey || typeof idempotencyKey !== 'string' || !orgId) {
      return next.handle();
    }

    const trimmedKey = idempotencyKey.trim();

    // Check if previously processed
    const existing = await this.prisma.idempotencyRecord.findUnique({
      where: {
        organization_id_key: {
          organization_id: orgId,
          key: trimmedKey,
        },
      },
    });

    if (existing) {
      const response = context.switchToHttp().getResponse();
      response.status(existing.status_code);
      response.setHeader('X-Cache-Idempotency', 'HIT');
      return of(existing.response_body);
    }

    // Otherwise proceed and cache the response
    return next.handle().pipe(
      tap(async (responseBody) => {
        try {
          const response = context.switchToHttp().getResponse();
          await this.prisma.idempotencyRecord.create({
            data: {
              organization_id: orgId,
              key: trimmedKey,
              method: request.method,
              path: request.url,
              status_code: response.statusCode || 200,
              response_body: responseBody || {},
            },
          });
        } catch (e) {
          // In case of concurrent race condition, do not crash response
        }
      }),
    );
  }
}
