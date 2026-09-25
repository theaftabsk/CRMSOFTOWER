import {
  Controller,
  Get,
  Post,
  Delete,
  Patch,
  Body,
  Param,
  Headers,
} from '@nestjs/common';
import { WebhooksService } from './webhooks.service';

@Controller('webhooks')
export class WebhooksController {
  constructor(private readonly webhooksService: WebhooksService) {}

  @Get()
  findAll(@Headers('x-org-id') orgId: string = 'ORG001') {
    return this.webhooksService.findAll(orgId);
  }

  @Post()
  create(
    @Headers('x-org-id') orgId: string = 'ORG001',
    @Body() body: any,
  ) {
    return this.webhooksService.create(orgId, body);
  }

  @Patch(':id/toggle')
  toggle(
    @Headers('x-org-id') orgId: string = 'ORG001',
    @Param('id') id: string,
  ) {
    return this.webhooksService.toggleActive(orgId, id);
  }

  @Post(':id/test')
  testPing(
    @Headers('x-org-id') orgId: string = 'ORG001',
    @Param('id') id: string,
  ) {
    return this.webhooksService.testPing(orgId, id);
  }

  @Delete(':id')
  delete(
    @Headers('x-org-id') orgId: string = 'ORG001',
    @Param('id') id: string,
  ) {
    return this.webhooksService.delete(orgId, id);
  }
}
