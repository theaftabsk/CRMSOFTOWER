import { Controller, Get, Post, Patch, Delete, Body, Param } from '@nestjs/common';
import { InvoicesService } from './invoices.service';
import { TenantOrg } from '../common/decorators/tenant.decorator';

@Controller('invoices')
export class InvoicesController {
  constructor(private invoicesService: InvoicesService) {}

  @Get()
  findAll(@TenantOrg() orgId: string) {
    return this.invoicesService.findAll(orgId);
  }

  @Get('stats/summary')
  getStats(@TenantOrg() orgId: string) {
    return this.invoicesService.getStats(orgId);
  }

  @Get(':id')
  findOne(@TenantOrg() orgId: string, @Param('id') id: string) {
    return this.invoicesService.findOne(orgId, id);
  }

  @Post()
  create(@TenantOrg() orgId: string, @Body() body: any) {
    return this.invoicesService.create(orgId, body);
  }

  @Patch(':id/status')
  updateStatus(
    @TenantOrg() orgId: string,
    @Param('id') id: string,
    @Body('status') status: string,
  ) {
    return this.invoicesService.updateStatus(orgId, id, status);
  }

  @Post(':id/record-payment')
  recordPayment(
    @TenantOrg() orgId: string,
    @Param('id') id: string,
    @Body() body: any,
  ) {
    return this.invoicesService.recordPayment(orgId, id, body);
  }

  @Patch(':id')
  update(
    @TenantOrg() orgId: string,
    @Param('id') id: string,
    @Body() body: any,
  ) {
    return this.invoicesService.update(orgId, id, body);
  }

  @Delete(':id')
  delete(@TenantOrg() orgId: string, @Param('id') id: string) {
    return this.invoicesService.delete(orgId, id);
  }
}
