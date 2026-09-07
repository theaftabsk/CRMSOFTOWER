import { Controller, Get, Post, Body } from '@nestjs/common';
import { WorkflowsService } from './workflows.service';
import { TenantOrg } from '../common/decorators/tenant.decorator';

@Controller('workflows')
export class WorkflowsController {
  constructor(private workflowsService: WorkflowsService) {}

  @Get()
  findAll(@TenantOrg() orgId: string) {
    return this.workflowsService.findAll(orgId);
  }

  @Post('trigger')
  trigger(@TenantOrg() orgId: string, @Body() body: { event: string; payload: any }) {
    return this.workflowsService.triggerEvent(orgId, body.event, body.payload);
  }
}
