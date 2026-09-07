import { Controller, Get, Post, Body, Headers } from '@nestjs/common';
import { FinanceService } from './finance.service';

@Controller('api/finance')
export class FinanceController {
  constructor(private readonly financeService: FinanceService) {}

  @Get('products')
  async getProducts() {
    return this.financeService.findProducts();
  }

  @Get('quotes')
  async getQuotes(@Headers('x-org-id') orgId?: string) {
    return this.financeService.findQuotes(orgId || 'ORG001');
  }

  @Post('quotes')
  async createQuote(@Body() body: any, @Headers('x-org-id') orgId?: string) {
    return this.financeService.createQuote(body, orgId || 'ORG001');
  }

  @Get('invoices')
  async getInvoices(@Headers('x-org-id') orgId?: string) {
    return this.financeService.findInvoices(orgId || 'ORG001');
  }

  @Get('payments')
  async getPayments() {
    return this.financeService.findPayments();
  }

  @Post('payments')
  async recordPayment(@Body() body: any, @Headers('x-org-id') orgId?: string) {
    return this.financeService.recordPayment(body, orgId || 'ORG001');
  }
}
