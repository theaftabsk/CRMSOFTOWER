import { Controller, Get, Post, Delete, Body, Param } from '@nestjs/common';
import { IntegrationsService } from './integrations.service';
import { GoogleMeetService } from './google-meet/google-meet.service';
import { TenantOrg } from '../common/decorators/tenant.decorator';

@Controller('integrations')
export class IntegrationsController {
  constructor(
    private readonly integrationsService: IntegrationsService,
    private readonly googleMeetService: GoogleMeetService,
  ) {}

  // 1. Get All Enterprise Apps Catalog with tenant connection states
  @Get()
  getAllApps(@TenantOrg() orgId: string) {
    return this.integrationsService.getAllApps(orgId);
  }

  // 2. Connect / Save Configuration for an App
  @Post(':appId/connect')
  connectApp(
    @TenantOrg() orgId: string,
    @Param('appId') appId: string,
    @Body() body: any,
  ) {
    return this.integrationsService.connectApp(orgId, appId, body);
  }

  // 3. Run Live Health Check / Diagnostic Test Ping
  @Post(':appId/test')
  testApp(
    @TenantOrg() orgId: string,
    @Param('appId') appId: string,
  ) {
    return this.integrationsService.testApp(orgId, appId);
  }

  // 4. Disconnect an App
  @Delete(':appId')
  disconnectApp(
    @TenantOrg() orgId: string,
    @Param('appId') appId: string,
  ) {
    return this.integrationsService.disconnectApp(orgId, appId);
  }

  // 5. Generate Real Google Workspace OAuth URL
  @Get('google/oauth-url')
  getGoogleOAuthUrl(@TenantOrg() orgId: string) {
    return this.googleMeetService.getOAuthUrl(orgId);
  }

  // 6. Backward-compatible calendar route
  @Get('calendar')
  async getCalendarIntegrations(@TenantOrg() orgId: string) {
    const apps = await this.integrationsService.getAllApps(orgId);
    return apps.filter((a) => a.category === 'CALENDAR');
  }
}
