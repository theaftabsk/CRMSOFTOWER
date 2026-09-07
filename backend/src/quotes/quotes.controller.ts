import { Controller, Get, Post, Body } from '@nestjs/common';
import { QuotesService } from './quotes.service';
import { TenantOrg } from '../common/decorators/tenant.decorator';

@Controller('quotes')
export class QuotesController {
  constructor(private quotesService: QuotesService) {}

  @Get()
  findAll(@TenantOrg() orgId: string) {
    return this.quotesService.findAll(orgId);
  }

  @Post()
  create(@TenantOrg() orgId: string, @Body() body: any) {
    return this.quotesService.create(orgId, body);
  }
}
