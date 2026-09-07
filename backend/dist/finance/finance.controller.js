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
exports.FinanceController = void 0;
const common_1 = require("@nestjs/common");
const finance_service_1 = require("./finance.service");
let FinanceController = class FinanceController {
    constructor(financeService) {
        this.financeService = financeService;
    }
    async getProducts() {
        return this.financeService.findProducts();
    }
    async getQuotes(orgId) {
        return this.financeService.findQuotes(orgId || 'ORG001');
    }
    async createQuote(body, orgId) {
        return this.financeService.createQuote(body, orgId || 'ORG001');
    }
    async getInvoices(orgId) {
        return this.financeService.findInvoices(orgId || 'ORG001');
    }
    async getPayments() {
        return this.financeService.findPayments();
    }
    async recordPayment(body, orgId) {
        return this.financeService.recordPayment(body, orgId || 'ORG001');
    }
};
exports.FinanceController = FinanceController;
__decorate([
    (0, common_1.Get)('products'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], FinanceController.prototype, "getProducts", null);
__decorate([
    (0, common_1.Get)('quotes'),
    __param(0, (0, common_1.Headers)('x-org-id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], FinanceController.prototype, "getQuotes", null);
__decorate([
    (0, common_1.Post)('quotes'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Headers)('x-org-id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], FinanceController.prototype, "createQuote", null);
__decorate([
    (0, common_1.Get)('invoices'),
    __param(0, (0, common_1.Headers)('x-org-id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], FinanceController.prototype, "getInvoices", null);
__decorate([
    (0, common_1.Get)('payments'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], FinanceController.prototype, "getPayments", null);
__decorate([
    (0, common_1.Post)('payments'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Headers)('x-org-id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], FinanceController.prototype, "recordPayment", null);
exports.FinanceController = FinanceController = __decorate([
    (0, common_1.Controller)('api/finance'),
    __metadata("design:paramtypes", [finance_service_1.FinanceService])
], FinanceController);
//# sourceMappingURL=finance.controller.js.map