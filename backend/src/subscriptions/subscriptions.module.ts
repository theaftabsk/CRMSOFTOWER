import { Module } from '@nestjs/common';
import { SubscriptionsService } from './subscriptions.service';
import { SubscriptionsController } from './subscriptions.controller';
import { CashfreeService } from './cashfree.service';
import { CashfreeController } from './cashfree.controller';
import { SubscriptionSecurityGuard } from './subscription-security.guard';

@Module({
  controllers: [SubscriptionsController, CashfreeController],
  providers: [SubscriptionsService, CashfreeService, SubscriptionSecurityGuard],
  exports: [SubscriptionsService, CashfreeService, SubscriptionSecurityGuard],
})
export class SubscriptionsModule {}

