import { Controller, Get, Post, Put, Patch, Delete, Param, Body } from '@nestjs/common';
import { AccountsService } from './accounts.service';
import { CreateAccountDto } from './dto/create-account.dto';
import { TenantOrg } from '../common/decorators/tenant.decorator';

@Controller('accounts')
export class AccountsController {
  constructor(private accountsService: AccountsService) {}

  @Get()
  findAll(@TenantOrg() orgId: string) {
    return this.accountsService.findAll(orgId);
  }

  @Post()
  create(@TenantOrg() orgId: string, @Body() dto: CreateAccountDto) {
    return this.accountsService.create(orgId, dto);
  }

  @Get(':id')
  findOne(@TenantOrg() orgId: string, @Param('id') id: string) {
    return this.accountsService.findOne(orgId, id);
  }

  @Put(':id')
  updatePut(@TenantOrg() orgId: string, @Param('id') id: string, @Body() body: any) {
    return this.accountsService.update(orgId, id, body);
  }

  @Patch(':id')
  updatePatch(@TenantOrg() orgId: string, @Param('id') id: string, @Body() body: any) {
    return this.accountsService.update(orgId, id, body);
  }

  @Delete(':id')
  remove(@TenantOrg() orgId: string, @Param('id') id: string) {
    return this.accountsService.remove(orgId, id);
  }
}
