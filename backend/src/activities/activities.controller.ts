import { Controller, Get, Post, Patch, Delete, Param, Body } from '@nestjs/common';
import { ActivitiesService } from './activities.service';
import { TenantOrg } from '../common/decorators/tenant.decorator';

@Controller('activities')
export class ActivitiesController {
  constructor(private activitiesService: ActivitiesService) {}

  @Get('stats/summary')
  getActivitiesStats(@TenantOrg() orgId: string) {
    return this.activitiesService.getActivitiesStats(orgId);
  }

  @Get('tasks')
  getTasks(@TenantOrg() orgId: string) {
    return this.activitiesService.getTasks(orgId);
  }

  @Post('tasks')
  createTask(@TenantOrg() orgId: string, @Body() body: any) {
    return this.activitiesService.createTask(orgId, body);
  }

  @Patch('tasks/:id')
  updateTask(
    @TenantOrg() orgId: string,
    @Param('id') id: string,
    @Body() body: any,
  ) {
    return this.activitiesService.updateTask(orgId, id, body);
  }

  @Patch('tasks/:id/status')
  toggleTaskStatus(@TenantOrg() orgId: string, @Param('id') id: string) {
    return this.activitiesService.toggleTaskStatus(orgId, id);
  }

  @Delete('tasks/:id')
  deleteTask(@TenantOrg() orgId: string, @Param('id') id: string) {
    return this.activitiesService.deleteTask(orgId, id);
  }

  @Get('calls')
  getCalls(@TenantOrg() orgId: string) {
    return this.activitiesService.getCalls(orgId);
  }

  @Post('calls')
  createCall(@TenantOrg() orgId: string, @Body() body: any) {
    return this.activitiesService.createCall(orgId, body);
  }

  @Patch('calls/:id')
  updateCall(
    @TenantOrg() orgId: string,
    @Param('id') id: string,
    @Body() body: any,
  ) {
    return this.activitiesService.updateCall(orgId, id, body);
  }

  @Delete('calls/:id')
  deleteCall(@TenantOrg() orgId: string, @Param('id') id: string) {
    return this.activitiesService.deleteCall(orgId, id);
  }

  @Get('meetings')
  getMeetings(@TenantOrg() orgId: string) {
    return this.activitiesService.getMeetings(orgId);
  }

  @Post('meetings')
  createMeeting(@TenantOrg() orgId: string, @Body() body: any) {
    return this.activitiesService.createMeeting(orgId, body);
  }

  @Patch('meetings/:id/status')
  updateMeetingStatus(
    @TenantOrg() orgId: string,
    @Param('id') id: string,
    @Body('status') status: string,
  ) {
    return this.activitiesService.updateMeetingStatus(orgId, id, status);
  }

  @Delete('meetings/:id')
  deleteMeeting(@TenantOrg() orgId: string, @Param('id') id: string) {
    return this.activitiesService.deleteMeeting(orgId, id);
  }

  @Get(':id')
  getActivityById(@TenantOrg() orgId: string, @Param('id') id: string) {
    return this.activitiesService.getActivityById(orgId, id);
  }
}
