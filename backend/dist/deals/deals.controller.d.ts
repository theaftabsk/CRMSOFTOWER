import { DealsService } from './deals.service';
export declare class DealsController {
    private readonly dealsService;
    constructor(dealsService: DealsService);
    getDeals(orgId?: string): Promise<{
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
    createDeal(body: any, orgId?: string): Promise<{
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
    updateStage(id: string, stage: string, orgId?: string): Promise<{
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
