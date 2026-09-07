import { Controller, Get, Post, Patch, Param, Body, Headers } from '@nestjs/common';
import { ActivitiesService } from './activities.service';

@Controller('api/activities')
export class ActivitiesController {
  constructor(private readonly activitiesService: ActivitiesService) {}

  @Get('tasks')
  async getTasks(@Headers('x-org-id') orgId?: string) {
    return this.activitiesService.findTasks(orgId || 'ORG001');
  }

  @Post('tasks')
  async createTask(@Body() body: any, @Headers('x-org-id') orgId?: string) {
    return this.activitiesService.createTask(body, orgId || 'ORG001');
  }

  @Patch('tasks/:id/status')
  async toggleTaskStatus(@Param('id') id: string) {
    return this.activitiesService.toggleTaskStatus(id);
  }

  @Get('calls')
  async getCalls(@Headers('x-org-id') orgId?: string) {
    return this.activitiesService.findCalls(orgId || 'ORG001');
  }

  @Post('calls')
  async createCall(@Body() body: any, @Headers('x-org-id') orgId?: string) {
    return this.activitiesService.createCall(body, orgId || 'ORG001');
  }

  @Get('meetings')
  async getMeetings(@Headers('x-org-id') orgId?: string) {
    return this.activitiesService.findMeetings(orgId || 'ORG001');
  }

  @Post('meetings')
  async createMeeting(@Body() body: any, @Headers('x-org-id') orgId?: string) {
    return this.activitiesService.createMeeting(body, orgId || 'ORG001');
  }
}
