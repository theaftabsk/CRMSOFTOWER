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
exports.LeadsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let LeadsService = class LeadsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll(orgId = 'ORG001') {
        return this.prisma.lead.findMany({
            where: { organization_id: orgId },
            orderBy: { created_date: 'desc' },
        });
    }
    async create(data, orgId = 'ORG001') {
        const lead = await this.prisma.lead.create({
            data: {
                organization_id: orgId,
                name: data.name,
                company: data.company,
                email: data.email,
                phone: data.phone,
                status: data.status || 'New',
                source: data.source || 'Website',
                assigned_to: data.assigned_to || 'Unassigned',
                expected_value: Number(data.expected_value) || 0,
                notes: data.notes || '',
            },
        });
        await this.prisma.auditLog.create({
            data: {
                organization_id: orgId,
                user_name: 'System / User',
                action: 'Created Lead',
                entity_type: 'Lead',
                entity_id: lead.id,
                new_value: lead.name,
                timestamp: new Date().toISOString(),
            },
        });
        return lead;
    }
    async convertLead(data, orgId = 'ORG001') {
        const lead = await this.prisma.lead.findUnique({ where: { id: data.leadId } });
        if (!lead)
            throw new Error('Lead not found');
        await this.prisma.lead.update({
            where: { id: data.leadId },
            data: { status: 'Converted' },
        });
        const account = await this.prisma.account.create({
            data: {
                organization_id: orgId,
                name: lead.company,
                industry: 'General Enterprise',
                annual_revenue: data.dealValue,
            },
        });
        const contact = await this.prisma.contact.create({
            data: {
                organization_id: orgId,
                account_id: account.id,
                name: lead.name,
                email: lead.email,
                phone: lead.phone,
                company: lead.company,
            },
        });
        const deal = await this.prisma.deal.create({
            data: {
                organization_id: orgId,
                account_id: account.id,
                title: data.dealTitle || `${lead.company} Contract`,
                account_name: lead.company,
                stage: data.dealStage || 'Qualification',
                value: Number(data.dealValue) || lead.expected_value,
                closing_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                owner: lead.assigned_to,
            },
        });
        return { lead, account, contact, deal };
    }
};
exports.LeadsService = LeadsService;
exports.LeadsService = LeadsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], LeadsService);
//# sourceMappingURL=leads.service.js.map