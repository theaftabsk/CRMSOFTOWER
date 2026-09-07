import { Controller, Get, Post, Body, Query, Header } from '@nestjs/common';
import { LeadsService } from './leads.service';
import { LeadDto, ConvertLeadDto } from './crm.interface';

@Controller('api/leads')
export class LeadsController {
  constructor(private readonly leadsService: LeadsService) {}

  @Get()
  findAll(@Query('organization_id') orgId: string = 'ORG001') {
    return this.leadsService.findAll(orgId);
  }

  @Post()
  create(@Body() leadDto: LeadDto) {
    return this.leadsService.create(leadDto);
  }

  @Post('convert')
  convert(@Body() dto: ConvertLeadDto) {
    return this.leadsService.convertLead(dto);
  }
}
