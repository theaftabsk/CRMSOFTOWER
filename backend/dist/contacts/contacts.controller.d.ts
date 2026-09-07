import { ContactsService } from './contacts.service';
export declare class ContactsController {
    private readonly contactsService;
    constructor(contactsService: ContactsService);
    getContacts(orgId?: string): Promise<{
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
    createContact(body: any, orgId?: string): Promise<{
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
