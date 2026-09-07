import { Controller, Get, Post, Patch, Param, Body } from '@nestjs/common';
import { ActivitiesService } from './activities.service';
import { TenantOrg } from '../common/decorators/tenant.decorator';

@Controller('activities')
export class ActivitiesController {
  constructor(private activitiesService: ActivitiesService) {}

  @Get('tasks')
  getTasks(@TenantOrg() orgId: string) {
    return this.activitiesService.getTasks(orgId);
  }

  @Post('tasks')
  createTask(@TenantOrg() orgId: string, @Body() body: any) {
    return this.activitiesService.createTask(orgId, body);
  }

  @Patch('tasks/:id/status')
  toggleTaskStatus(@TenantOrg() orgId: string, @Param('id') id: string) {
    return this.activitiesService.toggleTaskStatus(orgId, id);
  }

  @Get('calls')
  getCalls(@TenantOrg() orgId: string) {
    return this.activitiesService.getCalls(orgId);
  }

  @Post('calls')
  createCall(@TenantOrg() orgId: string, @Body() body: any) {
    return this.activitiesService.createCall(orgId, body);
  }

  @Get('meetings')
  getMeetings(@TenantOrg() orgId: string) {
    return this.activitiesService.getMeetings(orgId);
  }

  @Post('meetings')
  createMeeting(@TenantOrg() orgId: string, @Body() body: any) {
    return this.activitiesService.createMeeting(orgId, body);
  }
}
