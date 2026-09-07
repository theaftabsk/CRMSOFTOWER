import { Controller, Get, Post, Body, Headers } from '@nestjs/common';
import { AccountsService } from './accounts.service';

@Controller('api/accounts')
export class AccountsController {
  constructor(private readonly accountsService: AccountsService) {}

  @Get()
  async getAccounts(@Headers('x-org-id') orgId?: string) {
    return this.accountsService.findAll(orgId || 'ORG001');
  }

  @Post()
  async createAccount(@Body() body: any, @Headers('x-org-id') orgId?: string) {
    return this.accountsService.create(body, orgId || 'ORG001');
  }
}
