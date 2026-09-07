import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class WorkflowsService {
  constructor(private prisma: PrismaService) {}

  async findAll(orgId: string) {
    return this.prisma.workflow.findMany({
      where: { organization_id: orgId },
      include: { triggers: true, actions: true, executions: true },
      orderBy: { created_at: 'desc' },
    });
  }

  async triggerEvent(orgId: string, event: string, payload: any) {
    const workflows = await this.prisma.workflow.findMany({
      where: { organization_id: orgId, trigger_event: event, is_active: true },
    });

    const executionResults = [];
    for (const wf of workflows) {
      const exec = await this.prisma.workflowExecution.create({
        data: {
          workflow_id: wf.id,
          status: 'Success',
          log_message: `Triggered by event '${event}' with payload summary.`,
        },
      });
      executionResults.push(exec);
    }
    return { triggeredWorkflows: workflows.length, executions: executionResults };
  }
}
