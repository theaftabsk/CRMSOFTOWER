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

@Controller('public')
export class PublicApiController {
  constructor(private readonly publicApiService: PublicApiService) {}

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
}
