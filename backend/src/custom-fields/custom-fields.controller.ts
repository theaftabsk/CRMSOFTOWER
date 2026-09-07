import { Controller, Get, Post, Body } from '@nestjs/common';
import { CustomFieldsService } from './custom-fields.service';
import { TenantOrg } from '../common/decorators/tenant.decorator';

@Controller('custom-fields')
export class CustomFieldsController {
  constructor(private customFieldsService: CustomFieldsService) {}

  @Get()
  findAll(@TenantOrg() orgId: string) {
    return this.customFieldsService.findAll(orgId);
  }

  @Post()
  create(@TenantOrg() orgId: string, @Body() body: any) {
    return this.customFieldsService.create(orgId, body);
  }
}
