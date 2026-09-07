import { Injectable } from '@nestjs/common';

@Injectable()
export class NotificationsService {
  async getNotifications(orgId: string) {
    return [
      { id: 'notif-1', title: 'New Lead Assigned', message: 'Rajesh Kumar from DPS Portal was assigned to you.', timestamp: '10 mins ago', read: false },
      { id: 'notif-2', title: 'Invoice Payment Received', message: 'Apex Health Systems paid ₹50,000 for INV-2026-001', timestamp: '2 hours ago', read: true },
      { id: 'notif-3', title: 'Meeting Reminder', message: 'Architecture Demo with Dr. Priya Sharma in 1 hour.', timestamp: '3 hours ago', read: true },
    ];
  }
}
