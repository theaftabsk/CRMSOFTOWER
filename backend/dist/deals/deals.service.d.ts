import { PrismaService } from '../prisma/prisma.service';
export declare class DealsService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(orgId?: string): Promise<{
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
    }[]>;
    create(data: any, orgId?: string): Promise<{
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
    }>;
    updateStage(dealId: string, stage: string, orgId?: string): Promise<{
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
    }>;
}
