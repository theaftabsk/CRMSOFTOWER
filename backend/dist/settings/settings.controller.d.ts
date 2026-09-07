import { SettingsService } from './settings.service';
export declare class SettingsController {
    private readonly settingsService;
    constructor(settingsService: SettingsService);
    getOrganization(orgId?: string): Promise<{
        id: string;
        name: string;
        created_at: Date;
        logo_url: string | null;
        currency: string;
        timezone: string;
        address: string | null;
    }>;
    getCustomFields(orgId?: string): Promise<{
        id: string;
        organization_id: string;
        entity_type: string;
        created_at: Date;
        field_name: string;
        field_type: string;
        options: string[];
    }[]>;
    addCustomField(body: any, orgId?: string): Promise<{
        id: string;
        organization_id: string;
        entity_type: string;
        created_at: Date;
        field_name: string;
        field_type: string;
        options: string[];
    }>;
    getAuditLogs(orgId?: string): Promise<{
        id: string;
        organization_id: string;
        user_name: string;
        action: string;
        entity_type: string;
        entity_id: string;
        previous_value: string | null;
        new_value: string | null;
        timestamp: string;
    }[]>;
}
