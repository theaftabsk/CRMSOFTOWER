import { LeadsService } from './leads.service';
export declare class LeadsController {
    private readonly leadsService;
    constructor(leadsService: LeadsService);
    getLeads(orgId?: string): Promise<{
        id: string;
        organization_id: string;
        name: string;
        company: string;
        email: string;
        phone: string;
        status: string;
        source: string;
        assigned_to: string;
        expected_value: number;
        created_date: Date;
        notes: string | null;
    }[]>;
    createLead(body: any, orgId?: string): Promise<{
        id: string;
        organization_id: string;
        name: string;
        company: string;
        email: string;
        phone: string;
        status: string;
        source: string;
        assigned_to: string;
        expected_value: number;
        created_date: Date;
        notes: string | null;
    }>;
    convertLead(body: any, orgId?: string): Promise<{
        lead: {
            id: string;
            organization_id: string;
            name: string;
            company: string;
            email: string;
            phone: string;
            status: string;
            source: string;
            assigned_to: string;
            expected_value: number;
            created_date: Date;
            notes: string | null;
        };
        account: {
            id: string;
            organization_id: string;
            name: string;
            created_date: Date;
            industry: string;
            website: string | null;
            annual_revenue: number;
            employee_count: number;
            billing_address: string | null;
        };
        contact: {
            id: string;
            organization_id: string;
            name: string;
            company: string;
            email: string;
            phone: string;
            status: string;
            created_date: Date;
            designation: string | null;
            city: string | null;
            account_id: string | null;
        };
        deal: {
            id: string;
            organization_id: string;
            created_date: Date;
            account_id: string | null;
            title: string;
            account_name: string;
            stage: string;
            value: number;
            closing_date: string;
            owner: string;
            probability: number;
        };
    }>;
}
