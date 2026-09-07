import { Controller, Get, Post, Patch, Param, Body, Headers } from '@nestjs/common';
import { DealsService } from './deals.service';

@Controller('api/deals')
export class DealsController {
  constructor(private readonly dealsService: DealsService) {}

  @Get()
  async getDeals(@Headers('x-org-id') orgId?: string) {
    return this.dealsService.findAll(orgId || 'ORG001');
  }

  @Post()
  async createDeal(@Body() body: any, @Headers('x-org-id') orgId?: string) {
    return this.dealsService.create(body, orgId || 'ORG001');
  }

  @Patch(':id/stage')
  async updateStage(@Param('id') id: string, @Body('stage') stage: string, @Headers('x-org-id') orgId?: string) {
    return this.dealsService.updateStage(id, stage, orgId || 'ORG001');
  }
}
