import { Controller, Post, Get, Body, Param, Headers, Req, Logger } from '@nestjs/common';
import { SubscriptionsService } from './subscriptions.service';
import { CashfreeService } from './cashfree.service';
import { TenantOrg } from '../common/decorators/tenant.decorator';

@Controller('subscriptions/cashfree')
export class CashfreeController {
  private readonly logger = new Logger(CashfreeController.name);

  constructor(
    private readonly subscriptionsService: SubscriptionsService,
    private readonly cashfreeService: CashfreeService,
  ) {}

  @Get('config')
  getConfig() {
    return {
      isLive: this.cashfreeService.isConfigured(),
      env: process.env.CASHFREE_ENV || 'TEST',
      apiVersion: process.env.CASHFREE_API_VERSION || '2023-08-01',
    };
  }

  @Post('create-order')
  async createOrder(
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

  @Post('verify-order')
  async verifyOrder(
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

  @Get('order/:orderId')
  async getOrder(@Param('orderId') orderId: string) {
    return this.cashfreeService.getOrder(orderId);
  }

  @Post('webhook')
  async handleWebhook(
    @Headers('x-webhook-signature') signature: string,
    @Headers('x-webhook-timestamp') timestamp: string,
    @Req() req: any,
    @Body() payload: any,
  ) {
    this.logger.log(`Cashfree webhook received: ${payload?.type || 'EVENT'}`);

    // If signature provided, verify it
    if (signature && timestamp && req.rawBody) {
      const isValid = this.cashfreeService.verifyWebhookSignature(req.rawBody, signature, timestamp);
      if (!isValid) {
        this.logger.warn('Invalid Cashfree webhook signature');
        return { status: 'invalid_signature' };
      }
    }

    if (payload?.type === 'PAYMENT_SUCCESS_WEBHOOK' && payload?.data?.order?.order_id) {
      const orderId = payload.data.order.order_id;
      this.logger.log(`Payment confirmed via webhook for Order: ${orderId}`);
    }

    return { status: 'OK' };
  }
}
