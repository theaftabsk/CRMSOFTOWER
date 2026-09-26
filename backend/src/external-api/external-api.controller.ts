import {
  Controller,
  Get,
  Post,
  Body,
  Req,
  Query,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiKeyGuard } from '../common/guards/api-key.guard';
import { RequireScope } from '../common/decorators/require-scope.decorator';
import { IdempotencyInterceptor } from '../common/interceptors/idempotency.interceptor';
import { ExternalApiService } from './external-api.service';
import { ExternalLeadDto } from './dto/external-lead.dto';

@Controller('external')
@UseGuards(ApiKeyGuard)
@UseInterceptors(IdempotencyInterceptor)
export class ExternalApiController {
  constructor(private readonly externalApiService: ExternalApiService) {}

  // 1. Partner Auth & Connection Handshake
  @Get('auth/verify')
  verifyAuth(@Req() req: any) {
    return this.externalApiService.verifyAuth(req.organizationId, req.apiKey);
  }

  @Post('auth/handshake')
  handshake(@Req() req: any) {
    return this.externalApiService.verifyAuth(req.organizationId, req.apiKey);
  }

  // 2. Partner User Single Sign-On (SSO) Session Generator
  @Post('auth/sso-token')
  @RequireScope('auth:sso')
  generateSsoToken(@Req() req: any, @Body() body: any) {
    return this.externalApiService.generateSsoToken(req.organizationId, req.apiKey, body);
  }

  // 3. Developer Analytics & Activity Stats
  @Get('stats')
  getStats(@Req() req: any) {
    return this.externalApiService.getStats(req.organizationId);
  }

  // 4. Ingest Website Enquiry / External Lead
  @Post('leads')
  @RequireScope('leads:write')
  createLead(@Req() req: any, @Body() dto: ExternalLeadDto) {
    return this.externalApiService.createLead(req.organizationId, dto, req.apiKey?.name);
  }

  @Get('leads')
  @RequireScope('leads:read')
  getLeads(
    @Req() req: any,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
    @Query('source') source?: string,
  ) {
    return this.externalApiService.getLeads(
      req.organizationId,
      limit ? parseInt(limit, 10) : 50,
      offset ? parseInt(offset, 10) : 0,
      source,
    );
  }

  // 5. Deals & Opportunities
  @Post('deals')
  @RequireScope('deals:write')
  createDeal(@Req() req: any, @Body() data: any) {
    return this.externalApiService.createDeal(req.organizationId, data);
  }

  @Get('deals')
  @RequireScope('deals:read')
  getDeals(@Req() req: any, @Query('limit') limit?: string) {
    return this.externalApiService.getDeals(
      req.organizationId,
      limit ? parseInt(limit, 10) : 50,
    );
  }

  // 6. Invoices & Payment Links
  @Post('invoices')
  @RequireScope('invoices:write')
  createInvoice(@Req() req: any, @Body() data: any) {
    return this.externalApiService.createInvoice(req.organizationId, data);
  }

  @Get('invoices')
  @RequireScope('invoices:read')
  getInvoices(@Req() req: any, @Query('limit') limit?: string) {
    return this.externalApiService.getInvoices(
      req.organizationId,
      limit ? parseInt(limit, 10) : 50,
    );
  }
}

