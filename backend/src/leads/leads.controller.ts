import { Controller, Get, Post, Put, Patch, Delete, Param, Body } from '@nestjs/common';
import { LeadsService } from './leads.service';
import { CreateLeadDto } from './dto/create-lead.dto';
import { ConvertLeadDto } from './dto/convert-lead.dto';
import { TenantOrg } from '../common/decorators/tenant.decorator';

@Controller('leads')
export class LeadsController {
  constructor(private leadsService: LeadsService) {}

  @Get()
  findAll(@TenantOrg() orgId: string) {
    return this.leadsService.findAll(orgId);
  }

  @Post()
  create(@TenantOrg() orgId: string, @Body() dto: CreateLeadDto) {
    return this.leadsService.create(orgId, dto);
  }

  @Post('convert')
  convert(@TenantOrg() orgId: string, @Body() dto: ConvertLeadDto) {
    return this.leadsService.convert(orgId, dto);
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
