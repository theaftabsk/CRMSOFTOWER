import { PrismaService } from '../prisma/prisma.service';
export declare class AccountsService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(orgId?: string): Promise<({
        contacts: {
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
        }[];
        deals: {
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
        }[];
    } & {
        id: string;
        organization_id: string;
        name: string;
        created_date: Date;
        industry: string;
        website: string | null;
        annual_revenue: number;
        employee_count: number;
        billing_address: string | null;
    })[]>;
    create(data: any, orgId?: string): Promise<{
        id: string;
        organization_id: string;
        name: string;
        created_date: Date;
        industry: string;
        website: string | null;
        annual_revenue: number;
        employee_count: number;
        billing_address: string | null;
    }>;
}
