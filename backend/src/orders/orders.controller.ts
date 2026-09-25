import { Controller, Get, Post, Patch, Delete, Body, Param } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { TenantOrg } from '../common/decorators/tenant.decorator';

@Controller('orders')
export class OrdersController {
  constructor(private ordersService: OrdersService) {}

  @Get()
  findAll(@TenantOrg() orgId: string) {
    return this.ordersService.findAll(orgId);
  }

  @Get('stats/summary')
  getStats(@TenantOrg() orgId: string) {
    return this.ordersService.getStats(orgId);
  }

  @Get(':id')
  findOne(@TenantOrg() orgId: string, @Param('id') id: string) {
    return this.ordersService.findOne(orgId, id);
  }

  @Post()
  create(@TenantOrg() orgId: string, @Body() body: any) {
    return this.ordersService.create(orgId, body);
  }

  @Patch(':id/status')
  updateStatus(
    @TenantOrg() orgId: string,
    @Param('id') id: string,
    @Body('status') status: string,
  ) {
    return this.ordersService.updateStatus(orgId, id, status);
  }

  @Post(':id/convert-to-invoice')
  convertToInvoice(@TenantOrg() orgId: string, @Param('id') id: string) {
    return this.ordersService.convertToInvoice(orgId, id);
  }

  @Patch(':id')
  update(
    @TenantOrg() orgId: string,
    @Param('id') id: string,
    @Body() body: any,
  ) {
    return this.ordersService.update(orgId, id, body);
  }

  @Delete(':id')
  delete(@TenantOrg() orgId: string, @Param('id') id: string) {
    return this.ordersService.delete(orgId, id);
  }
}
