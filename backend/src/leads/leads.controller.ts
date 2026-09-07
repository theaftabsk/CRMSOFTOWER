import { Controller, Get, Post, Body, Headers } from '@nestjs/common';
import { LeadsService } from './leads.service';

@Controller('api/leads')
export class LeadsController {
  constructor(private readonly leadsService: LeadsService) {}

  @Get()
  async getLeads(@Headers('x-org-id') orgId?: string) {
    return this.leadsService.findAll(orgId || 'ORG001');
  }

  @Post()
  async createLead(@Body() body: any, @Headers('x-org-id') orgId?: string) {
    return this.leadsService.create(body, orgId || 'ORG001');
  }

  @Post('convert')
  async convertLead(@Body() body: any, @Headers('x-org-id') orgId?: string) {
    return this.leadsService.convertLead(body, orgId || 'ORG001');
  }
}
