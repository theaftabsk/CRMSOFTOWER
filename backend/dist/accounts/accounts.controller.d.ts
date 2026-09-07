import { AccountsService } from './accounts.service';
export declare class AccountsController {
    private readonly accountsService;
    constructor(accountsService: AccountsService);
    getAccounts(orgId?: string): Promise<({
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
    createAccount(body: any, orgId?: string): Promise<{
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
