import { Controller, Get, Post, Patch, Delete, Param, Body } from '@nestjs/common';
import { ProductsService } from './products.service';
import { TenantOrg } from '../common/decorators/tenant.decorator';

@Controller('products')
export class ProductsController {
  constructor(private productsService: ProductsService) {}

  @Get('stats/summary')
  getStats(@TenantOrg() orgId: string) {
    return this.productsService.getStats(orgId);
  }

  @Get()
  findAll(@TenantOrg() orgId: string) {
    return this.productsService.findAll(orgId);
  }

  @Get(':id')
  findById(@TenantOrg() orgId: string, @Param('id') id: string) {
    return this.productsService.findById(orgId, id);
  }

  @Post()
  create(@TenantOrg() orgId: string, @Body() body: any) {
    return this.productsService.create(orgId, body);
  }

  @Patch(':id')
  update(
    @TenantOrg() orgId: string,
    @Param('id') id: string,
    @Body() body: any,
  ) {
    return this.productsService.update(orgId, id, body);
  }

  @Delete(':id')
  delete(@TenantOrg() orgId: string, @Param('id') id: string) {
    return this.productsService.delete(orgId, id);
  }
}
