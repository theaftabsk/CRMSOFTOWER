import { Controller, Get } from '@nestjs/common';
import { RolesService } from './roles.service';
import { TenantOrg } from '../common/decorators/tenant.decorator';

@Controller('roles')
export class RolesController {
  constructor(private rolesService: RolesService) {}

  @Get()
  list(@TenantOrg() orgId: string) {
    return this.rolesService.list(orgId);
  }

  @Get('permissions')
  listPermissions() {
    return this.rolesService.listPermissions();
  }
}
