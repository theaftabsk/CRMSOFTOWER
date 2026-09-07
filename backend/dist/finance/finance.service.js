"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FinanceService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let FinanceService = class FinanceService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findProducts() {
        return this.prisma.product.findMany();
    }
    async findQuotes(orgId = 'ORG001') {
        return this.prisma.quote.findMany({
            where: { organization_id: orgId },
            include: { items: true },
            orderBy: { created_date: 'desc' },
        });
    }
    async createQuote(data, orgId = 'ORG001') {
        const quoteNumber = `QT-${Math.floor(1000 + Math.random() * 9000)}`;
        const items = data.items || [];
        let subtotal = 0;
        items.forEach((item) => {
            subtotal += (item.unit_price * item.qty);
        });
        const tax = subtotal * 0.18;
        const total = subtotal + tax;
        return this.prisma.quote.create({
            data: {
                organization_id: orgId,
                quote_number: quoteNumber,
                account_name: data.account_name || 'Client Corp',
                subtotal,
                tax,
                total,
                status: 'Sent',
                items: {
                    create: items.map((i) => ({
                        product_name: i.product_name,
                        qty: i.qty,
                        unit_price: i.unit_price,
                        total: i.unit_price * i.qty,
                    })),
                },
            },
            include: { items: true },
        });
    }
    async findInvoices(orgId = 'ORG001') {
        return this.prisma.invoice.findMany({
            where: { organization_id: orgId },
            include: { payments: true },
            orderBy: { issue_date: 'desc' },
        });
    }
    async findPayments() {
        return this.prisma.payment.findMany({
            orderBy: { created_at: 'desc' },
        });
    }
    async recordPayment(data, orgId = 'ORG001') {
        const invoice = await this.prisma.invoice.findUnique({ where: { id: data.invoiceId } });
        if (!invoice)
            throw new Error('Invoice not found');
        const paymentNumber = `PAY-${Math.floor(10000 + Math.random() * 90000)}`;
        const newPaid = invoice.paid_amount + Number(data.amount);
        const newDue = Math.max(0, invoice.total_amount - newPaid);
        const newStatus = newDue === 0 ? 'Paid' : 'Partial';
        const payment = await this.prisma.payment.create({
            data: {
                invoice_id: data.invoiceId,
                payment_number: paymentNumber,
                amount: Number(data.amount),
                payment_date: new Date().toISOString().split('T')[0],
                method: data.method || 'UPI',
                notes: data.notes || '',
            },
        });
        await this.prisma.invoice.update({
            where: { id: data.invoiceId },
            data: {
                paid_amount: newPaid,
                due_amount: newDue,
                status: newStatus,
            },
        });
        await this.prisma.auditLog.create({
            data: {
                organization_id: orgId,
                user_name: 'Finance Exec',
                action: 'Recorded Payment',
                entity_type: 'Invoice',
                entity_id: data.invoiceId,
                previous_value: `Paid: ₹${invoice.paid_amount}`,
                new_value: `Paid: ₹${newPaid}`,
                timestamp: new Date().toISOString(),
            },
        });
        return payment;
    }
};
exports.FinanceService = FinanceService;
exports.FinanceService = FinanceService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], FinanceService);
//# sourceMappingURL=finance.service.js.map