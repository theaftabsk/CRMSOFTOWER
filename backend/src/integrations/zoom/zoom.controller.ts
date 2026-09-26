import { Controller, Get, Post, Delete, Body, Query } from '@nestjs/common';
import { ZoomService, CreateZoomMeetingDto } from './zoom.service';
import { TenantOrg } from '../../common/decorators/tenant.decorator';

@Controller('integrations/zoom')
export class ZoomController {
  constructor(private readonly zoomService: ZoomService) {}

  @Get('status')
  getStatus(@TenantOrg() orgId: string) {
    return this.zoomService.getStatus(orgId);
  }

  @Get('auth-url')
  getAuthUrl(
    @TenantOrg() orgId: string,
    @Query('redirect_uri') redirectUri?: string,
  ) {
    return this.zoomService.getAuthUrl(orgId, redirectUri);
  }

  @Post('exchange')
  exchangeCode(
    @TenantOrg() orgId: string,
    @Body() body: { code: string; redirect_uri?: string },
  ) {
    return this.zoomService.exchangeAuthCode(orgId, body.code, body.redirect_uri);
  }

  @Post('create')
  createMeeting(
    @TenantOrg() orgId: string,
    @Body() dto: CreateZoomMeetingDto,
  ) {
    return this.zoomService.createZoomMeeting(orgId, dto);
  }

  @Post('test')
  testConnection(@TenantOrg() orgId: string) {
    return this.zoomService.testConnection(orgId);
  }

  @Delete('disconnect')
  disconnect(@TenantOrg() orgId: string) {
    return this.zoomService.disconnect(orgId);
  }
}
