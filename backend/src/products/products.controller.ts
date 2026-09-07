import { Controller, Get, Post, Body } from '@nestjs/common';
import { ProductsService } from './products.service';
import { TenantOrg } from '../common/decorators/tenant.decorator';

@Controller('products')
export class ProductsController {
  constructor(private productsService: ProductsService) {}

  @Get()
  findAll(@TenantOrg() orgId: string) {
    return this.productsService.findAll(orgId);
  }

  @Post()
  create(@TenantOrg() orgId: string, @Body() body: any) {
    return this.productsService.create(orgId, body);
  }
}
