import { Controller, Get, Post, Put, Patch, Delete, Param, Body } from '@nestjs/common';
import { ContactsService } from './contacts.service';
import { CreateContactDto } from './dto/create-contact.dto';
import { TenantOrg } from '../common/decorators/tenant.decorator';

@Controller('contacts')
export class ContactsController {
  constructor(private contactsService: ContactsService) {}

  @Get()
  findAll(@TenantOrg() orgId: string) {
    return this.contactsService.findAll(orgId);
  }

  @Post()
  create(@TenantOrg() orgId: string, @Body() dto: CreateContactDto) {
    return this.contactsService.create(orgId, dto);
  }

  @Get(':id')
  findOne(@TenantOrg() orgId: string, @Param('id') id: string) {
    return this.contactsService.findOne(orgId, id);
  }

  @Put(':id')
  updatePut(@TenantOrg() orgId: string, @Param('id') id: string, @Body() body: any) {
    return this.contactsService.update(orgId, id, body);
  }

  @Patch(':id')
  updatePatch(@TenantOrg() orgId: string, @Param('id') id: string, @Body() body: any) {
    return this.contactsService.update(orgId, id, body);
  }

  @Delete(':id')
  remove(@TenantOrg() orgId: string, @Param('id') id: string) {
    return this.contactsService.remove(orgId, id);
  }
}
