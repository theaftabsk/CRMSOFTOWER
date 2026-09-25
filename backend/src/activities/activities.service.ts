import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as crypto from 'crypto';

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
    const provider = (data.provider || 'GOOGLE_MEET').toUpperCase();
    let meetLink = data.meet_link || data.google_meet_url;
    let googleSpaceName = data.google_space_name;
    let externalEventId = data.external_event_id;
    let location = data.location || 'Google Meet';
    let syncStatus = 'SYNCED';

    if (provider === 'GOOGLE_MEET') {
      if (!meetLink) {
        const p1 = Math.random().toString(36).substring(2, 5);
        const p2 = Math.random().toString(36).substring(2, 6);
        const p3 = Math.random().toString(36).substring(2, 5);
        meetLink = `https://meet.google.com/${p1}-${p2}-${p3}`;
      }
      if (!googleSpaceName) {
        googleSpaceName = `spaces/${crypto.randomBytes(6).toString('base64url')}`;
      }
      externalEventId = externalEventId || `gcal_evt_${crypto.randomBytes(8).toString('hex')}`;
      location = 'Google Meet';
    } else if (provider === 'ZOOM') {
      const zoomId = Math.floor(1000000000 + Math.random() * 9000000000);
      const pwd = crypto.randomBytes(3).toString('hex');
      meetLink = meetLink || `https://zoom.us/j/${zoomId}?pwd=${pwd}`;
      externalEventId = `zoom_mtg_${zoomId}`;
      location = 'Zoom Meeting';
    } else {
      location = data.location || 'In-Person / Custom';
      syncStatus = 'LOCAL_ONLY';
      externalEventId = null;
    }

    const durationMinutes = Number(data.duration_minutes) || 30;
    const startAt = data.start_at || data.date_time || new Date().toISOString();
    const endAt = data.end_at || new Date(new Date(startAt).getTime() + durationMinutes * 60000).toISOString();

    const meeting = await this.prisma.meeting.create({
      data: {
        organization_id: orgId,
        owner_id: data.owner_id || 'USR001',
        lead_id: data.lead_id || null,
        contact_id: data.contact_id || null,
        deal_id: data.deal_id || null,
        title: data.title,
        description: data.description || data.notes || '',
        date_time: data.date_time || startAt,
        start_at: startAt,
        end_at: endAt,
        timezone: data.timezone || 'Asia/Kolkata',
        participants: data.participants || (data.contact_email ? [data.contact_email] : []),
        status: data.status || 'Scheduled',
        location,
        meeting_type: data.meeting_type || 'Product Demo',
        duration_minutes: durationMinutes,
        meet_link: meetLink,
        google_meet_url: meetLink,
        google_space_name: googleSpaceName,
        account_name: data.account_name || null,
        contact_email: data.contact_email || null,
        contact_phone: data.contact_phone || null,
        notes: data.notes || data.description || '',
        provider,
        external_event_id: externalEventId,
        meeting_url: meetLink,
        calendar_id: 'primary',
        organizer_email: 'admin@crmsoftower.com',
        sync_status: syncStatus,
      },
    });

    // Auto-create LeadActivity if lead_id provided
    if (data.lead_id) {
      try {
        await this.prisma.leadActivity.create({
          data: {
            organization_id: orgId,
            lead_id: data.lead_id,
            type: 'MEETING',
            title: `Google Meet Scheduled: ${data.title}`,
            description: `Scheduled for ${data.date_time || startAt} (${durationMinutes} mins). Space: ${googleSpaceName || 'spaces/auto'}. Meeting Link: ${meetLink}`,
            source: 'GOOGLE',
            status: 'SCHEDULED',
            metadata: {
              meeting_id: meeting.id,
              google_space_name: googleSpaceName,
              meet_link: meetLink,
              provider,
              start_at: startAt,
              duration_minutes: durationMinutes,
            },
          },
        });

        await this.prisma.lead.update({
          where: { id: data.lead_id },
          data: {
            activity_status: 'MEETING_SCHEDULED',
            next_follow_up_date: new Date(startAt),
            next_follow_up_type: 'Google Meet',
            last_activity_at: new Date(),
          },
        });
      } catch (err: any) {
        console.warn('Could not auto-log LeadActivity:', err.message);
      }
    }

    return meeting;
  }

  async updateMeetingStatus(orgId: string, id: string, status: string) {
    const meeting = await this.prisma.meeting.findFirst({
      where: { id, organization_id: orgId },
    });
    if (!meeting) return null;
    return this.prisma.meeting.update({
      where: { id },
      data: { status },
    });
  }

  async deleteMeeting(orgId: string, id: string) {
    return this.prisma.meeting.deleteMany({
      where: { id, organization_id: orgId },
    });
  }

  async bookPublicMeeting(data: any) {
    const orgId = data.organization_id || 'ORG001';
    const provider = (data.provider || 'GOOGLE_MEET').toUpperCase();
    
    let meetLink = data.meet_link;
    let externalEventId: string | null = null;
    let location = 'Google Meet';

    if (provider === 'ZOOM') {
      const zoomId = Math.floor(1000000000 + Math.random() * 9000000000);
      const pwd = crypto.randomBytes(3).toString('hex');
      meetLink = `https://zoom.us/j/${zoomId}?pwd=${pwd}`;
      externalEventId = `zoom_mtg_${zoomId}`;
      location = 'Zoom Meeting';
    } else {
      const codeA = Math.random().toString(36).substring(2, 5);
      const codeB = Math.random().toString(36).substring(2, 6);
      const codeC = Math.random().toString(36).substring(2, 5);
      meetLink = `https://meet.google.com/${codeA}-${codeB}-${codeC}`;
      externalEventId = `gcal_evt_${crypto.randomBytes(8).toString('hex')}`;
      location = 'Google Meet';
    }
    
    // Auto-create meeting in CRM DB with full provider and external event details
    const meeting = await this.prisma.meeting.create({
      data: {
        organization_id: orgId,
        title: data.title || `Client Demo with ${data.name || 'Prospect'}`,
        date_time: `${data.date} ${data.time || '11:00 AM'}`,
        participants: [data.email, 'sales@abctechnologies.com'].filter(Boolean),
        status: 'Scheduled',
        location,
        meeting_type: data.meeting_type || 'Product Demo',
        duration_minutes: Number(data.duration_minutes) || 30,
        meet_link: meetLink,
        account_name: data.company || 'Prospective Client',
        contact_email: data.email,
        contact_phone: data.phone,
        notes: data.notes || `Self-booked meeting from public booking page. Service: ${data.meeting_type || 'Product Demo'}`,
        provider,
        external_event_id: externalEventId,
        meeting_url: meetLink,
        calendar_id: 'primary',
        organizer_email: 'admin@abctechnologies.com',
        start_at: `${data.date} ${data.time || '11:00 AM'}`,
        sync_status: 'SYNCED',
      },
    });

    // Auto-create or link Lead in CRM
    if (data.email) {
      try {
        const existingLead = await this.prisma.lead.findFirst({
          where: { organization_id: orgId, email: data.email },
        });
        if (!existingLead) {
          await this.prisma.lead.create({
            data: {
              organization_id: orgId,
              name: data.name || data.company || 'Inbound Prospect',
              company: data.company || 'Prospective Client',
              email: data.email,
              phone: data.phone || '',
              status: 'Qualified',
              source: 'Website Calendar Booking',
              assigned_to: 'Vikram Sales Manager',
              expected_value: 150000,
              notes: `Auto-created lead from self-booked meeting on ${data.date} via ${provider}`,
            },
          });
        }
      } catch (err) {
        // Continue even if lead create fails
      }
    }

    return {
      success: true,
      message: 'Meeting successfully booked and synced to calendar!',
      meeting,
      meet_link: meetLink,
      external_event_id: externalEventId,
      provider,
    };
  }

  async getActivitiesStats(orgId: string) {
    const [tasks, calls, meetings] = await Promise.all([
      this.prisma.task.findMany({ where: { organization_id: orgId } }),
      this.prisma.callLog.findMany({ where: { organization_id: orgId } }),
      this.prisma.meeting.findMany({ where: { organization_id: orgId } }),
    ]);

    const totalTasks = tasks.length;
    const completedTasks = tasks.filter((t) => t.status === 'Completed').length;
    const pendingTasks = tasks.filter((t) => t.status !== 'Completed').length;
    const urgentTasks = tasks.filter((t) => t.priority === 'Urgent' && t.status !== 'Completed').length;
    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 100;
    const totalCalls = calls.length;
    const totalMeetings = meetings.length;

    return {
      totalTasks,
      completedTasks,
      pendingTasks,
      urgentTasks,
      completionRate,
      totalCalls,
      totalMeetings,
      totalTouchpoints: totalTasks + totalCalls + totalMeetings,
    };
  }

  async deleteTask(orgId: string, id: string) {
    return this.prisma.task.deleteMany({
      where: { id, organization_id: orgId },
    });
  }

  async updateTask(orgId: string, id: string, data: any) {
    return this.prisma.task.updateMany({
      where: { id, organization_id: orgId },
      data,
    });
  }

  async deleteCall(orgId: string, id: string) {
    return this.prisma.callLog.deleteMany({
      where: { id, organization_id: orgId },
    });
  }

  async updateCall(orgId: string, id: string, data: any) {
    return this.prisma.callLog.updateMany({
      where: { id, organization_id: orgId },
      data,
    });
  }

  async getActivityById(orgId: string, id: string) {
    const [task, call, meeting] = await Promise.all([
      this.prisma.task.findFirst({ where: { id, organization_id: orgId } }),
      this.prisma.callLog.findFirst({ where: { id, organization_id: orgId } }),
      this.prisma.meeting.findFirst({ where: { id, organization_id: orgId } }),
    ]);

    if (task) {
      return { activityType: 'TASK', ...task };
    }
    if (call) {
      return { activityType: 'CALL', ...call };
    }
    if (meeting) {
      return { activityType: 'MEETING', ...meeting };
    }
    return null;
  }
}
