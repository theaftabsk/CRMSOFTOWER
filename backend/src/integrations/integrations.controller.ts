import { Controller, Get } from '@nestjs/common';
import { IntegrationsService } from './integrations.service';
import { TenantOrg } from '../common/decorators/tenant.decorator';

@Controller('integrations')
export class IntegrationsController {
  constructor(private integrationsService: IntegrationsService) {}

  @Get()
  getStatus(@TenantOrg() orgId: string) {
    return this.integrationsService.getStatus(orgId);
  }

  @Get('api-keys')
  getApiKeys(@TenantOrg() orgId: string) {
    return this.integrationsService.getApiKeys(orgId);
  }
}
