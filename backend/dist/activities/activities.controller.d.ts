import { ActivitiesService } from './activities.service';
export declare class ActivitiesController {
    private readonly activitiesService;
    constructor(activitiesService: ActivitiesService);
    getTasks(orgId?: string): Promise<{
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
    createTask(body: any, orgId?: string): Promise<{
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
    toggleTaskStatus(id: string): Promise<{
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
    getCalls(orgId?: string): Promise<{
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
    createCall(body: any, orgId?: string): Promise<{
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
    getMeetings(orgId?: string): Promise<{
        id: string;
        organization_id: string;
        status: string;
        title: string;
        created_at: Date;
        date_time: string;
        participants: string[];
        location: string | null;
    }[]>;
    createMeeting(body: any, orgId?: string): Promise<{
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
