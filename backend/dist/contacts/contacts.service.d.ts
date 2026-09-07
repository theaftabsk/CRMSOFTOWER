import { PrismaService } from '../prisma/prisma.service';
export declare class ContactsService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(orgId?: string): Promise<{
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
    }[]>;
    create(data: any, orgId?: string): Promise<{
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
    }>;
}
