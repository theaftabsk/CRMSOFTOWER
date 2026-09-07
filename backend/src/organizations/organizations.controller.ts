import { Controller, Get, Patch, Body } from '@nestjs/common';
import { OrganizationsService } from './organizations.service';
import { TenantOrg } from '../common/decorators/tenant.decorator';

@Controller('organizations')
export class OrganizationsController {
  constructor(private orgsService: OrganizationsService) {}

  @Get('current')
  getCurrent(@TenantOrg() orgId: string) {
    return this.orgsService.getById(orgId);
  }

  @Patch('current')
  updateCurrent(@TenantOrg() orgId: string, @Body() body: any) {
    return this.orgsService.update(orgId, body);
  }
}
