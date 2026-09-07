import { SubscriptionsService } from './subscriptions.service';
export declare class SubscriptionsController {
    private readonly subscriptionsService;
    constructor(subscriptionsService: SubscriptionsService);
    getPlans(): Promise<{
        id: string;
        tier: string;
        price_per_user_month: number;
        user_limit: number;
        features: string[];
        is_active: boolean;
    }[]>;
}
