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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DealsController = void 0;
const common_1 = require("@nestjs/common");
const deals_service_1 = require("./deals.service");
let DealsController = class DealsController {
    constructor(dealsService) {
        this.dealsService = dealsService;
    }
    async getDeals(orgId) {
        return this.dealsService.findAll(orgId || 'ORG001');
    }
    async createDeal(body, orgId) {
        return this.dealsService.create(body, orgId || 'ORG001');
    }
    async updateStage(id, stage, orgId) {
        return this.dealsService.updateStage(id, stage, orgId || 'ORG001');
    }
};
exports.DealsController = DealsController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Headers)('x-org-id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], DealsController.prototype, "getDeals", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Headers)('x-org-id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], DealsController.prototype, "createDeal", null);
__decorate([
    (0, common_1.Patch)(':id/stage'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('stage')),
    __param(2, (0, common_1.Headers)('x-org-id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], DealsController.prototype, "updateStage", null);
exports.DealsController = DealsController = __decorate([
    (0, common_1.Controller)('api/deals'),
    __metadata("design:paramtypes", [deals_service_1.DealsService])
], DealsController);
//# sourceMappingURL=deals.controller.js.map