import { Controller, Get, Post, Patch, Delete, Body, Param } from '@nestjs/common';
import { QuotesService } from './quotes.service';
import { TenantOrg } from '../common/decorators/tenant.decorator';

@Controller('quotes')
export class QuotesController {
  constructor(private quotesService: QuotesService) {}

  @Get()
  findAll(@TenantOrg() orgId: string) {
    return this.quotesService.findAll(orgId);
  }

  @Get('stats/summary')
  getStats(@TenantOrg() orgId: string) {
    return this.quotesService.getStats(orgId);
  }

  @Get(':id')
  findOne(@TenantOrg() orgId: string, @Param('id') id: string) {
    return this.quotesService.findOne(orgId, id);
  }

  @Post()
  create(@TenantOrg() orgId: string, @Body() body: any) {
    return this.quotesService.create(orgId, body);
  }

  @Patch(':id/status')
  updateStatus(
    @TenantOrg() orgId: string,
    @Param('id') id: string,
    @Body('status') status: string,
  ) {
    return this.quotesService.updateStatus(orgId, id, status);
  }

  @Post(':id/convert-to-order')
  convertToOrder(@TenantOrg() orgId: string, @Param('id') id: string) {
    return this.quotesService.convertToOrder(orgId, id);
  }

  @Patch(':id')
  update(
    @TenantOrg() orgId: string,
    @Param('id') id: string,
    @Body() body: any,
  ) {
    return this.quotesService.update(orgId, id, body);
  }

  @Delete(':id')
  delete(@TenantOrg() orgId: string, @Param('id') id: string) {
    return this.quotesService.delete(orgId, id);
  }
}
