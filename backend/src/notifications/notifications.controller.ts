import { Controller, Get } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { TenantOrg } from '../common/decorators/tenant.decorator';

@Controller('notifications')
export class NotificationsController {
  constructor(private notificationsService: NotificationsService) {}

  @Get()
  list(@TenantOrg() orgId: string) {
    return this.notificationsService.getNotifications(orgId);
  }
}
