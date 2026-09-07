import { Controller, Get, Post, Put, Patch, Delete, Param, Body } from '@nestjs/common';
import { DealsService } from './deals.service';
import { CreateDealDto } from './dto/create-deal.dto';
import { TenantOrg } from '../common/decorators/tenant.decorator';

@Controller('deals')
export class DealsController {
  constructor(private dealsService: DealsService) {}

  @Get()
  findAll(@TenantOrg() orgId: string) {
    return this.dealsService.findAll(orgId);
  }

  @Post()
  create(@TenantOrg() orgId: string, @Body() dto: CreateDealDto) {
    return this.dealsService.create(orgId, dto);
  }

  @Patch(':id/stage')
  updateStage(@TenantOrg() orgId: string, @Param('id') id: string, @Body('stage') stage: string) {
    return this.dealsService.updateStage(orgId, id, stage);
  }

  @Get(':id')
  findOne(@TenantOrg() orgId: string, @Param('id') id: string) {
    return this.dealsService.findOne(orgId, id);
  }

  @Put(':id')
  updatePut(@TenantOrg() orgId: string, @Param('id') id: string, @Body() body: any) {
    return this.dealsService.update(orgId, id, body);
  }

  @Patch(':id')
  updatePatch(@TenantOrg() orgId: string, @Param('id') id: string, @Body() body: any) {
    return this.dealsService.update(orgId, id, body);
  }

  @Delete(':id')
  remove(@TenantOrg() orgId: string, @Param('id') id: string) {
    return this.dealsService.remove(orgId, id);
  }
}
