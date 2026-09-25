import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Param,
  Body,
  Query,
} from '@nestjs/common';
import { ContactsService } from './contacts.service';
import { TenantOrg } from '../common/decorators/tenant.decorator';

@Controller('contacts')
export class ContactsController {
  constructor(private contactsService: ContactsService) {}

  @Get('stats')
  getStats(@TenantOrg() orgId: string) {
    return this.contactsService.getStats(orgId);
  }

  @Get()
  findAll(@TenantOrg() orgId: string, @Query() query: any) {
    return this.contactsService.findAll(orgId, query);
  }

  @Post()
  create(@TenantOrg() orgId: string, @Body() dto: any) {
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

  @Get(':id/activities')
  getActivities(@TenantOrg() orgId: string, @Param('id') id: string) {
    return this.contactsService.getActivities(orgId, id);
  }

  @Post(':id/activities')
  addActivity(
    @TenantOrg() orgId: string,
    @Param('id') id: string,
    @Body() body: any,
  ) {
    return this.contactsService.addActivity(orgId, id, body);
  }

  @Delete(':id/activities/:activityId')
  deleteActivity(
    @TenantOrg() orgId: string,
    @Param('id') id: string,
    @Param('activityId') activityId: string,
  ) {
    return this.contactsService.deleteActivity(orgId, id, activityId);
  }
}
