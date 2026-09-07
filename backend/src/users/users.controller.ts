import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { UsersService } from './users.service';
import { TenantOrg } from '../common/decorators/tenant.decorator';

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get()
  list(@TenantOrg() orgId: string) {
    return this.usersService.list(orgId);
  }

  @Post()
  create(@TenantOrg() orgId: string, @Body() body: any) {
    return this.usersService.create(orgId, body);
  }

  @Get(':id')
  getById(@Param('id') id: string) {
    return this.usersService.getById(id);
  }
}
