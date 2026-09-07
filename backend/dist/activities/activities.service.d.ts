import { PrismaService } from '../prisma/prisma.service';
export declare class ActivitiesService {
    private prisma;
    constructor(prisma: PrismaService);
    findTasks(orgId?: string): Promise<{
        id: string;
        organization_id: string;
        status: string;
        assigned_to: string;
        title: string;
        priority: string;
        due_date: string;
        related_type: string | null;
        related_name: string | null;
        created_at: Date;
    }[]>;
    createTask(data: any, orgId?: string): Promise<{
        id: string;
        organization_id: string;
        status: string;
        assigned_to: string;
        title: string;
        priority: string;
        due_date: string;
        related_type: string | null;
        related_name: string | null;
        created_at: Date;
    }>;
    toggleTaskStatus(taskId: string): Promise<{
        id: string;
        organization_id: string;
        status: string;
        assigned_to: string;
        title: string;
        priority: string;
        due_date: string;
        related_type: string | null;
        related_name: string | null;
        created_at: Date;
    }>;
    findCalls(orgId?: string): Promise<{
        result: string;
        id: string;
        organization_id: string;
        notes: string | null;
        created_at: Date;
        customer_name: string;
        caller_user: string;
        duration: string;
        date_time: string;
    }[]>;
    createCall(data: any, orgId?: string): Promise<{
        result: string;
        id: string;
        organization_id: string;
        notes: string | null;
        created_at: Date;
        customer_name: string;
        caller_user: string;
        duration: string;
        date_time: string;
    }>;
    findMeetings(orgId?: string): Promise<{
        id: string;
        organization_id: string;
        status: string;
        title: string;
        created_at: Date;
        date_time: string;
        participants: string[];
        location: string | null;
    }[]>;
    createMeeting(data: any, orgId?: string): Promise<{
        id: string;
        organization_id: string;
        status: string;
        title: string;
        created_at: Date;
        date_time: string;
        participants: string[];
        location: string | null;
    }>;
}
