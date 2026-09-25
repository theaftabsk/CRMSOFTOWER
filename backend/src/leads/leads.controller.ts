import { Controller, Get, Post, Put, Patch, Delete, Param, Body, Query } from '@nestjs/common';
import { LeadsService } from './leads.service';
import { TenantOrg } from '../common/decorators/tenant.decorator';

@Controller('leads')
export class LeadsController {
  constructor(private leadsService: LeadsService) {}

  @Get()
  findAll(
    @TenantOrg() orgId: string,
    @Query('saved_view') savedView?: string,
    @Query('owner') owner?: string,
    @Query('status') status?: string,
    @Query('search') search?: string,
  ) {
    return this.leadsService.findAll(orgId, { saved_view: savedView, owner, status, search });
  }

  @Post('check-duplicate')
  checkDuplicate(@TenantOrg() orgId: string, @Body() body: any) {
    return this.leadsService.checkDuplicates(orgId, body);
  }

  @Post('merge')
  mergeLeads(@TenantOrg() orgId: string, @Body() body: any) {
    return this.leadsService.mergeLeads(orgId, body);
  }

  @Post()
  create(@TenantOrg() orgId: string, @Body() dto: any) {
    return this.leadsService.create(orgId, dto);
  }

  @Post(':id/activity')
  logActivity(
    @TenantOrg() orgId: string,
    @Param('id') id: string,
    @Body() body: any,
  ) {
    return this.leadsService.logActivity(orgId, id, body);
  }

  @Post(':id/convert-enterprise')
  convertEnterprise(
    @TenantOrg() orgId: string,
    @Param('id') id: string,
    @Body() body: any,
  ) {
    return this.leadsService.convertEnterprise(orgId, id, body);
  }

  // Legacy convert support
  @Post('convert')
  convert(@TenantOrg() orgId: string, @Body() dto: any) {
    return this.leadsService.convertEnterprise(orgId, dto.leadId, {
      accountMode: 'CREATE_NEW',
      contactMode: 'CREATE_NEW',
      createDeal: true,
      dealTitle: dto.dealTitle,
      dealValue: dto.dealValue,
    });
  }

  @Get(':id')
  findOne(@TenantOrg() orgId: string, @Param('id') id: string) {
    return this.leadsService.findOne(orgId, id);
  }

  @Put(':id')
  updatePut(@TenantOrg() orgId: string, @Param('id') id: string, @Body() body: any) {
    return this.leadsService.update(orgId, id, body);
  }

  @Patch(':id')
  updatePatch(@TenantOrg() orgId: string, @Param('id') id: string, @Body() body: any) {
    return this.leadsService.update(orgId, id, body);
  }

  @Delete(':id')
  remove(@TenantOrg() orgId: string, @Param('id') id: string) {
    return this.leadsService.remove(orgId, id);
  }
}
