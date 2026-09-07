import { Controller, Get } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { TenantOrg } from '../common/decorators/tenant.decorator';

@Controller('reports')
export class ReportsController {
  constructor(private reportsService: ReportsService) {}

  @Get()
  getExecutiveSummary(@TenantOrg() orgId: string) {
    return this.reportsService.getExecutiveSummary(orgId);
  }
}
