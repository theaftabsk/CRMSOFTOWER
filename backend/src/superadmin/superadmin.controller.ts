import { 
  Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards 
} from '@nestjs/common';
import { SuperAdminService } from './superadmin.service';
import { SuperAdminGuard } from './superadmin.guard';

@Controller('superadmin')
@UseGuards(SuperAdminGuard)
export class SuperAdminController {
  constructor(private readonly superAdminService: SuperAdminService) {}

  @Get('overview')
  getOverview() {
    return this.superAdminService.getOverview();
  }

  @Get('tenants')
  getTenants(@Query() query: { search?: string; plan?: string }) {
    return this.superAdminService.getTenants(query);
  }

  @Post('tenants')
  createTenant(@Body() body: {
    name: string;
    adminEmail?: string;
    adminName?: string;
    vertical?: string;
    plan?: string;
    currency?: string;
  }) {
    return this.superAdminService.createTenant(body);
  }

  @Get('tenants/:id')
  getTenantById(@Param('id') id: string) {
    return this.superAdminService.getTenantById(id);
  }

  @Patch('tenants/:id/status')
  toggleTenantStatus(@Param('id') id: string) {
    return this.superAdminService.toggleTenantStatus(id);
  }

  @Get('tenants/:id/export')
  exportTenantData(@Param('id') id: string) {
    return this.superAdminService.exportTenantData(id);
  }

  @Patch('tenants/:id')
  updateTenant(@Param('id') id: string, @Body() body: any) {
    return this.superAdminService.updateTenant(id, body);
  }

  @Delete('tenants/:id')
  deleteTenant(@Param('id') id: string) {
    return this.superAdminService.deleteTenant(id);
  }

  @Get('subscriptions')
  getSubscriptions() {
    return this.superAdminService.getSubscriptions();
  }

  @Get('revenue')
  getRevenue() {
    return this.superAdminService.getRevenue();
  }

  @Get('system')
  getSystemTelemetry() {
    return this.superAdminService.getSystemTelemetry();
  }
}
