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
exports.ActivitiesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let ActivitiesService = class ActivitiesService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findTasks(orgId = 'ORG001') {
        return this.prisma.task.findMany({
            where: { organization_id: orgId },
            orderBy: { created_at: 'desc' },
        });
    }
    async createTask(data, orgId = 'ORG001') {
        return this.prisma.task.create({
            data: {
                organization_id: orgId,
                title: data.title,
                assigned_to: data.assigned_to || 'Vikram Manager',
                priority: data.priority || 'Medium',
                due_date: data.due_date || new Date().toISOString().split('T')[0],
                status: 'Pending',
                related_type: data.related_type,
                related_name: data.related_name,
            },
        });
    }
    async toggleTaskStatus(taskId) {
        const task = await this.prisma.task.findUnique({ where: { id: taskId } });
        if (!task)
            throw new Error('Task not found');
        const newStatus = task.status === 'Completed' ? 'Pending' : 'Completed';
        return this.prisma.task.update({
            where: { id: taskId },
            data: { status: newStatus },
        });
    }
    async findCalls(orgId = 'ORG001') {
        return this.prisma.callLog.findMany({
            where: { organization_id: orgId },
            orderBy: { created_at: 'desc' },
        });
    }
    async createCall(data, orgId = 'ORG001') {
        return this.prisma.callLog.create({
            data: {
                organization_id: orgId,
                customer_name: data.customer_name,
                caller_user: data.caller_user || 'Sales Executive',
                duration: data.duration || '5 mins',
                result: data.result || 'Connected',
                notes: data.notes || '',
                date_time: data.date_time || new Date().toLocaleString(),
            },
        });
    }
    async findMeetings(orgId = 'ORG001') {
        return this.prisma.meeting.findMany({
            where: { organization_id: orgId },
            orderBy: { created_at: 'desc' },
        });
    }
    async createMeeting(data, orgId = 'ORG001') {
        return this.prisma.meeting.create({
            data: {
                organization_id: orgId,
                title: data.title,
                date_time: data.date_time || new Date().toLocaleString(),
                participants: data.participants || ['Client', 'Sales Lead'],
                status: 'Scheduled',
                location: data.location || 'Google Meet',
            },
        });
    }
};
exports.ActivitiesService = ActivitiesService;
exports.ActivitiesService = ActivitiesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ActivitiesService);
//# sourceMappingURL=activities.service.js.map