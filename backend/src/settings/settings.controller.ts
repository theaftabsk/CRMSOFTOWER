import { Controller, Get, Post, Body, Headers } from '@nestjs/common';
import { SettingsService } from './settings.service';

@Controller('api/settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get('organization')
  async getOrganization(@Headers('x-org-id') orgId?: string) {
    return this.settingsService.getOrganization(orgId || 'ORG001');
  }

  @Get('custom-fields')
  async getCustomFields(@Headers('x-org-id') orgId?: string) {
    return this.settingsService.getCustomFields(orgId || 'ORG001');
  }

  @Post('custom-fields')
  async addCustomField(@Body() body: any, @Headers('x-org-id') orgId?: string) {
    return this.settingsService.addCustomField(body, orgId || 'ORG001');
  }

  @Get('audit-logs')
  async getAuditLogs(@Headers('x-org-id') orgId?: string) {
    return this.settingsService.getAuditLogs(orgId || 'ORG001');
  }
}
