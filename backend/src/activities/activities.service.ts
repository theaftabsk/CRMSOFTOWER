import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ActivitiesService {
  constructor(private prisma: PrismaService) {}

  async getTasks(orgId: string) {
    return this.prisma.task.findMany({
      where: { organization_id: orgId },
      orderBy: { created_at: 'desc' },
    });
  }

  async createTask(orgId: string, data: any) {
    return this.prisma.task.create({
      data: {
        organization_id: orgId,
        title: data.title,
        assigned_to: data.assigned_to || 'Current User',
        priority: data.priority || 'Medium',
        due_date: data.due_date || new Date().toISOString().split('T')[0],
        status: data.status || 'Pending',
        related_type: data.related_type,
        related_name: data.related_name,
      },
    });
  }

  async toggleTaskStatus(orgId: string, id: string) {
    const task = await this.prisma.task.findFirst({ where: { id, organization_id: orgId } });
    if (!task) return null;
    const newStatus = task.status === 'Completed' ? 'Pending' : 'Completed';
    return this.prisma.task.update({
      where: { id },
      data: { status: newStatus },
    });
  }

  async getCalls(orgId: string) {
    return this.prisma.callLog.findMany({
      where: { organization_id: orgId },
      orderBy: { created_at: 'desc' },
    });
  }

  async createCall(orgId: string, data: any) {
    return this.prisma.callLog.create({
      data: {
        organization_id: orgId,
        customer_name: data.customer_name,
        caller_user: data.caller_user,
        duration: data.duration || '5 mins',
        result: data.result || 'Connected',
        notes: data.notes,
        date_time: data.date_time || new Date().toLocaleString(),
      },
    });
  }

  async getMeetings(orgId: string) {
    return this.prisma.meeting.findMany({
      where: { organization_id: orgId },
      orderBy: { created_at: 'desc' },
    });
  }

  async createMeeting(orgId: string, data: any) {
    return this.prisma.meeting.create({
      data: {
        organization_id: orgId,
        title: data.title,
        date_time: data.date_time,
        participants: data.participants || [],
        status: data.status || 'Scheduled',
        location: data.location || 'Google Meet',
      },
    });
  }
}
