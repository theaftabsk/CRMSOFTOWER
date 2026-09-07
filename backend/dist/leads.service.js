"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LeadsService = void 0;
const common_1 = require("@nestjs/common");
let LeadsService = class LeadsService {
    constructor() {
        this.leads = [
            {
                id: 'LED001',
                organization_id: 'ORG001',
                first_name: 'Rahul',
                last_name: 'Sharma',
                phone: '9876512340',
                email: 'rahul@abcschool.edu.in',
                company: 'ABC School',
                website: 'https://abcschool.edu.in',
                industry: 'Education',
                source: 'Website',
                status: 'Interested',
                rating: 'Hot',
                owner_id: 'USR003',
                owner_name: 'Sales Executive 1 (Rohan)',
                expected_value: 50000,
                location: 'Kolkata, WB',
                tags: ['VIP', 'Website'],
                notes: 'Customer wants complete ERP website and student portal within ₹50,000 budget.',
                next_followup_date: '2026-09-10T11:00'
            },
            {
                id: 'LED002',
                organization_id: 'ORG001',
                first_name: 'Amit',
                last_name: 'Patel',
                phone: '9812345678',
                email: 'amit@technosolutions.com',
                company: 'Techno Solutions',
                website: 'https://technosolutions.com',
                industry: 'Information Technology',
                source: 'Facebook',
                status: 'Contacted',
                rating: 'Warm',
                owner_id: 'USR004',
                owner_name: 'Sales Executive 2 (Priya)',
                expected_value: 120000,
                location: 'Mumbai, MH',
                tags: ['High Value'],
                notes: 'Interested in custom CRM Software implementation.',
                next_followup_date: '2026-09-08T14:30'
            }
        ];
    }
    findAll(organizationId) {
        return this.leads.filter(l => l.organization_id === organizationId);
    }
    create(leadDto) {
        const id = `LED${String(this.leads.length + 1).padStart(3, '0')}`;
        const newLead = { ...leadDto, id };
        this.leads.push(newLead);
        return newLead;
    }
    convertLead(dto) {
        const lead = this.leads.find(l => l.id === dto.leadId);
        if (!lead)
            throw new common_1.NotFoundException('Lead not found');
        lead.status = 'Converted';
        return {
            success: true,
            message: 'Lead successfully converted to Contact, Account, and Deal',
            contact: {
                id: `CON${Date.now()}`,
                name: `${lead.first_name} ${lead.last_name}`,
                phone: lead.phone,
                email: lead.email,
                account_name: lead.company
            },
            account: {
                id: `ACC${Date.now()}`,
                name: lead.company,
                industry: lead.industry || 'General'
            },
            deal: dto.createDeal ? {
                id: `DL${Date.now()}`,
                title: dto.dealTitle || `${lead.company} Deal`,
                value: dto.dealValue || lead.expected_value,
                stage: 'New'
            } : null
        };
    }
};
exports.LeadsService = LeadsService;
exports.LeadsService = LeadsService = __decorate([
    (0, common_1.Injectable)()
], LeadsService);
//# sourceMappingURL=leads.service.js.map