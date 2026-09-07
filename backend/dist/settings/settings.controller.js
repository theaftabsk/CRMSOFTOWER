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
exports.SettingsController = void 0;
const common_1 = require("@nestjs/common");
const settings_service_1 = require("./settings.service");
let SettingsController = class SettingsController {
    constructor(settingsService) {
        this.settingsService = settingsService;
    }
    async getOrganization(orgId) {
        return this.settingsService.getOrganization(orgId || 'ORG001');
    }
    async getCustomFields(orgId) {
        return this.settingsService.getCustomFields(orgId || 'ORG001');
    }
    async addCustomField(body, orgId) {
        return this.settingsService.addCustomField(body, orgId || 'ORG001');
    }
    async getAuditLogs(orgId) {
        return this.settingsService.getAuditLogs(orgId || 'ORG001');
    }
};
exports.SettingsController = SettingsController;
__decorate([
    (0, common_1.Get)('organization'),
    __param(0, (0, common_1.Headers)('x-org-id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SettingsController.prototype, "getOrganization", null);
__decorate([
    (0, common_1.Get)('custom-fields'),
    __param(0, (0, common_1.Headers)('x-org-id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SettingsController.prototype, "getCustomFields", null);
__decorate([
    (0, common_1.Post)('custom-fields'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Headers)('x-org-id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], SettingsController.prototype, "addCustomField", null);
__decorate([
    (0, common_1.Get)('audit-logs'),
    __param(0, (0, common_1.Headers)('x-org-id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SettingsController.prototype, "getAuditLogs", null);
exports.SettingsController = SettingsController = __decorate([
    (0, common_1.Controller)('api/settings'),
    __metadata("design:paramtypes", [settings_service_1.SettingsService])
], SettingsController);
//# sourceMappingURL=settings.controller.js.map