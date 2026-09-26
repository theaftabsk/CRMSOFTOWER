import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Req,
  Ip,
  Headers,
  Query,
} from '@nestjs/common';
import { PublicApiService } from './public-api.service';
import { ExternalApiService } from '../external-api/external-api.service';

@Controller('public')
export class PublicApiController {
  constructor(
    private readonly publicApiService: PublicApiService,
    private readonly externalApiService: ExternalApiService,
  ) {}

  // 1. Fetch form definition for iframe or direct link
  @Get('forms/:id')
  getPublicForm(@Param('id') id: string, @Query('preview') preview?: string) {
    return this.publicApiService.getPublicForm(id, preview === 'true');
  }

  // 2. Submit form (public, anti-spam protected)
  @Post('forms/:id/submit')
  submitPublicForm(
    @Param('id') id: string,
    @Body() body: any,
    @Ip() ip: string,
    @Headers('user-agent') userAgent: string,
  ) {
    return this.publicApiService.submitPublicForm(id, body, ip, userAgent);
  }

  // 3. Sanitized Public Invoice lookup
  @Get('invoices/:token')
  getPublicInvoice(@Param('token') token: string) {
    return this.publicApiService.getPublicInvoice(token);
  }

  // 4. Confirm Payment (Public Checkout / Webhook)
  @Post('invoices/:token/pay')
  confirmPayment(@Param('token') token: string, @Body() body: any) {
    return this.publicApiService.confirmInvoicePayment(token, body);
  }

  // 5. Submit Partner Developer Access Request
  @Post('developer-requests')
  submitDeveloperRequest(@Body() body: any) {
    return this.publicApiService.submitDeveloperRequest(body);
  }

  // 6. Public Self-Booking for Meetings (Calendly style)
  @Post('calendar/book')
  bookPublicMeeting(@Body() body: any) {
    return this.publicApiService.bookPublicMeeting(body);
  }

  // 7. Redeem Partner Single-Sign-On (SSO) Ticket
  @Get('auth/redeem-sso')
  redeemSsoTicket(@Query('ticket') ticket: string) {
    return this.externalApiService.redeemSsoTicket(ticket);
  }

  // 8. Public Website Enquiry Lead Submission (Zero-config website form capture)
  @Post('leads')
  submitWebsiteLead(
    @Body() body: any,
    @Headers('x-org-id') orgIdHeader: string = 'ORG001',
  ) {
    const orgId = body.organization_id || orgIdHeader || 'ORG001';
    return this.externalApiService.createLead(orgId, {
      name: body.name || 'Website Lead',
      email: body.email,
      phone: body.phone || 'N/A',
      company: body.company || 'Website Visitor',
      source: body.source || 'Website Contact Form',
      message: body.message || body.notes,
      service_interest: body.service_interest,
      website_url: body.website_url,
      referrer: body.referrer,
      utm_source: body.utm_source,
      utm_medium: body.utm_medium,
      utm_campaign: body.utm_campaign,
      expected_value: body.expected_value ? Number(body.expected_value) : 0,
    }, 'Public Website Ingestion');
  }
}

