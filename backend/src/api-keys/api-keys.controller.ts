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
import { ApiKeysService } from './api-keys.service';
import { CreateApiKeyDto } from './dto/create-api-key.dto';

@Controller('api-keys')
export class ApiKeysController {
  constructor(private readonly apiKeysService: ApiKeysService) {}

  @Post()
  create(
    @Headers('x-org-id') orgId: string = 'ORG001',
    @Body() dto: CreateApiKeyDto,
  ) {
    return this.apiKeysService.create(orgId, dto);
  }

  @Get()
  findAll(@Headers('x-org-id') orgId: string = 'ORG001') {
    return this.apiKeysService.findAll(orgId);
  }

  @Patch(':id/revoke')
  revoke(
    @Headers('x-org-id') orgId: string = 'ORG001',
    @Param('id') id: string,
  ) {
    return this.apiKeysService.revoke(orgId, id);
  }

  @Delete(':id')
  delete(
    @Headers('x-org-id') orgId: string = 'ORG001',
    @Param('id') id: string,
  ) {
    return this.apiKeysService.delete(orgId, id);
  }

  // Developer Partner Requests
  @Get('requests')
  getRequests(@Headers('x-org-id') orgId: string = 'ORG001') {
    return this.apiKeysService.getRequests(orgId);
  }

  @Post('requests/:id/approve')
  approveRequest(
    @Headers('x-org-id') orgId: string = 'ORG001',
    @Param('id') id: string,
  ) {
    return this.apiKeysService.approveRequest(orgId, id);
  }

  @Post('requests/:id/reject')
  rejectRequest(
    @Headers('x-org-id') orgId: string = 'ORG001',
    @Param('id') id: string,
  ) {
    return this.apiKeysService.rejectRequest(orgId, id);
  }
}
