import { Controller, Get, Post, Delete, Body, Query } from '@nestjs/common';
import { GoogleMeetService, CreateMeetEventDto } from './google-meet.service';
import { TenantOrg } from '../../common/decorators/tenant.decorator';

@Controller('integrations/google-meet')
export class GoogleMeetController {
  constructor(private readonly googleMeetService: GoogleMeetService) {}

  /**
   * 1. Get Google OAuth 2.0 URL
   */
  @Get('auth-url')
  getOAuthUrl(
    @TenantOrg() orgId: string,
    @Query('redirect_uri') redirectUri?: string,
  ) {
    return this.googleMeetService.getOAuthUrl(orgId, redirectUri);
  }

  /**
   * 2. Exchange OAuth authorization code for tokens
   */
  @Post('exchange')
  exchangeCode(
    @TenantOrg() orgId: string,
    @Body() body: { code: string; redirect_uri?: string },
  ) {
    return this.googleMeetService.exchangeAuthCode(orgId, body.code, body.redirect_uri);
  }

  /**
   * 3. Current Google Meet integration status & account info
   */
  @Get('status')
  getStatus(@TenantOrg() orgId: string) {
    return this.googleMeetService.getConnectionStatus(orgId);
  }

  /**
   * 4. Create Google Meet conference link for a meeting
   */
  @Post('create')
  createMeet(
    @TenantOrg() orgId: string,
    @Body() dto: CreateMeetEventDto,
  ) {
    return this.googleMeetService.createMeetEvent(orgId, dto);
  }

  /**
   * 5. Run Live Diagnostic Health Check on Google API
   */
  @Post('test')
  testConnection(@TenantOrg() orgId: string) {
    return this.googleMeetService.testConnection(orgId);
  }

  /**
   * 6. Disconnect Google Workspace Integration
   */
  @Delete('disconnect')
  disconnect(@TenantOrg() orgId: string) {
    return this.googleMeetService.disconnect(orgId);
  }

  /**
   * 7. List scheduled Google Meet meetings
   */
  @Get('meetings')
  getMeetings(@TenantOrg() orgId: string) {
    return this.googleMeetService.getGoogleMeetings(orgId);
  }
}
