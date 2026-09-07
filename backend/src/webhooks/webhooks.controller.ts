import { Controller, Get, Post, Body } from '@nestjs/common';
import { WebhooksService } from './webhooks.service';
import { TenantOrg } from '../common/decorators/tenant.decorator';

@Controller('webhooks')
export class WebhooksController {
  constructor(private webhooksService: WebhooksService) {}

  @Get()
  findAll(@TenantOrg() orgId: string) {
    return this.webhooksService.findAll(orgId);
  }

  @Post()
  create(@TenantOrg() orgId: string, @Body() body: any) {
    return this.webhooksService.create(orgId, body);
  }
}
