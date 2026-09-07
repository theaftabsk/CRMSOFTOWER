import { PrismaService } from '../prisma/prisma.service';
export declare class SubscriptionsService {
    private prisma;
    constructor(prisma: PrismaService);
    getPlans(): Promise<{
        id: string;
        tier: string;
        price_per_user_month: number;
        user_limit: number;
        features: string[];
        is_active: boolean;
    }[]>;
}
