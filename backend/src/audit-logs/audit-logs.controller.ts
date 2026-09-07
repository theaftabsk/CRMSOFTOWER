import { Controller, Get } from '@nestjs/common';
import { AuditLogsService } from './audit-logs.service';
import { TenantOrg } from '../common/decorators/tenant.decorator';

@Controller('audit-logs')
export class AuditLogsController {
  constructor(private auditLogsService: AuditLogsService) {}

  @Get()
  findAll(@TenantOrg() orgId: string) {
    return this.auditLogsService.findAll(orgId);
  }
}
