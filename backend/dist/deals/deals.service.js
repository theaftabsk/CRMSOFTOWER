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
exports.DealsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let DealsService = class DealsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll(orgId = 'ORG001') {
        return this.prisma.deal.findMany({
            where: { organization_id: orgId },
            orderBy: { created_date: 'desc' },
        });
    }
    async create(data, orgId = 'ORG001') {
        return this.prisma.deal.create({
            data: {
                organization_id: orgId,
                account_id: data.account_id,
                title: data.title,
                account_name: data.account_name,
                stage: data.stage || 'Qualification',
                value: Number(data.value) || 0,
                closing_date: data.closing_date || new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
                owner: data.owner || 'Vikram Sales Manager',
                probability: Number(data.probability) || 50,
            },
        });
    }
    async updateStage(dealId, stage, orgId = 'ORG001') {
        const updated = await this.prisma.deal.update({
            where: { id: dealId },
            data: { stage },
        });
        await this.prisma.auditLog.create({
            data: {
                organization_id: orgId,
                user_name: 'Sales Manager',
                action: `Moved Deal Stage to ${stage}`,
                entity_type: 'Deal',
                entity_id: dealId,
                new_value: stage,
                timestamp: new Date().toISOString(),
            },
        });
        return updated;
    }
};
exports.DealsService = DealsService;
exports.DealsService = DealsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], DealsService);
//# sourceMappingURL=deals.service.js.map