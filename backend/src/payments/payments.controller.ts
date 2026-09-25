import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { TenantOrg } from '../common/decorators/tenant.decorator';

@Controller('payments')
export class PaymentsController {
  constructor(private paymentsService: PaymentsService) {}

  @Get()
  findAll(@TenantOrg() orgId: string) {
    return this.paymentsService.findAll(orgId);
  }

  @Get('stats')
  getPaymentStats(@TenantOrg() orgId: string) {
    return this.paymentsService.getPaymentStats(orgId);
  }

  @Get(':id/receipt')
  getReceipt(
    @TenantOrg() orgId: string,
    @Param('id') id: string,
  ) {
    return this.paymentsService.getReceipt(orgId, id);
  }

  @Post()
  recordPayment(@TenantOrg() orgId: string, @Body() body: any) {
    return this.paymentsService.recordPayment(orgId, body);
  }
}
