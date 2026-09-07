import { FinanceService } from './finance.service';
export declare class FinanceController {
    private readonly financeService;
    constructor(financeService: FinanceService);
    getProducts(): Promise<{
        id: string;
        name: string;
        code: string;
        category: string;
        unit_price: number;
        stock: number;
        gst_rate_percent: number;
    }[]>;
    getQuotes(orgId?: string): Promise<({
        items: {
            id: string;
            unit_price: number;
            total: number;
            product_name: string;
            qty: number;
            quote_id: string;
        }[];
    } & {
        id: string;
        organization_id: string;
        status: string;
        created_date: Date;
        account_id: string | null;
        account_name: string;
        quote_number: string;
        subtotal: number;
        tax: number;
        total: number;
    })[]>;
    createQuote(body: any, orgId?: string): Promise<{
        items: {
            id: string;
            unit_price: number;
            total: number;
            product_name: string;
            qty: number;
            quote_id: string;
        }[];
    } & {
        id: string;
        organization_id: string;
        status: string;
        created_date: Date;
        account_id: string | null;
        account_name: string;
        quote_number: string;
        subtotal: number;
        tax: number;
        total: number;
    }>;
    getInvoices(orgId?: string): Promise<({
        payments: {
            id: string;
            notes: string | null;
            created_at: Date;
            invoice_id: string;
            payment_number: string;
            amount: number;
            payment_date: string;
            method: string;
        }[];
    } & {
        id: string;
        organization_id: string;
        status: string;
        account_id: string | null;
        account_name: string;
        due_date: string;
        invoice_number: string;
        total_amount: number;
        paid_amount: number;
        due_amount: number;
        issue_date: string;
    })[]>;
    getPayments(): Promise<{
        id: string;
        notes: string | null;
        created_at: Date;
        invoice_id: string;
        payment_number: string;
        amount: number;
        payment_date: string;
        method: string;
    }[]>;
    recordPayment(body: any, orgId?: string): Promise<{
        id: string;
        notes: string | null;
        created_at: Date;
        invoice_id: string;
        payment_number: string;
        amount: number;
        payment_date: string;
        method: string;
    }>;
}
