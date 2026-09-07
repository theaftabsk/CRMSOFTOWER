import { Controller, Get, Post, Body } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { TenantOrg } from '../common/decorators/tenant.decorator';

@Controller('orders')
export class OrdersController {
  constructor(private ordersService: OrdersService) {}

  @Get()
  findAll(@TenantOrg() orgId: string) {
    return this.ordersService.findAll(orgId);
  }

  @Post()
  create(@TenantOrg() orgId: string, @Body() body: any) {
    return this.ordersService.create(orgId, body);
  }
}
