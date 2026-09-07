import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ActivitiesService {
  constructor(private prisma: PrismaService) {}

  async findTasks(orgId: string = 'ORG001') {
    return this.prisma.task.findMany({
      where: { organization_id: orgId },
      orderBy: { created_at: 'desc' },
    });
  }

  async createTask(data: any, orgId: string = 'ORG001') {
    return this.prisma.task.create({
      data: {
        organization_id: orgId,
        title: data.title,
        assigned_to: data.assigned_to || 'Vikram Manager',
        priority: data.priority || 'Medium',
        due_date: data.due_date || new Date().toISOString().split('T')[0],
        status: 'Pending',
        related_type: data.related_type,
        related_name: data.related_name,
      },
    });
  }

  async toggleTaskStatus(taskId: string) {
    const task = await this.prisma.task.findUnique({ where: { id: taskId } });
    if (!task) throw new Error('Task not found');
    const newStatus = task.status === 'Completed' ? 'Pending' : 'Completed';
    return this.prisma.task.update({
      where: { id: taskId },
      data: { status: newStatus },
    });
  }

  async findCalls(orgId: string = 'ORG001') {
    return this.prisma.callLog.findMany({
      where: { organization_id: orgId },
      orderBy: { created_at: 'desc' },
    });
  }

  async createCall(data: any, orgId: string = 'ORG001') {
    return this.prisma.callLog.create({
      data: {
        organization_id: orgId,
        customer_name: data.customer_name,
        caller_user: data.caller_user || 'Sales Executive',
        duration: data.duration || '5 mins',
        result: data.result || 'Connected',
        notes: data.notes || '',
        date_time: data.date_time || new Date().toLocaleString(),
      },
    });
  }

  async findMeetings(orgId: string = 'ORG001') {
    return this.prisma.meeting.findMany({
      where: { organization_id: orgId },
      orderBy: { created_at: 'desc' },
    });
  }

  async createMeeting(data: any, orgId: string = 'ORG001') {
    return this.prisma.meeting.create({
      data: {
        organization_id: orgId,
        title: data.title,
        date_time: data.date_time || new Date().toLocaleString(),
        participants: data.participants || ['Client', 'Sales Lead'],
        status: 'Scheduled',
        location: data.location || 'Google Meet',
      },
    });
  }
}
