import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Headers,
} from '@nestjs/common';
import { CommunicationsService } from './communications.service';

@Controller('communications')
export class CommunicationsController {
  constructor(private readonly commsService: CommunicationsService) {}

  @Post('email')
  sendEmail(
    @Headers('x-org-id') orgId: string = 'ORG001',
    @Body() body: any,
  ) {
    return this.commsService.sendEmail(orgId, body);
  }

  @Post('whatsapp')
  sendWhatsApp(
    @Headers('x-org-id') orgId: string = 'ORG001',
    @Body() body: any,
  ) {
    return this.commsService.sendWhatsApp(orgId, body);
  }

  @Get('history/:type/:id')
  getHistory(
    @Headers('x-org-id') orgId: string = 'ORG001',
    @Param('type') entityType: string,
    @Param('id') entityId: string,
  ) {
    return this.commsService.getHistory(orgId, entityType, entityId);
  }
}
