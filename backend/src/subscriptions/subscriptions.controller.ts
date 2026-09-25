import { Controller, Get, Post, Patch, Param, Body } from '@nestjs/common';
import { SubscriptionsService } from './subscriptions.service';
import { TenantOrg } from '../common/decorators/tenant.decorator';

@Controller('subscriptions')
export class SubscriptionsController {
  constructor(private subscriptionsService: SubscriptionsService) {}

  @Get('plans')
  getPlans() {
    return this.subscriptionsService.getPlans();
  }

  @Patch('plans/:id')
  updatePlan(@Param('id') id: string, @Body() body: any) {
    return this.subscriptionsService.updatePlan(id, body);
  }

  @Get('current')
  getCurrentSubscription(@TenantOrg() orgId: string) {
    return this.subscriptionsService.getCurrentSubscription(orgId || 'ORG001');
  }

  @Post('cashfree/create-order')
  createCashfreeOrder(
    @TenantOrg() orgId: string,
    @Body()
    body: {
      planSlug: string;
      billingCycle: 'MONTHLY' | 'YEARLY';
      seats?: number;
      customerEmail?: string;
      customerPhone?: string;
      customerName?: string;
      returnUrl?: string;
    },
  ) {
    return this.subscriptionsService.createCashfreeOrder(orgId || 'ORG001', body);
  }

  @Post('cashfree/verify-order')
  verifyCashfreeOrder(
    @TenantOrg() orgId: string,
    @Body()
    body: {
      order_id: string;
      planSlug: string;
      billingCycle: 'MONTHLY' | 'YEARLY';
      seats?: number;
    },
  ) {
    return this.subscriptionsService.verifyCashfreeOrder(orgId || 'ORG001', body);
  }

  @Post('debug/toggle-trial-expired')
  setTrialExpiredDebug(
    @TenantOrg() orgId: string,
    @Body() body: { expired: boolean },
  ) {
    return this.subscriptionsService.setTrialExpiredDebug(orgId || 'ORG001', Boolean(body.expired));
  }

  @Post('upgrade')
  upgradePlan(
    @TenantOrg() orgId: string,
    @Body()
    body: {
      planSlug: string;
      billingCycle: 'MONTHLY' | 'YEARLY';
      seats?: number;
      paymentMethod?: string;
    },
  ) {
    return this.subscriptionsService.upgradePlan(orgId || 'ORG001', body);
  }

  @Post('cancel')
  cancelSubscription(@TenantOrg() orgId: string) {
    return this.subscriptionsService.cancelSubscription(orgId || 'ORG001');
  }

  @Get('invoices')
  getInvoices(@TenantOrg() orgId: string) {
    return this.subscriptionsService.getInvoices(orgId || 'ORG001');
  }
}
