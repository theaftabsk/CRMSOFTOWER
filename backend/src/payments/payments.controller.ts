import { Controller, Get, Post, Body } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { TenantOrg } from '../common/decorators/tenant.decorator';

@Controller('payments')
export class PaymentsController {
  constructor(private paymentsService: PaymentsService) {}

  @Get()
  findAll(@TenantOrg() orgId: string) {
    return this.paymentsService.findAll(orgId);
  }

  @Post()
  recordPayment(@TenantOrg() orgId: string, @Body() body: any) {
    return this.paymentsService.recordPayment(orgId, body);
  }
}
