import { Controller, Get, Post, Body, Headers } from '@nestjs/common';
import { ContactsService } from './contacts.service';

@Controller('api/contacts')
export class ContactsController {
  constructor(private readonly contactsService: ContactsService) {}

  @Get()
  async getContacts(@Headers('x-org-id') orgId?: string) {
    return this.contactsService.findAll(orgId || 'ORG001');
  }

  @Post()
  async createContact(@Body() body: any, @Headers('x-org-id') orgId?: string) {
    return this.contactsService.create(body, orgId || 'ORG001');
  }
}
