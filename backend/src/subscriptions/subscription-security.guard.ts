import {
  Injectable,
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { SubscriptionsService } from './subscriptions.service';

/**
 * Enforces 14-Day Free Trial & Subscription Access Rules.
 * - During 14-day trial: All features are 100% unlocked.
 * - When trial expires without active subscription: Mutating operations
 *   (POST, PUT, PATCH, DELETE) are rejected with 402 Payment Required.
 */
@Injectable()
export class SubscriptionSecurityGuard implements CanActivate {
  private readonly logger = new Logger(SubscriptionSecurityGuard.name);

  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const path: string = request.path || '';
    const method: string = request.method || 'GET';

    // Allow read requests (GET) and subscription/auth routes always
    if (
      method === 'GET' ||
      path.includes('/subscriptions') ||
      path.includes('/auth') ||
      path.includes('/health') ||
      path.includes('/public')
    ) {
      return true;
    }

    const orgId = request.tenantOrg || request.headers['x-organization-id'] || 'ORG001';

    try {
      const subInfo = await this.subscriptionsService.getCurrentSubscription(orgId);

      if (subInfo?.access?.isLocked) {
        this.logger.warn(`Organization ${orgId} attempted mutation while subscription is locked.`);
        throw new HttpException(
          {
            statusCode: HttpStatus.PAYMENT_REQUIRED,
            error: 'Subscription Required',
            code: 'TRIAL_EXPIRED',
            message:
              'Your 14-day free trial has expired. Please subscribe with Cashfree Payments to continue modifying CRM records.',
          },
          HttpStatus.PAYMENT_REQUIRED,
        );
      }
    } catch (err: any) {
      if (err instanceof HttpException) throw err;
      // If error resolving, do not block in development
      this.logger.error('Error verifying subscription access status:', err.message);
    }

    return true;
  }
}
