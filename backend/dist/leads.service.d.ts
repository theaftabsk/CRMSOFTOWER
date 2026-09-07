import { LeadDto, ConvertLeadDto } from './crm.interface';
export declare class LeadsService {
    private leads;
    findAll(organizationId: string): LeadDto[];
    create(leadDto: LeadDto): LeadDto;
    convertLead(dto: ConvertLeadDto): {
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
