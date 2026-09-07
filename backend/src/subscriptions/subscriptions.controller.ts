import { Controller, Get } from '@nestjs/common';
import { SubscriptionsService } from './subscriptions.service';
import { TenantOrg } from '../common/decorators/tenant.decorator';

@Controller('subscriptions')
export class SubscriptionsController {
  constructor(private subscriptionsService: SubscriptionsService) {}

  @Get('plans')
  getPlans() {
    return this.subscriptionsService.getPlans();
  }

  @Get('usage')
  getUsage(@TenantOrg() orgId: string) {
    return this.subscriptionsService.getUsage(orgId);
  }
}
