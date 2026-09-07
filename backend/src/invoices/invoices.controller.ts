import { Controller, Get, Post, Body } from '@nestjs/common';
import { InvoicesService } from './invoices.service';
import { TenantOrg } from '../common/decorators/tenant.decorator';

@Controller('invoices')
export class InvoicesController {
  constructor(private invoicesService: InvoicesService) {}

  @Get()
  findAll(@TenantOrg() orgId: string) {
    return this.invoicesService.findAll(orgId);
  }

  @Post()
  create(@TenantOrg() orgId: string, @Body() body: any) {
    return this.invoicesService.create(orgId, body);
  }
}
