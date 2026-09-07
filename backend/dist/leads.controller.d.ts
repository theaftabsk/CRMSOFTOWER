import { LeadsService } from './leads.service';
import { LeadDto, ConvertLeadDto } from './crm.interface';
export declare class LeadsController {
    private readonly leadsService;
    constructor(leadsService: LeadsService);
    findAll(orgId?: string): LeadDto[];
    create(leadDto: LeadDto): LeadDto;
    convert(dto: ConvertLeadDto): {
        success: boolean;
        message: string;
        contact: {
            id: string;
            name: string;
            phone: string;
            email: string;
            account_name: string;
        };
        account: {
            id: string;
            name: string;
            industry: string;
        };
        deal: {
            id: string;
            title: string;
            value: number;
            stage: string;
        };
    };
}
