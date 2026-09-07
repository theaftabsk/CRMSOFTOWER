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
exports.ActivitiesController = void 0;
const common_1 = require("@nestjs/common");
const activities_service_1 = require("./activities.service");
let ActivitiesController = class ActivitiesController {
    constructor(activitiesService) {
        this.activitiesService = activitiesService;
    }
    async getTasks(orgId) {
        return this.activitiesService.findTasks(orgId || 'ORG001');
    }
    async createTask(body, orgId) {
        return this.activitiesService.createTask(body, orgId || 'ORG001');
    }
    async toggleTaskStatus(id) {
        return this.activitiesService.toggleTaskStatus(id);
    }
    async getCalls(orgId) {
        return this.activitiesService.findCalls(orgId || 'ORG001');
    }
    async createCall(body, orgId) {
        return this.activitiesService.createCall(body, orgId || 'ORG001');
    }
    async getMeetings(orgId) {
        return this.activitiesService.findMeetings(orgId || 'ORG001');
    }
    async createMeeting(body, orgId) {
        return this.activitiesService.createMeeting(body, orgId || 'ORG001');
    }
};
exports.ActivitiesController = ActivitiesController;
__decorate([
    (0, common_1.Get)('tasks'),
    __param(0, (0, common_1.Headers)('x-org-id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ActivitiesController.prototype, "getTasks", null);
__decorate([
    (0, common_1.Post)('tasks'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Headers)('x-org-id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], ActivitiesController.prototype, "createTask", null);
__decorate([
    (0, common_1.Patch)('tasks/:id/status'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ActivitiesController.prototype, "toggleTaskStatus", null);
__decorate([
    (0, common_1.Get)('calls'),
    __param(0, (0, common_1.Headers)('x-org-id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ActivitiesController.prototype, "getCalls", null);
__decorate([
    (0, common_1.Post)('calls'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Headers)('x-org-id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], ActivitiesController.prototype, "createCall", null);
__decorate([
    (0, common_1.Get)('meetings'),
    __param(0, (0, common_1.Headers)('x-org-id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ActivitiesController.prototype, "getMeetings", null);
__decorate([
    (0, common_1.Post)('meetings'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Headers)('x-org-id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], ActivitiesController.prototype, "createMeeting", null);
exports.ActivitiesController = ActivitiesController = __decorate([
    (0, common_1.Controller)('api/activities'),
    __metadata("design:paramtypes", [activities_service_1.ActivitiesService])
], ActivitiesController);
//# sourceMappingURL=activities.controller.js.map